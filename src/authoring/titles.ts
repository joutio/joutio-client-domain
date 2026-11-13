import type { MasteryTier } from '../api-types/bff.js'

/**
 * Titres thématiques par palier (`creation.md` § Titres, `titres.md`) : le créateur d'un sujet nomme librement chaque
 * palier de maîtrise, en français et en anglais. Un palier sans libellé retombe sur le repli « Or · Sujet ».
 * Règles miroir de `TopicTitles` (`joutio-theme-domain`) : paliers connus, libellé non vide, 40 caractères au plus.
 */

/** Paliers de maîtrise, du premier au dernier. */
export const MASTERY_TIERS: readonly MasteryTier[] = ['FER', 'BRONZE', 'ARGENT', 'OR', 'PLATINE', 'EMERAUDE', 'DIAMANT']

/** Longueur maximale d'un titre (`TopicTitles.MAX_LABEL_LENGTH`). */
export const TITLE_MAX_LENGTH = 40

/** Langues de saisie des titres, dans l'ordre des onglets. */
export const TITLE_LANGUAGES = ['fr', 'en'] as const
export type TitleLanguage = (typeof TITLE_LANGUAGES)[number]

/** Libellés français des paliers (repli « Or · Sujet »). */
export const MASTERY_TIER_LABELS: Record<MasteryTier, string> = {
  FER: 'Fer',
  BRONZE: 'Bronze',
  ARGENT: 'Argent',
  OR: 'Or',
  PLATINE: 'Platine',
  EMERAUDE: 'Émeraude',
  DIAMANT: 'Diamant',
}

/** Titres d'un sujet : langue (`fr`, `en`) → palier → libellé. */
export type TopicTitles = Record<string, Record<string, string>>

/** Corps de `PUT /api/topics/{id}/titles` ; `null` efface tous les titres (repli partout). */
export interface UpdateTopicTitlesRequest {
  titles: TopicTitles | null
}

/** Titre saisi pour un palier, dans la langue demandée, sinon en français ; `null` sans titre. */
export function customTitle(titles: TopicTitles | null | undefined, tier: MasteryTier, language = 'fr'): string | null {
  const label = titles?.[language]?.[tier] ?? titles?.fr?.[tier]
  return label && label.trim() !== '' ? label : null
}

/** Libellé affiché d'un titre : titre saisi, sinon « Or · Sujet ». */
export function titleLabel(titles: TopicTitles | null | undefined, tier: MasteryTier, topicName: string, language = 'fr'): string {
  return customTitle(titles, tier, language) ?? `${MASTERY_TIER_LABELS[tier]} · ${topicName}`
}

/** Nombre de paliers qui ont au moins un titre saisi (« 3/7 personnalisés »). */
export function customizedTierCount(titles: TopicTitles | null | undefined): number {
  return MASTERY_TIERS.filter((tier) => TITLE_LANGUAGES.some((language) => (titles?.[language]?.[tier] ?? '').trim() !== '')).length
}

/** Brouillon de la feuille Titres : toutes les langues et tous les paliers, vides par défaut. */
export function titlesDraft(titles: TopicTitles | null | undefined): Record<TitleLanguage, Record<MasteryTier, string>> {
  const draft = {} as Record<TitleLanguage, Record<MasteryTier, string>>
  for (const language of TITLE_LANGUAGES) {
    draft[language] = {} as Record<MasteryTier, string>
    for (const tier of MASTERY_TIERS) draft[language][tier] = titles?.[language]?.[tier] ?? ''
  }
  return draft
}

/** Premier titre trop long du brouillon, ou `null`. */
export function tooLongTitle(draft: Record<string, Record<string, string>>): { language: string; tier: MasteryTier } | null {
  for (const language of Object.keys(draft)) {
    for (const tier of MASTERY_TIERS) {
      if ((draft[language]?.[tier] ?? '').trim().length > TITLE_MAX_LENGTH) return { language, tier }
    }
  }
  return null
}

/**
 * Brouillon → corps de requête : libellés taillés, vides retirés (l'agrégat refuse un libellé vide), langues vides
 * retirées ; `null` quand plus rien n'est saisi (retour au repli partout).
 */
export function normalizeTitles(draft: Record<string, Record<string, string>>): TopicTitles | null {
  const result: TopicTitles = {}
  for (const language of Object.keys(draft)) {
    const tiers: Record<string, string> = {}
    for (const tier of MASTERY_TIERS) {
      const label = (draft[language]?.[tier] ?? '').trim()
      if (label !== '') tiers[tier] = label
    }
    if (Object.keys(tiers).length > 0) result[language] = tiers
  }
  return Object.keys(result).length > 0 ? result : null
}

/** Vrai quand le brouillon diffère des titres enregistrés (bouton Enregistrer). */
export function titlesChanged(saved: TopicTitles | null | undefined, draft: Record<string, Record<string, string>>): boolean {
  return JSON.stringify(normalizeTitles(titlesDraft(saved))) !== JSON.stringify(normalizeTitles(draft))
}
