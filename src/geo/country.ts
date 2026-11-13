import { COUNTRY_CODES, COUNTRY_NAMES_EN, COUNTRY_NAMES_FR, type CountryCode } from './country-names.js'

/**
 * Pays du profil : code ISO 3166-1 alpha-2 strict (`joutio-profile`, `urn:joutio:profile:invalidCountry`). Le libellé
 * se calcule toujours côté client, dans la langue de l'interface (`design/specs/screens/editer-profil.md` § 4).
 */

/** Pays proposés en tête du sélecteur après celui de l'appareil (pays les plus joués). */
export const POPULAR_COUNTRIES: readonly CountryCode[] = ['FR', 'BE', 'CH', 'CA', 'MA', 'DZ', 'SN']

const CODES = new Set<string>(COUNTRY_CODES)

export const isCountryCode = (value: unknown): value is CountryCode => typeof value === 'string' && CODES.has(value)

const namesFor = (language: string) => (language.toLowerCase().startsWith('en') ? COUNTRY_NAMES_EN : COUNTRY_NAMES_FR)

/** Nom du pays dans la langue de l'interface (français par défaut) ; le code tel quel s'il est inconnu. */
export function countryName(code: string, language = 'fr'): string {
  const upper = code.trim().toUpperCase()
  return isCountryCode(upper) ? namesFor(language)[upper] : code
}

/** Drapeau emoji d'un code alpha-2 (symboles d'indicateur régional), rendu par le système. */
export function countryFlag(code: string): string {
  const upper = code.trim().toUpperCase()
  if (!/^[A-Z]{2}$/.test(upper)) return ''
  return String.fromCodePoint(...[...upper].map((letter) => 0x1f1a5 + letter.charCodeAt(0)))
}

/** Forme de comparaison : sans accents, apostrophes et tirets unifiés, minuscules. */
export function foldCountryText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[’']/g, "'")
    .replace(/-/g, ' ')
    .toLowerCase()
    .trim()
}

export interface CountryOption {
  code: CountryCode
  name: string
}

/** Tous les pays, triés par nom dans la langue de l'interface (tri indépendant de l'ICU de la plateforme). */
export function sortedCountries(language = 'fr'): CountryOption[] {
  const names = namesFor(language)
  return COUNTRY_CODES.map((code) => ({ code, name: names[code] })).sort((a, b) => {
    const left = foldCountryText(a.name)
    const right = foldCountryText(b.name)
    return left < right ? -1 : left > right ? 1 : 0
  })
}

/**
 * Recherche sans accents ni casse : sur le nom dans la langue de l'interface, sur le nom dans l'autre langue et sur le
 * code (`fr`, `BE`). Les noms qui commencent par la saisie passent en tête. Saisie vide : tous les pays triés.
 */
export function searchCountries(query: string, language = 'fr'): CountryOption[] {
  const all = sortedCountries(language)
  const needle = foldCountryText(query)
  if (needle === '') return all
  const other = language.toLowerCase().startsWith('en') ? COUNTRY_NAMES_FR : COUNTRY_NAMES_EN
  const starts: CountryOption[] = []
  const contains: CountryOption[] = []
  for (const option of all) {
    const name = foldCountryText(option.name)
    if (option.code.toLowerCase() === needle || name.startsWith(needle)) starts.push(option)
    else if (name.includes(needle) || foldCountryText(other[option.code]).includes(needle)) contains.push(option)
  }
  return [...starts, ...contains]
}

/** Région d'une locale BCP 47 (`fr-FR` → `FR`, `en_GB` → `GB`) ; `null` si absente ou inconnue. */
export function regionOfLocale(locale: string | null | undefined): CountryCode | null {
  const region = locale?.split(/[-_]/).find((part, index) => index > 0 && /^[A-Za-z]{2}$/.test(part))?.toUpperCase()
  return isCountryCode(region) ? region : null
}

/** Suggestions du sélecteur : pays de l'appareil d'abord, puis les pays les plus joués, sans doublon. */
export function suggestedCountries(deviceRegion?: string | null, popular: readonly CountryCode[] = POPULAR_COUNTRIES): CountryCode[] {
  const device = deviceRegion?.toUpperCase()
  const first = isCountryCode(device) ? [device] : []
  return [...new Set<CountryCode>([...first, ...popular])]
}

export const COUNTRY_PROBLEMS = {
  invalid: 'urn:joutio:profile:invalidCountry',
} as const
