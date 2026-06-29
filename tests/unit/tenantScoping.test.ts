import { readdirSync, readFileSync } from 'fs'
import { join } from 'path'
import { describe, expect, it } from 'vitest'

// structural guardrail: multi-tenant isolation depends on every model that reads
// or writes a company-scoped table filtering by companyId. this asserts that
// discipline mechanically — a new model on a tenant table that forgets the
// `where(eq(table.companyId, ...))` fails here instead of leaking across tenants.

const MODELS_DIR = join(process.cwd(), 'server/models')

// models that operate on tables without a company_id column. each is scoped by
// a different key (the tenant root itself, a user id, or a token), or is global.
const NON_TENANT_MODELS = new Set([
  'companyModel.ts', // the tenant root
  'oauthAccountModel.ts', // user-scoped
  'passwordResetTokenModel.ts', // token-scoped
  'planModel.ts', // global plans catalog
  'userTotpModel.ts', // user-scoped
])

describe('multi-tenant model scoping', () => {
  const files = readdirSync(MODELS_DIR).filter(f => f.endsWith('.ts'))

  it('finds the model directory', () => {
    expect(files.length).toBeGreaterThan(0)
  })

  for (const file of files) {
    if (NON_TENANT_MODELS.has(file)) continue

    it(`${file} scopes queries by companyId`, () => {
      const source = readFileSync(join(MODELS_DIR, file), 'utf8')
      expect(source, `${file} must filter by companyId or be added to NON_TENANT_MODELS with a reason`).toContain('companyId')
    })
  }

  it('keeps the non-tenant allowlist honest', () => {
    // an allowlisted model that starts scoping by companyId should leave the list
    for (const file of NON_TENANT_MODELS) {
      const source = readFileSync(join(MODELS_DIR, file), 'utf8')
      expect(source, `${file} now references companyId — remove it from NON_TENANT_MODELS`).not.toContain('companyId')
    }
  })
})
