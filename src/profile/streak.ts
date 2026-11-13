import type { ActivityView } from '../api-types/bff.js'

/** Fuseau de découpage des jours d'activité (`joutio.activity.zone` du BFF, aligné sur `joutio-profile`). */
export const ACTIVITY_ZONE = 'Europe/Paris'

/** Paliers de série annoncés par l'écran de déblocage (le 7e débloque Micah). */
export const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100, 365] as const

/** Prochain palier strictement au-dessus de `days`, ou `undefined` au-delà du dernier. */
export const nextStreakMilestone = (days: number): number | undefined => STREAK_MILESTONES.find((milestone) => milestone > days)

/** `YYYY-MM-DD` de `at` dans le fuseau d'activité. */
export function activityDate(at: Date | number, zone: string = ACTIVITY_ZONE): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(at)
}

const previousDay = (date: string): string => {
  const [year, month, day] = date.split('-').map(Number)
  const utc = new Date(Date.UTC(year ?? 1970, (month ?? 1) - 1, day ?? 1))
  utc.setUTCDate(utc.getUTCDate() - 1)
  return utc.toISOString().slice(0, 10)
}

/**
 * Nouveau jour de série ouvert par la partie classée qui vient de finir (2026-11-13) : le nombre de jours atteints,
 * ou `null` si le joueur avait déjà joué aujourd'hui. Un entraînement contre le bot ne compte pas (`ActivityProjection`) :
 * l'appelant ne demande jamais pour lui.
 *
 * La projection d'activité peut avoir ou non déjà compté la partie :
 * - comptée : aujourd'hui a exactement **une** partie, la série vaut `currentStreak` ;
 * - pas encore : la dernière activité est antérieure à aujourd'hui, la série devient `currentStreak + 1` si c'était
 *   hier, sinon 1.
 */
export function streakDayUnlocked(activity: Pick<ActivityView, 'currentStreak' | 'lastActiveDate' | 'days'>, today: string): number | null {
  if (activity.lastActiveDate === today) {
    const games = activity.days.find((day) => day.date === today)?.games ?? 0
    return games === 1 ? Math.max(1, activity.currentStreak) : null
  }
  if (activity.lastActiveDate && activity.lastActiveDate > today) return null
  return activity.lastActiveDate === previousDay(today) ? activity.currentStreak + 1 : 1
}
