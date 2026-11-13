/**
 * Code de parrainage (`joutio-identity`, `ReferralRules`) : 6 caractères, alphabet sans 0/O ni 1/I/L. Le serveur
 * reste autoritaire (`PUT /api/me/referral`).
 */
export const REFERRAL_CODE_LENGTH = 6
export const REFERRAL_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

/** Code saisi ou lu dans un lien : espaces retirés, majuscules ; `null` s'il n'a pas la bonne forme. */
export function normalizeReferralCode(value: string | null | undefined): string | null {
  const code = (value ?? '').replace(/\s/g, '').toUpperCase()
  if (code.length !== REFERRAL_CODE_LENGTH) return null
  return [...code].every((char) => REFERRAL_ALPHABET.includes(char)) ? code : null
}

/** Paliers du badge Recruteur : amis qui ont terminé leur premier duel. */
export const RECRUITER_TIERS = [1, 5, 25] as const

/** Prochain palier à atteindre, ou `null` une fois le dernier atteint. */
export function nextRecruiterTier(qualified: number): number | null {
  return RECRUITER_TIERS.find((tier) => qualified < tier) ?? null
}

export const REFERRAL_PROBLEMS = {
  invalid: 'urn:joutio:identity:invalidReferralCode',
  self: 'urn:joutio:identity:selfReferral',
  already: 'urn:joutio:identity:alreadyReferred',
  windowClosed: 'urn:joutio:identity:referralWindowClosed',
} as const
