import { describe, expect, it } from 'vitest'
import { COUNTRY_CODES, countryFlag, countryName, isCountryCode, regionOfLocale, searchCountries, sortedCountries, suggestedCountries } from './index.js'

describe('country', () => {
  it('covers the 249 assigned ISO codes', () => {
    expect(COUNTRY_CODES).toHaveLength(249)
    expect(isCountryCode('FR')).toBe(true)
    expect(isCountryCode('fr')).toBe(false)
    expect(isCountryCode('ZZ')).toBe(false)
  })

  it('names a country in the interface language', () => {
    expect(countryName('FR')).toBe('France')
    expect(countryName('de', 'en')).toBe('Germany')
    expect(countryName('DE', 'fr-FR')).toBe('Allemagne')
    expect(countryName('ZZ')).toBe('ZZ')
  })

  it('builds the flag emoji', () => {
    expect(countryFlag('fr')).toBe('🇫🇷')
    expect(countryFlag('F')).toBe('')
  })

  it('sorts by name ignoring accents', () => {
    const names = sortedCountries('fr').map(({ name }) => name)
    expect(names.indexOf('Égypte')).toBeLessThan(names.indexOf('Espagne'))
    expect(names.indexOf('Équateur')).toBeGreaterThan(names.indexOf('Émirats arabes unis'))
  })

  it('searches without accents, by code and by the other language', () => {
    expect(searchCountries('algerie')[0]?.code).toBe('DZ')
    expect(searchCountries('BE')[0]?.code).toBe('BE')
    expect(searchCountries('germany').map(({ code }) => code)).toContain('DE')
    expect(searchCountries('cote d\'iv')[0]?.code).toBe('CI')
    expect(searchCountries('atlantide')).toEqual([])
    expect(searchCountries('')).toHaveLength(249)
  })

  it('puts the device country first in suggestions', () => {
    expect(regionOfLocale('fr-CA')).toBe('CA')
    expect(regionOfLocale('en_GB')).toBe('GB')
    expect(regionOfLocale('fr')).toBeNull()
    expect(suggestedCountries('ca')).toEqual(['CA', 'FR', 'BE', 'CH', 'MA', 'DZ', 'SN'])
    expect(suggestedCountries(null)[0]).toBe('FR')
  })
})
