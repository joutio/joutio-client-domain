import type { ApiError } from '../api-types/api-error.js'
import type { MeView, PlanLimitsView } from '../api-types/bff.js'
import { CREATION_LIMITS } from '../authoring/limits.js'

/**
 * Limites du plan (premium/specs/entitlements.md § 4-5). **Le BFF les applique** (`DuelLimitPolicy`,
 * `TopicCreationLimitPolicy`) et les expose dans `MeView.limits` ; les valeurs par défaut ci-dessous ne servent que de
 * repli (BFF antérieur à 2.2) et pour annoncer ce que Premium débloque.
 */

/** Valeur renvoyée par le BFF pour une limite désactivée (`Integer.MAX_VALUE`). */
export const UNLIMITED = 2_147_483_647

export const isUnlimited = (limit: number) => limit >= UNLIMITED

/** Défauts du BFF (`joutio.duel.limits.*`) : les salons bot sont un garde-fou anti-spam, identique pour tous (P22). */
export const DUEL_LIMITS = {
  free: { pendingChallenges: 5, openRooms: 5, botRooms: 5 },
  premium: { pendingChallenges: 20, openRooms: 20, botRooms: 5 },
} as const

/** Limites par défaut d'un plan. */
export const defaultPlanLimits = (premium: boolean): PlanLimitsView => {
  const duel = premium ? DUEL_LIMITS.premium : DUEL_LIMITS.free
  const creation = premium ? CREATION_LIMITS.premium : CREATION_LIMITS.free
  return { ...duel, publishedTopics: creation.topics, questionsPerTopic: creation.questions }
}

/** Ce que Premium débloque, pour les accroches et la liste des avantages. */
export const PREMIUM_LIMITS: PlanLimitsView = defaultPlanLimits(true)

type PlanSource = Pick<MeView, 'premium' | 'limits'> | null | undefined

/** Limites effectives du joueur : `MeView.limits`, sinon les défauts de son plan (gratuit tant que `me` manque). */
export const planLimits = (me: PlanSource): PlanLimitsView => me?.limits ?? defaultPlanLimits(me?.premium ?? false)

/**
 * Sujets gelés (P21) : un créateur sans Premium qui a plus de sujets publiés que son plafond ne peut plus modifier
 * aucun de ses sujets publiés ni leurs questions, jusqu'à dépublier ou repasser Premium. Le BFF le vérifie aussi
 * (`topic:overQuota`) ; ce calcul sert à l'afficher avant l'action.
 */
export const isFrozen = (me: PlanSource, publishedTopics: number) =>
  !!me && !me.premium && publishedTopics > planLimits(me).publishedTopics

/** Problèmes RFC 7807 des limites du plan (`BffProblems`). */
export const QUOTA_PROBLEMS = {
  topics: 'urn:joutio:bff:topic:quotaExceeded',
  questions: 'urn:joutio:bff:question:quotaExceeded',
  frozen: 'urn:joutio:bff:topic:overQuota',
  challenges: 'urn:joutio:bff:challenge:quotaExceeded',
  rooms: 'urn:joutio:bff:room:quotaExceeded',
} as const

export type QuotaProblem = keyof typeof QUOTA_PROBLEMS

const asError = (error: unknown): Partial<ApiError> | null =>
  typeof error === 'object' && error !== null ? (error as Partial<ApiError>) : null

/** Limite atteinte d'après une erreur du BFF, ou `null` si ce n'en est pas une. */
export const quotaProblemOf = (error: unknown): QuotaProblem | null => {
  const type = asError(error)?.type
  const entry = Object.entries(QUOTA_PROBLEMS).find(([, urn]) => urn === type)
  return entry ? (entry[0] as QuotaProblem) : null
}

/** Valeur `context.limit` d'une erreur de limite, si le BFF l'a fournie. */
export const problemLimit = (error: unknown): number | null => {
  const limit = asError(error)?.context?.limit
  return typeof limit === 'number' ? limit : null
}

/** Raisons d'ouvrir la feuille Premium (`design/specs/screens/premium.md` § 2). */
export type PremiumReason = 'quota' | 'topics' | 'questions' | 'team' | 'frozen'

/** Raison de la feuille Premium pour une erreur de limite. */
export const premiumReasonOf = (problem: QuotaProblem): PremiumReason =>
  problem === 'challenges' || problem === 'rooms' ? 'quota' : problem

/** Accroche de la feuille Premium, chiffrée avec les limites du joueur (français ; le web passe par son i18n). */
export const limitReason = (reason: PremiumReason, limits: PlanLimitsView, premium: PlanLimitsView = PREMIUM_LIMITS) => {
  switch (reason) {
    case 'quota':
      return `Tu as atteint ${limits.pendingChallenges} défis ouverts. Premium monte la limite à ${premium.pendingChallenges}.`
    case 'topics':
      return limits.publishedTopics === 1
        ? `Tu as publié ton sujet gratuit. Premium t'en donne ${premium.publishedTopics}.`
        : `Tu as publié ${limits.publishedTopics} sujets. Premium t'en donne ${premium.publishedTopics}.`
    case 'questions':
      return `Tu as atteint ${limits.questionsPerTopic} questions. Premium monte la limite à ${premium.questionsPerTopic}.`
    case 'team':
      return 'Invite des rédacteurs et des administrateurs avec Premium.'
    case 'frozen':
      return `Tes sujets publiés sont gelés. Premium les débloque, jusqu'à ${premium.publishedTopics}.`
  }
}
