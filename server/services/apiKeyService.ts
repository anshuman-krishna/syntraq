import { randomBytes } from 'crypto'
import { hash, verify } from '@node-rs/argon2'
import { generateId } from '../../shared/utils/id'
import { apiKeyModel } from '../models/apiKeyModel'
import { AppError } from './authService'

// owasp-recommended argon2id parameters (memory-limited server).
// revisit yearly against https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
const ARGON2_OPTIONS = {
  memoryCost: 19456,
  timeCost: 2,
  outputLen: 32,
  parallelism: 1,
}

const KEY_PREFIX_LENGTH = 8
const KEY_LENGTH = 32

function generateRawKey(): string {
  return randomBytes(KEY_LENGTH).toString('base64url')
}

function extractPrefix(key: string): string {
  return key.slice(0, KEY_PREFIX_LENGTH)
}

export interface ApiKeyPermissions {
  employees?: boolean
  shifts?: boolean
  vehicles?: boolean
  workflows?: boolean
}

export const apiKeyService = {
  async create(companyId: string, name: string, permissions: ApiKeyPermissions = {}) {
    if (!name.trim()) {
      throw new AppError('api key name is required', 400)
    }

    const rawKey = generateRawKey()
    const prefix = extractPrefix(rawKey)
    const keyHash = await hash(rawKey, ARGON2_OPTIONS)

    const record = apiKeyModel.create({
      id: generateId(),
      companyId,
      name: name.trim(),
      keyHash,
      keyPrefix: prefix,
      permissions: JSON.stringify(permissions),
    })

    return {
      id: record.id,
      name: record.name,
      key: rawKey,
      prefix,
      permissions,
      createdAt: record.createdAt,
    }
  },

  list(companyId: string) {
    return apiKeyModel.findAll(companyId).map(k => ({
      id: k.id,
      name: k.name,
      prefix: k.keyPrefix,
      permissions: JSON.parse(k.permissions) as ApiKeyPermissions,
      lastUsedAt: k.lastUsedAt,
      createdAt: k.createdAt,
    }))
  },

  async validate(rawKey: string): Promise<{ companyId: string; keyId: string; permissions: ApiKeyPermissions } | null> {
    const prefix = extractPrefix(rawKey)
    const candidates = apiKeyModel.findByPrefix(prefix)

    for (const candidate of candidates) {
      // argon2.verify is constant-time against the hash
      const valid = await verify(candidate.keyHash, rawKey, ARGON2_OPTIONS)
      if (valid) {
        apiKeyModel.updateLastUsed(candidate.id)
        return {
          companyId: candidate.companyId,
          keyId: candidate.id,
          permissions: JSON.parse(candidate.permissions) as ApiKeyPermissions,
        }
      }
    }

    return null
  },

  // strict default-deny: an empty permission set grants nothing.
  // callers that need a legacy admin key must set every resource explicitly.
  hasPermission(permissions: ApiKeyPermissions, resource: string): boolean {
    const key = resource as keyof ApiKeyPermissions
    return permissions[key] === true
  },

  async rotate(id: string, companyId: string) {
    const existing = apiKeyModel.findById(id, companyId)
    if (!existing) {
      throw new AppError('api key not found', 404)
    }

    const rawKey = generateRawKey()
    const prefix = extractPrefix(rawKey)
    const keyHash = await hash(rawKey, ARGON2_OPTIONS)

    apiKeyModel.rotate(id, companyId, keyHash, prefix)

    return {
      id,
      name: existing.name,
      key: rawKey,
      prefix,
      permissions: JSON.parse(existing.permissions) as ApiKeyPermissions,
    }
  },

  revoke(id: string, companyId: string) {
    const existing = apiKeyModel.findById(id, companyId)
    if (!existing) {
      throw new AppError('api key not found', 404)
    }
    apiKeyModel.remove(id, companyId)
    return { success: true }
  },
}
