import { describe, expect, it } from 'vitest'
import { customizedTierCount, customTitle, normalizeTitles, titleLabel, titlesChanged, titlesDraft, tooLongTitle, TITLE_MAX_LENGTH } from './titles.js'

describe('titles', () => {
  const saved = { fr: { OR: 'Connétable', FER: 'Écuyer' }, en: { OR: 'Constable' } }

  it('label falls back to French, then to "tier · topic"', () => {
    expect(titleLabel(saved, 'OR', 'Histoire', 'en')).toBe('Constable')
    expect(titleLabel(saved, 'FER', 'Histoire', 'en')).toBe('Écuyer')
    expect(titleLabel(saved, 'DIAMANT', 'Histoire')).toBe('Diamant · Histoire')
    expect(titleLabel(null, 'EMERAUDE', 'Java')).toBe('Émeraude · Java')
    expect(customTitle({ fr: { OR: '  ' } }, 'OR')).toBeNull()
  })

  it('counts tiers customized in at least one language', () => {
    expect(customizedTierCount(saved)).toBe(2)
    expect(customizedTierCount({ en: { DIAMANT: 'Legend' } })).toBe(1)
    expect(customizedTierCount(null)).toBe(0)
  })

  it('normalizes a draft: trims, drops blanks, null when empty', () => {
    const draft = titlesDraft(saved)
    draft.fr.ARGENT = '  Chevalier  '
    draft.en.OR = ''
    expect(normalizeTitles(draft)).toEqual({ fr: { FER: 'Écuyer', ARGENT: 'Chevalier', OR: 'Connétable' } })
    expect(normalizeTitles(titlesDraft(null))).toBeNull()
  })

  it('detects changes and too long titles', () => {
    const draft = titlesDraft(saved)
    expect(titlesChanged(saved, draft)).toBe(false)
    draft.fr.OR = ' Connétable '
    expect(titlesChanged(saved, draft)).toBe(false)
    draft.en.BRONZE = 'x'.repeat(TITLE_MAX_LENGTH + 1)
    expect(titlesChanged(saved, draft)).toBe(true)
    expect(tooLongTitle(draft)).toEqual({ language: 'en', tier: 'BRONZE' })
  })
})
