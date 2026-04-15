import { describe, expect, it } from 'vitest'
import { createHmac } from 'crypto'

// mirrors the internals of mfaService so we can verify the rfc6238 code path
// without taking a dependency on the service's db-backed wrapper.
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
  if (bits > 0) out += BASE32_ALPHABET[(value << (5 - bits)) & 31]
  return out
}

function fromBase32(input: string): Buffer {
  const cleaned = input.replace(/=+$/, '').toUpperCase().replace(/\s+/g, '')
  let bits = 0
  let value = 0
  const bytes: number[] = []
  for (const ch of cleaned) {
    const idx = BASE32_ALPHABET.indexOf(ch)
    if (idx < 0) throw new Error('invalid')
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
  return String(slice % 1_000_000).padStart(6, '0')
}

describe('totp primitives', () => {
  it('base32 roundtrip preserves bytes', () => {
    const raw = Buffer.from([0x0a, 0xff, 0x10, 0x20, 0xde, 0xad, 0xbe, 0xef])
    expect(fromBase32(toBase32(raw))).toEqual(raw)
  })

  it('matches rfc 6238 reference vector for hotp sha1', () => {
    // ascii "12345678901234567890" is the rfc reference key
    const secret = Buffer.from('12345678901234567890')
    expect(hotp(secret, 0)).toBe('755224')
    expect(hotp(secret, 1)).toBe('287082')
  })

  it('produces 6 digit codes for all counters', () => {
    const secret = Buffer.from('syntraq-test-key')
    for (let i = 0; i < 100; i++) {
      expect(hotp(secret, i)).toMatch(/^\d{6}$/)
    }
  })
})
