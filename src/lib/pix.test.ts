import { describe, it, expect } from 'vitest'
import {
  generatePixPayload,
  getPixQrCodeUrl,
  isValidPixKey,
  formatPixKey,
} from './pix'

describe('generatePixPayload', () => {
  it('generates a valid PIX payload with required fields', () => {
    const payload = generatePixPayload({
      key: 'test@example.com',
      merchantName: 'João Silva',
      merchantCity: 'São Paulo',
    })
    // Payload Format Indicator (00) + Point of Initiation (01) + Merchant Account (26)
    expect(payload).toMatch(/^000201/)
    expect(payload).toContain('26')
    expect(payload).toContain('br.gov.bcb.pix')
    expect(payload).toContain('test@example.com')
    expect(payload.length).toBeGreaterThan(50)
  })

  it('includes amount when provided', () => {
    const payload = generatePixPayload({
      key: 'test@example.com',
      amount: 50.0,
      merchantName: 'João',
      merchantCity: 'São Paulo',
    })
    expect(payload).toContain('50.00')
  })

  it('omits amount when not provided', () => {
    const withAmount = generatePixPayload({
      key: 'test@example.com',
      amount: 100.5,
      merchantName: 'João',
      merchantCity: 'São Paulo',
    })
    const withoutAmount = generatePixPayload({
      key: 'test@example.com',
      merchantName: 'João',
      merchantCity: 'São Paulo',
    })
    expect(withAmount).not.toEqual(withoutAmount)
    expect(withAmount).toContain('100.50')
  })

  it('truncates merchant name to 25 chars', () => {
    const longName = 'A'.repeat(50)
    const payload = generatePixPayload({
      key: 'test@example.com',
      merchantName: longName,
      merchantCity: 'BRASIL',
    })
    // Ensure it doesn't contain 50 A's in a row
    expect(payload).not.toContain('A'.repeat(26))
    expect(payload).toContain('A'.repeat(25))
  })

  it('truncates merchant city to 15 chars', () => {
    const longCity = 'B'.repeat(30)
    const payload = generatePixPayload({
      key: 'test@example.com',
      merchantName: 'João',
      merchantCity: longCity,
    })
    expect(payload).not.toContain('B'.repeat(16))
    expect(payload).toContain('B'.repeat(15))
  })

  it('ends with a 4-character uppercase CRC16', () => {
    const payload = generatePixPayload({
      key: 'test@example.com',
      merchantName: 'João',
      merchantCity: 'BRASIL',
    })
    const crc = payload.slice(-4)
    expect(crc).toMatch(/^[0-9A-F]{4}$/)
  })

  it('produces deterministic output for same input', () => {
    const params = {
      key: 'test@example.com',
      amount: 99.99,
      merchantName: 'João Silva',
      merchantCity: 'São Paulo',
    }
    expect(generatePixPayload(params)).toEqual(generatePixPayload(params))
  })

  it('produces different CRC when data changes', () => {
    const p1 = generatePixPayload({
      key: 'key1@example.com',
      merchantName: 'João',
      merchantCity: 'BRASIL',
    })
    const p2 = generatePixPayload({
      key: 'key2@example.com',
      merchantName: 'João',
      merchantCity: 'BRASIL',
    })
    expect(p1.slice(-4)).not.toEqual(p2.slice(-4))
  })

  it('works with CPF as key', () => {
    const payload = generatePixPayload({
      key: '12345678909',
      merchantName: 'João',
      merchantCity: 'BRASIL',
    })
    expect(payload).toContain('12345678909')
  })
})

describe('getPixQrCodeUrl', () => {
  it('returns a QR server URL with encoded payload', () => {
    const url = getPixQrCodeUrl('payload-test')
    expect(url).toContain('api.qrserver.com')
    expect(url).toContain('payload-test')
  })

  it('uses default size of 300x300', () => {
    const url = getPixQrCodeUrl('test')
    expect(url).toContain('size=300x300')
  })

  it('respects custom size', () => {
    const url = getPixQrCodeUrl('test', 500)
    expect(url).toContain('size=500x500')
  })

  it('URL-encodes special characters in payload', () => {
    const url = getPixQrCodeUrl('test with spaces & symbols')
    expect(url).toContain('test%20with%20spaces%20%26%20symbols')
  })
})

describe('isValidPixKey', () => {
  it('validates CPF (11 digits)', () => {
    expect(isValidPixKey('12345678901')).toBe(true)
    expect(isValidPixKey('123.456.789-01')).toBe(true)
  })

  it('validates CNPJ (14 digits)', () => {
    expect(isValidPixKey('12345678000190')).toBe(true)
    expect(isValidPixKey('12.345.678/0001-90')).toBe(true)
  })

  it('validates email', () => {
    expect(isValidPixKey('user@example.com')).toBe(true)
    expect(isValidPixKey('another.user+tag@test.co.br')).toBe(true)
  })

  it('validates phone with +55', () => {
    expect(isValidPixKey('+5511999999999')).toBe(true)
    expect(isValidPixKey('5511999999999')).toBe(true)
  })

  it('validates random key (UUID)', () => {
    expect(isValidPixKey('550e8400-e29b-41d4-a716-446655440000')).toBe(true)
  })

  it('rejects empty string', () => {
    expect(isValidPixKey('')).toBe(false)
  })

  it('rejects invalid formats', () => {
    expect(isValidPixKey('abc')).toBe(false)
    expect(isValidPixKey('123')).toBe(false)
    expect(isValidPixKey('not-an-email')).toBe(false)
  })
})

describe('formatPixKey', () => {
  it('formats CPF as XXX.XXX.XXX-XX', () => {
    expect(formatPixKey('12345678901')).toBe('123.456.789-01')
  })

  it('formats CNPJ as XX.XXX.XXX/XXXX-XX', () => {
    expect(formatPixKey('12345678000190')).toBe('12.345.678/0001-90')
  })

  it('formats phone with +55', () => {
    expect(formatPixKey('5511988887777')).toBe('+55 (11) 98888-7777')
  })

  it('returns email unchanged', () => {
    expect(formatPixKey('user@example.com')).toBe('user@example.com')
  })

  it('returns random key unchanged', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000'
    expect(formatPixKey(uuid)).toBe(uuid)
  })
})
