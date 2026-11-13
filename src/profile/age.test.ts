import { describe, expect, it } from 'vitest'
import { ageOn, birthDateIssue, isoDay } from './age.js'

describe('birth date', () => {
  it('computes the age in full years', () => {
    expect(ageOn('2011-11-13', '2026-11-13')).toBe(15)
    expect(ageOn('2011-11-14', '2026-11-13')).toBe(14)
    expect(ageOn('2012-02-29', '2027-02-28')).toBe(15)
    expect(ageOn('2012-02-29', '2027-02-27')).toBe(14)
  })

  it('reports the first broken rule', () => {
    expect(birthDateIssue(null, '2026-11-13')).toBe('missing')
    expect(birthDateIssue('2026-02-30', '2026-11-13')).toBe('invalid')
    expect(birthDateIssue('2027-01-01', '2026-11-13')).toBe('future')
    expect(birthDateIssue('1900-01-01', '2026-11-13')).toBe('tooOld')
    expect(birthDateIssue('2011-11-14', '2026-11-13')).toBe('underage')
    expect(birthDateIssue('1998-03-04', '2026-11-13')).toBeNull()
  })

  it('formats the local day', () => {
    expect(isoDay(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05')
  })
})
