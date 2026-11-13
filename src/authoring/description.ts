import type { TopicCardView } from '../api-types/bff.js'

/** Longueur maximale d'une description (`TopicRules.MAX_DESCRIPTION_LENGTH`). */
export const MAX_DESCRIPTION = 500

/** Langues saisissables d'une description, comme le nom d'un sujet. */
export type DescriptionLanguage = 'fr' | 'en'

/**
 * Description d'un sujet dans `language` (2026-11-13), sinon la française, sinon `null`. Un BFF antérieur à la
 * description localisée n'envoie que `description` (française).
 */
export function topicDescription(topic: Pick<TopicCardView, 'description' | 'descriptions'>, language: string = 'fr'): string | null {
  const descriptions = topic.descriptions ?? {}
  const value = descriptions[language] ?? descriptions.fr ?? topic.description
  return value && value.trim() !== '' ? value : null
}

/** Descriptions saisies dans l'atelier, une par langue (vide : absente). */
export function descriptionsDraft(topic: Pick<TopicCardView, 'description' | 'descriptions'>): Record<DescriptionLanguage, string> {
  const descriptions = topic.descriptions ?? {}
  return { fr: descriptions.fr ?? topic.description ?? '', en: descriptions.en ?? '' }
}
