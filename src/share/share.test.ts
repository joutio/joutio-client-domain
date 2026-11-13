import { describe, expect, it } from 'vitest'
import { buildShareUrl, displayShareUrl, nextRecruiterTier, normalizeReferralCode, parseShareUrl } from './index.js'

describe('share links', () => {
  it('builds universal links with the sharer referral code', () => {
    expect(buildShareUrl({ kind: 'profile', id: 'Sofia_R', ref: 'NADJ7K' })).toBe('https://go.joutio.com/p/Sofia_R?ref=NADJ7K')
    expect(buildShareUrl({ kind: 'room', id: 'x7k2' })).toBe('https://go.joutio.com/j/x7k2')
    expect(buildShareUrl({ kind: 'invite', id: 'NADJ7K', ref: 'NADJ7K' })).toBe('https://go.joutio.com/i/NADJ7K')
    expect(displayShareUrl('https://go.joutio.com/t/abc')).toBe('go.joutio.com/t/abc')
  })

  it('parses universal links, legacy room links and app paths', () => {
    expect(parseShareUrl('https://go.joutio.com/p/Sofia_R?ref=NADJ7K')).toEqual({ kind: 'profile', id: 'Sofia_R', ref: 'NADJ7K' })
    expect(parseShareUrl('/t/rois-de-france')).toEqual({ kind: 'topic', id: 'rois-de-france', ref: null })
    expect(parseShareUrl('https://joutio.com/join/x7k2')).toEqual({ kind: 'room', id: 'x7k2', ref: null })
    expect(parseShareUrl('joutio://join/x7k2')).toEqual({ kind: 'room', id: 'x7k2', ref: null })
    expect(parseShareUrl('https://joutio.com/join/?room=x7k2&ref=NADJ7K')).toEqual({ kind: 'room', id: 'x7k2', ref: 'NADJ7K' })
    expect(parseShareUrl('https://go.joutio.com/i/NADJ7K')).toEqual({ kind: 'invite', id: 'NADJ7K', ref: null })
    expect(parseShareUrl('https://joutio.com/faq')).toBeNull()
  })

  it('normalizes referral codes', () => {
    expect(normalizeReferralCode(' nadj 7k ')).toBe('NADJ7K')
    expect(normalizeReferralCode('NADJ0K')).toBeNull()
    expect(normalizeReferralCode(undefined)).toBeNull()
  })

  it('finds the next recruiter tier', () => {
    expect(nextRecruiterTier(0)).toBe(1)
    expect(nextRecruiterTier(2)).toBe(5)
    expect(nextRecruiterTier(25)).toBeNull()
  })
})
