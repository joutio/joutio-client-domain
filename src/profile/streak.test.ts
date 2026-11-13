import { describe, expect, it } from 'vitest'
import { activityDate, nextStreakMilestone, streakDayUnlocked } from './streak.js'

const TODAY = '2026-11-13'

describe('streakDayUnlocked', () => {
  it('counts the game once projected: one game today', () => {
    expect(streakDayUnlocked({ currentStreak: 4, lastActiveDate: TODAY, days: [{ date: TODAY, games: 1 }] }, TODAY)).toBe(4)
  })

  it('ignores a second game of the day', () => {
    expect(streakDayUnlocked({ currentStreak: 4, lastActiveDate: TODAY, days: [{ date: TODAY, games: 2 }] }, TODAY)).toBeNull()
  })

  it('anticipates a projection that lags: yesterday extends, older restarts', () => {
    expect(streakDayUnlocked({ currentStreak: 4, lastActiveDate: '2026-11-12', days: [] }, TODAY)).toBe(5)
    expect(streakDayUnlocked({ currentStreak: 4, lastActiveDate: '2026-11-10', days: [] }, TODAY)).toBe(1)
    expect(streakDayUnlocked({ currentStreak: 0, lastActiveDate: null, days: [] }, TODAY)).toBe(1)
  })

  it('crosses month boundaries', () => {
    expect(streakDayUnlocked({ currentStreak: 2, lastActiveDate: '2026-10-31', days: [] }, '2026-11-01')).toBe(3)
  })
})

describe('activity helpers', () => {
  it('formats the activity day in Paris time', () => {
    expect(activityDate(Date.parse('2026-11-12T23:30:00Z'))).toBe('2026-11-13')
  })

  it('finds the next milestone', () => {
    expect(nextStreakMilestone(6)).toBe(7)
    expect(nextStreakMilestone(7)).toBe(14)
    expect(nextStreakMilestone(400)).toBeUndefined()
  })
})
