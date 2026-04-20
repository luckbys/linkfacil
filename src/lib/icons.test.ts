import { describe, it, expect } from 'vitest'
import { detectLinkType, getFaviconUrl } from './icons'

describe('detectLinkType', () => {
  it('detects Instagram URLs', () => {
    expect(detectLinkType('https://instagram.com/user')).toBe('instagram')
    expect(detectLinkType('https://www.instagram.com/p/abc123/')).toBe('instagram')
    expect(detectLinkType('https://INSTAGRAM.COM/user')).toBe('instagram')
  })

  it('detects YouTube URLs', () => {
    expect(detectLinkType('https://youtube.com/watch?v=abc')).toBe('youtube')
    expect(detectLinkType('https://www.youtube.com/@user')).toBe('youtube')
    expect(detectLinkType('https://youtu.be/abc123')).toBe('youtube')
  })

  it('detects WhatsApp URLs', () => {
    expect(detectLinkType('https://wa.me/5511999999999')).toBe('whatsapp')
    expect(detectLinkType('https://whatsapp.com/send?phone=123')).toBe('whatsapp')
  })

  it('detects TikTok URLs', () => {
    expect(detectLinkType('https://tiktok.com/@user')).toBe('tiktok')
    expect(detectLinkType('https://www.tiktok.com/@user/video/123')).toBe('tiktok')
  })

  it('detects LinkedIn URLs', () => {
    expect(detectLinkType('https://linkedin.com/in/user')).toBe('linkedin')
    expect(detectLinkType('https://www.linkedin.com/company/test')).toBe('linkedin')
  })

  it('detects GitHub URLs', () => {
    expect(detectLinkType('https://github.com/user')).toBe('github')
    expect(detectLinkType('https://github.com/user/repo')).toBe('github')
  })

  it('detects Facebook URLs', () => {
    expect(detectLinkType('https://facebook.com/user')).toBe('facebook')
    expect(detectLinkType('https://www.facebook.com/page')).toBe('facebook')
  })

  it('detects Twitter and X.com URLs', () => {
    expect(detectLinkType('https://twitter.com/user')).toBe('twitter')
    expect(detectLinkType('https://x.com/user')).toBe('twitter')
  })

  it('detects email URLs', () => {
    expect(detectLinkType('mailto:user@example.com')).toBe('email')
    expect(detectLinkType('user@example.com')).toBe('email')
  })

  it('returns "link" for unknown URLs', () => {
    expect(detectLinkType('https://example.com')).toBe('link')
    expect(detectLinkType('https://mywebsite.com.br')).toBe('link')
    expect(detectLinkType('')).toBe('link')
  })

  it('is case-insensitive for domain matching', () => {
    expect(detectLinkType('https://YouTube.com/watch')).toBe('youtube')
    expect(detectLinkType('https://GitHub.com/user')).toBe('github')
  })
})

describe('getFaviconUrl', () => {
  it('extracts domain and returns unavatar URL', () => {
    expect(getFaviconUrl('https://example.com/path')).toBe('https://unavatar.io/example.com')
  })

  it('handles URLs without protocol', () => {
    expect(getFaviconUrl('example.com/path')).toBe('https://unavatar.io/example.com')
  })

  it('handles http:// protocol', () => {
    expect(getFaviconUrl('http://example.com')).toBe('https://unavatar.io/example.com')
  })

  it('handles https:// protocol', () => {
    expect(getFaviconUrl('https://example.com')).toBe('https://unavatar.io/example.com')
  })

  it('extracts only the domain, not the path', () => {
    expect(getFaviconUrl('https://example.com/very/long/path?q=1'))
      .toBe('https://unavatar.io/example.com')
  })

  it('returns null for mailto links', () => {
    expect(getFaviconUrl('mailto:user@example.com')).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(getFaviconUrl('')).toBeNull()
  })

  it('works with subdomains', () => {
    expect(getFaviconUrl('https://sub.example.com/path'))
      .toBe('https://unavatar.io/sub.example.com')
  })

  it('works with www subdomain', () => {
    expect(getFaviconUrl('https://www.instagram.com/user'))
      .toBe('https://unavatar.io/www.instagram.com')
  })
})
