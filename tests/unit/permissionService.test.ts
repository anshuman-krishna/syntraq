import { describe, expect, it } from 'vitest'
import { apiKeyService } from '../../server/services/apiKeyService'

describe('apiKeyService.hasPermission', () => {
  it('denies when a permission key is missing from the policy', () => {
    expect(apiKeyService.hasPermission({}, 'roster.read')).toBe(false)
  })

  it('grants when the policy explicitly allows the permission', () => {
    expect(apiKeyService.hasPermission({ 'roster.read': true }, 'roster.read')).toBe(true)
  })

  it('denies when the policy explicitly disallows the permission', () => {
    expect(apiKeyService.hasPermission({ 'roster.read': false }, 'roster.read')).toBe(false)
  })

  it('does not leak permissions across keys', () => {
    const policy = { 'roster.read': true }
    expect(apiKeyService.hasPermission(policy, 'roster.write')).toBe(false)
  })
})
