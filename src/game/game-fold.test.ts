import { describe, expect, it } from 'vitest'
import { applyGameNotification, emptyGame } from './game-fold.js'
import { firstAnswerPct, frozenTimeLeft, localizedQuestion, resultOutcome } from './game.js'
import type { GameNotification } from './game-notification.js'
import { MAX_SCORE, ROUND_SECONDS } from './game-constants.js'

const fold = (notifications: GameNotification[]) => notifications.reduce(applyGameNotification, emptyGame('g1'))

const created: GameNotification = {
  type: 'GAME_CREATED',
  gameId: 'g1',
  topicId: 't1',
  player1Id: 'p1',
  player1Name: 'Nadjim',
  player2Id: 'p2',
  player2Name: 'Sofia R.',
  player2Type: 'HUMAN',
  botDifficulty: null,
  questionImageUrls: ['https://media.joutio.com/q1.jpg'],
}

const round: GameNotification = {
  type: 'ROUND_STARTED',
  gameId: 'g1',
  round: '0',
  questionId: 'q1',
  questionText: 'Qui fut surnommé le Roi-Soleil ?',
  imageUrl: null,
  difficulty: 'EASY',
  answers: { A: 'Louis XIII', B: 'Louis XIV', C: 'Louis XV', D: 'Henri IV' },
  translations: { en: { text: 'Who was called the Sun King?', answers: { A: 'Louis XIII', B: 'Louis XIV', C: 'Louis XV', D: 'Henry IV' } } },
  bonus: false,
  shownAt: '2026-11-11T10:00:00.000Z',
  revealAt: '2026-11-11T10:00:01.400Z',
}

describe('applyGameNotification', () => {
  it('builds the game from creation, round and answers', () => {
    const game = fold([
      created,
      round,
      { type: 'QUESTION_REVEALED', gameId: 'g1', round: '0', revealedAt: '2026-11-11T10:00:01.400Z', answerDeadlineAt: '2026-11-11T10:00:11.400Z' },
      { type: 'PLAYER_ANSWERED', gameId: 'g1', round: '0', playerId: 'p1', choice: 'B', correct: true, pointsEarned: 17, answeredAt: '2026-11-11T10:00:04.400Z', timeMs: 3000 },
      { type: 'PLAYER_ANSWERED', gameId: 'g1', round: '0', playerId: 'p2', choice: 'A', correct: false, pointsEarned: 0, answeredAt: '2026-11-11T10:00:06.400Z', timeMs: 5000 },
      { type: 'ROUND_CLOSED', gameId: 'g1', closedRound: '0', nextRound: '1', correctAnswer: 'B', closedAt: '2026-11-11T10:00:06.400Z', nextRoundAt: '2026-11-11T10:00:10.000Z' },
    ])
    expect(game.player1Name).toBe('Nadjim')
    expect(game.questionImageUrls).toEqual(['https://media.joutio.com/q1.jpg'])
    expect(game.player1Score).toBe(17)
    expect(game.player2Score).toBe(0)
    expect(game.rounds['0']?.phase).toBe('CLOSED')
    expect(game.rounds['0']?.correctAnswer).toBe('B')
    expect(frozenTimeLeft(game.rounds['0'] ?? null)).toBe(5)
    expect(firstAnswerPct(game.rounds['0'] ?? null)).toBeCloseTo(70)
  })

  it('takes the authoritative final scores and winner at the end', () => {
    const game = fold([created, { type: 'GAME_ENDED', gameId: 'g1', winnerId: 'p2', player1FinalScore: 80, player2FinalScore: 95 }])
    expect(game.status).toBe('FINISHED')
    expect([game.player1Score, game.player2Score]).toEqual([80, 95])
    expect(resultOutcome(game.winnerId, 'p1')).toBe('loss')
    expect(resultOutcome(null, 'p1')).toBe('draw')
  })

  it('records cancellation and forfeit', () => {
    expect(fold([created, { type: 'GAME_CANCELLED', gameId: 'g1', reason: 'GAME_EXPIRED' }]).status).toBe('CANCELED')
    expect(fold([created, { type: 'GAME_FORFEITED', gameId: 'g1', forfeiterId: 'p2' }]).forfeiterId).toBe('p2')
  })
})

describe('localizedQuestion', () => {
  it('uses the player language and falls back to the source', () => {
    const game = fold([created, round])
    expect(localizedQuestion(game.rounds['0'], 'en').questionText).toBe('Who was called the Sun King?')
    expect(localizedQuestion(game.rounds['0'], 'de').questionText).toBe('Qui fut surnommé le Roi-Soleil ?')
    expect(localizedQuestion(undefined, 'fr')).toEqual({ questionText: '', answers: {} })
  })
})

describe('game constants', () => {
  it('keeps the round budget and the maximum score of a 7-round duel', () => {
    expect(ROUND_SECONDS).toBe(10)
    expect(MAX_SCORE).toBe(6 * 20 + 40)
  })
})
