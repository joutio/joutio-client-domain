import { describe, expect, it } from 'vitest'
import { isValidPseudonym, pseudonymIssue, pseudonymKey } from './pseudonym.js'

describe('pseudonym', () => {
  it('accepts generated and typical pseudonyms', () => {
    expect(isValidPseudonym('SwiftFox42')).toBe(true)
    expect(isValidPseudonym('Ada_Lovelace')).toBe(true)
    expect(isValidPseudonym('abc')).toBe(true)
  })

  it('reports the first broken rule', () => {
    expect(pseudonymIssue('Ab')).toBe('tooShort')
    expect(pseudonymIssue('A'.repeat(21))).toBe('tooLong')
    expect(pseudonymIssue('1Alpha')).toBe('firstLetter')
    expect(pseudonymIssue('_alpha')).toBe('firstLetter')
    expect(pseudonymIssue('Élodie')).toBe('firstLetter')
    expect(pseudonymIssue('Jean Luc')).toBe('characters')
    expect(pseudonymIssue('Zoé42')).toBe('characters')
    expect(pseudonymIssue('Alpha-Beta')).toBe('characters')
  })

  it('normalizes the uniqueness key like the server', () => {
    expect(pseudonymKey('  SwiftFox42 ')).toBe('swiftfox42')
  })
})
