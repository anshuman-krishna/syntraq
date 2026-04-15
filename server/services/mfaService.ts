import { createHash, createHmac, randomBytes, timingSafeEqual } from 'crypto'
import { userTotpModel } from '../models/userTotpModel'

// hand-rolled rfc 6238 totp. we use the standard 30s step, 6-digit code,
// sha1 hmac (authenticator apps default). recovery codes are sha256-hashed
// on disk; only the plaintext list is returned to the user at enroll time.

const STEP_SECONDS = 30
const DIGITS = 6
const WINDOW = 1 // accept +-1 step to absorb clock drift

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

function toBase32(buf: Buffer): string {
  let bits = 0
  let value = 0
  let out = ''
  for (const byte of buf) {
    value = (value << 8) | byte
    bits += 8
    while (bits >= 5) {
      out += BASE32_ALPHABET[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }
  if (bits > 0) {
    out += BASE32_ALPHABET[(value << (5 - bits)) & 31]
  }
  return out
}

function fromBase32(input: string): Buffer {
  const cleaned = input.replace(/=+$/, '').toUpperCase().replace(/\s+/g, '')
  let bits = 0
  let value = 0
  const bytes: number[] = []
  for (const ch of cleaned) {
    const idx = BASE32_ALPHABET.indexOf(ch)
    if (idx < 0) throw new Error('invalid base32')
    value = (value << 5) | idx
    bits += 5
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff)
      bits -= 8
    }
  }
  return Buffer.from(bytes)
}

function hotp(secret: Buffer, counter: number): string {
  const buf = Buffer.alloc(8)
  buf.writeBigUInt64BE(BigInt(counter))
  const mac = createHmac('sha1', secret).update(buf).digest()
  const offset = mac[mac.length - 1]! & 0x0f
  const slice = mac.readUInt32BE(offset) & 0x7fffffff
  const mod = 10 ** DIGITS
  return String(slice % mod).padStart(DIGITS, '0')
}

function currentCounter(now: number): number {
  return Math.floor(now / 1000 / STEP_SECONDS)
}

function hashCode(code: string): string {
  return createHash('sha256').update(code).digest('hex')
}

function safeEqualStr(a: string, b: string): boolean {
  const aBuf = Buffer.from(a)
  const bBuf = Buffer.from(b)
  if (aBuf.length !== bBuf.length) return false
  return timingSafeEqual(aBuf, bBuf)
}

export const mfaService = {
  // start enrollment. returns a base32 secret + otpauth uri for qr rendering.
  // not persisted until verify() confirms the user's first code.
  beginEnroll(userId: string, accountLabel: string, issuer = 'syntraq') {
    const secret = randomBytes(20)
    const base32 = toBase32(secret)
    userTotpModel.upsert({ userId, secret: base32, verifiedAt: null, recoveryCodesHash: null })
    const label = encodeURIComponent(`${issuer}:${accountLabel}`)
    const params = new URLSearchParams({
      secret: base32,
      issuer,
      algorithm: 'SHA1',
      digits: String(DIGITS),
      period: String(STEP_SECONDS),
    })
    return {
      secret: base32,
      otpauthUrl: `otpauth://totp/${label}?${params.toString()}`,
    }
  },

  // verify a code against a stored secret. used for enrollment confirm AND
  // login-time challenge. on first successful verify we stamp verifiedAt and
  // materialise recovery codes.
  verify(userId: string, code: string): { ok: boolean; recoveryCodes?: string[] } {
    const record = userTotpModel.findByUser(userId)
    if (!record) return { ok: false }

    const trimmed = code.trim()
    if (!/^\d{6}$/.test(trimmed)) return { ok: false }

    const secret = fromBase32(record.secret)
    const counter = currentCounter(Date.now())
    for (let w = -WINDOW; w <= WINDOW; w++) {
      if (safeEqualStr(hotp(secret, counter + w), trimmed)) {
        if (!record.verifiedAt) {
          const codes = Array.from({ length: 10 }, () => randomBytes(5).toString('hex'))
          const hashed = codes.map(hashCode).join(',')
          userTotpModel.upsert({
            userId,
            secret: record.secret,
            verifiedAt: new Date(),
            recoveryCodesHash: hashed,
          })
          return { ok: true, recoveryCodes: codes }
        }
        return { ok: true }
      }
    }
    return { ok: false }
  },

  consumeRecoveryCode(userId: string, code: string): boolean {
    const record = userTotpModel.findByUser(userId)
    if (!record?.recoveryCodesHash) return false
    const hashes = record.recoveryCodesHash.split(',').filter(Boolean)
    const target = hashCode(code.trim())
    const idx = hashes.findIndex(h => safeEqualStr(h, target))
    if (idx < 0) return false
    hashes.splice(idx, 1)
    userTotpModel.upsert({
      userId,
      secret: record.secret,
      verifiedAt: record.verifiedAt ?? new Date(),
      recoveryCodesHash: hashes.join(','),
    })
    return true
  },

  status(userId: string) {
    const record = userTotpModel.findByUser(userId)
    if (!record) return { enrolled: false, verified: false, remainingRecoveryCodes: 0 }
    const remaining = record.recoveryCodesHash ? record.recoveryCodesHash.split(',').filter(Boolean).length : 0
    return {
      enrolled: true,
      verified: Boolean(record.verifiedAt),
      remainingRecoveryCodes: remaining,
    }
  },

  disable(userId: string) {
    userTotpModel.remove(userId)
  },
}
