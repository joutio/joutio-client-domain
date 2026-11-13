/**
 * Date de naissance (`joutio-identity`, `BirthDateRules`) : privée, Joutio est réservé aux 15 ans et plus. Dates au
 * format ISO `AAAA-MM-JJ` ; le jour de référence est un paramètre (pas d'horloge implicite). Le serveur reste
 * autoritaire (`PUT /api/me/birth-date`).
 */
export const MIN_AGE = 15
export const MAX_AGE = 120

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/

function parts(iso: string): [number, number, number] | null {
  const match = ISO_DATE.exec(iso)
  if (!match) return null
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])]
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day ? [year, month, day] : null
}

/** Âge révolu au jour `today` ; un né un 29 février a un an de plus le 28 février des années non bissextiles. */
export function ageOn(birthDate: string, today: string): number | null {
  const birth = parts(birthDate)
  const now = parts(today)
  if (!birth || !now) return null
  let age = now[0] - birth[0]
  const leapBirthday = birth[1] === 2 && birth[2] === 29
  const isLeap = (year: number) => (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
  const birthdayDay = leapBirthday && !isLeap(now[0]) ? 28 : birth[2]
  if (now[1] < birth[1] || (now[1] === birth[1] && now[2] < birthdayDay)) age -= 1
  return age
}

export type BirthDateIssue = 'missing' | 'invalid' | 'future' | 'tooOld' | 'underage'

/** Première règle enfreinte, ou `null` si la date est acceptable. */
export function birthDateIssue(birthDate: string | null | undefined, today: string): BirthDateIssue | null {
  if (!birthDate) return 'missing'
  if (!parts(birthDate)) return 'invalid'
  if (birthDate > today) return 'future'
  const age = ageOn(birthDate, today) ?? 0
  if (age > MAX_AGE) return 'tooOld'
  if (age < MIN_AGE) return 'underage'
  return null
}

/** Jour local `AAAA-MM-JJ` d'un instant (date du jour de l'appareil, pour le champ `max` du sélecteur). */
export function isoDay(instant: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${instant.getFullYear()}-${pad(instant.getMonth() + 1)}-${pad(instant.getDate())}`
}

export const BIRTH_DATE_PROBLEMS = {
  invalid: 'urn:joutio:identity:invalidBirthDate',
  underage: 'urn:joutio:identity:underage',
} as const
