/**
 * Règles du pseudonyme (2026-11-12), miroir de `ProfileRules` (joutio-profile) : 3 à 20 caractères, lettres ASCII,
 * chiffres ou tiret bas, commençant par une lettre ; unique sans tenir compte de la casse. Le serveur reste
 * autoritaire (`GET /api/profiles/pseudonym-availability`, `urn:joutio:profile:pseudonymInvalid|pseudonymTaken`).
 * Les pseudonymes antérieurs aux règles sont conservés tels quels jusqu'à leur prochain changement.
 */
export const MIN_PSEUDONYM = 3
export const MAX_PSEUDONYM = 20
export const PSEUDONYM_PATTERN = /^[A-Za-z][A-Za-z0-9_]{2,19}$/

/** Première règle enfreinte, dans l'ordre où le joueur la corrige ; `null` si le pseudonyme est valide. */
export type PseudonymIssue = 'tooShort' | 'tooLong' | 'firstLetter' | 'characters'

export function pseudonymIssue(value: string): PseudonymIssue | null {
  if (value.length < MIN_PSEUDONYM) return 'tooShort'
  if (value.length > MAX_PSEUDONYM) return 'tooLong'
  if (!/^[A-Za-z]/.test(value)) return 'firstLetter'
  if (!PSEUDONYM_PATTERN.test(value)) return 'characters'
  return null
}

export const isValidPseudonym = (value: string) => pseudonymIssue(value) === null

/** Clé d'unicité, comme le serveur : insensible à la casse et aux espaces en bord. */
export const pseudonymKey = (value: string) => value.trim().toLowerCase()

/** Problèmes RFC 7807 renvoyés à l'enregistrement. */
export const PSEUDONYM_PROBLEMS = {
  invalid: 'urn:joutio:profile:pseudonymInvalid',
  taken: 'urn:joutio:profile:pseudonymTaken',
} as const
