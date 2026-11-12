import { describe, expect, it } from 'vitest'
import {
  UNLIMITED,
  isFrozen,
  isUnlimited,
  limitReason,
  planLimits,
  premiumReasonOf,
  problemLimit,
  quotaProblemOf,
} from './plan.js'

const limits = { pendingChallenges: 5, openRooms: 5, botRooms: 5, publishedTopics: 1, questionsPerTopic: 30 }

describe('plan limits', () => {
  it('reads MeView.limits first', () => {
    const served = { ...limits, publishedTopics: 3 }
    expect(planLimits({ premium: false, limits: served })).toBe(served)
  })

  it('falls back on plan defaults for an older BFF', () => {
    expect(planLimits({ premium: true })).toEqual({
      pendingChallenges: 20,
      openRooms: 20,
      botRooms: 5,
      publishedTopics: 10,
      questionsPerTopic: 150,
    })
    expect(planLimits(null)).toEqual(limits)
  })

  it('treats Integer.MAX_VALUE as unlimited', () => {
    expect(isUnlimited(UNLIMITED)).toBe(true)
    expect(isUnlimited(150)).toBe(false)
  })
})

describe('frozen topics', () => {
  it('freezes a free creator above the published ceiling', () => {
    expect(isFrozen({ premium: false, limits }, 2)).toBe(true)
  })

  it('does not freeze at the ceiling, for Premium or without me', () => {
    expect(isFrozen({ premium: false, limits }, 1)).toBe(false)
    expect(isFrozen({ premium: true, limits: { ...limits, publishedTopics: 10 } }, 4)).toBe(false)
    expect(isFrozen(null, 4)).toBe(false)
  })
})

describe('quota problems', () => {
  it('recognises BFF quota problems and their limit', () => {
    const error = { message: 'x', type: 'urn:joutio:bff:topic:overQuota', context: { limit: 1, published: 3 } }
    expect(quotaProblemOf(error)).toBe('frozen')
    expect(problemLimit(error)).toBe(1)
    expect(quotaProblemOf({ type: 'urn:joutio:bff:room:quotaExceeded' })).toBe('rooms')
    expect(quotaProblemOf({ type: 'urn:joutio:authorization:accountSuspended' })).toBeNull()
    expect(quotaProblemOf(new Error('boom'))).toBeNull()
    expect(quotaProblemOf(undefined)).toBeNull()
  })

  it('maps duel quotas to the quota reason', () => {
    expect(premiumReasonOf('challenges')).toBe('quota')
    expect(premiumReasonOf('rooms')).toBe('quota')
    expect(premiumReasonOf('questions')).toBe('questions')
  })

  it('words reasons with the player limits', () => {
    expect(limitReason('quota', limits)).toBe('Tu as atteint 5 défis ouverts. Premium monte la limite à 20.')
    expect(limitReason('topics', limits)).toBe("Tu as publié ton sujet gratuit. Premium t'en donne 10.")
    expect(limitReason('questions', { ...limits, questionsPerTopic: 40 })).toContain('40 questions')
    expect(limitReason('frozen', limits)).toContain('gelés')
  })
})
