import { describe, expect, it } from 'vitest'
import { applyRoomNotification, emptyRoom, preparationComplete, preparationStep, roomFailureKind, waitingStatusLabel } from './room.js'
import { applyMatchmakingNotification, emptyMatchmaking } from './matchmaking.js'
import type { RoomNotification } from './room-notification.js'

const fold = (notifications: RoomNotification[]) => notifications.reduce(applyRoomNotification, emptyRoom('r1'))

const created: RoomNotification = { type: 'ROOM_CREATED', roomId: 'r1', topicId: 't1', initiatorId: 'p1', opponentId: null, vsBot: false, expiresAt: '2026-11-11T10:02:00Z' }

describe('applyRoomNotification', () => {
  it('tracks presence, then each preparation step up to the game', () => {
    const room = fold([
      created,
      { type: 'ROOM_ENTERED', roomId: 'r1', playerId: 'p1' },
      { type: 'ROOM_ENTERED', roomId: 'r1', playerId: 'p2' },
      { type: 'ROOM_ALL_PRESENT', roomId: 'r1' },
      { type: 'ROOM_PLAYERS_LOADED', roomId: 'r1' },
      { type: 'ROOM_PLAYED_QUESTIONS_LOADED', roomId: 'r1' },
      { type: 'ROOM_QUESTIONS_LOADED', roomId: 'r1' },
      { type: 'ROOM_GAME_CREATED', roomId: 'r1', gameId: 'g1' },
    ])
    expect(room.participantId).toBe('p2')
    expect(room.initiatorPresent && room.participantPresent).toBe(true)
    expect(room.status).toBe('GAME_CREATED')
    expect(room.gameId).toBe('g1')
    expect(preparationComplete(room.status)).toBe(true)
  })

  it('keeps the room open when a player leaves', () => {
    const room = fold([created, { type: 'ROOM_ENTERED', roomId: 'r1', playerId: 'p1' }, { type: 'ROOM_LEFT', roomId: 'r1', playerId: 'p1' }])
    expect(room.status).toBe('WAITING_PLAYERS')
    expect(room.initiatorPresent).toBe(false)
  })
})

describe('room failure', () => {
  it('keeps the server reason of a failed room', () => {
    const room = fold([{ type: 'ROOM_FAILED', roomId: 'r1', reason: 'TOPIC_NOT_AVAILABLE_IN_LANGUAGE' }])
    expect(room.status).toBe('FAILED')
    expect(room.failureReason).toBe('TOPIC_NOT_AVAILABLE_IN_LANGUAGE')
    expect(emptyRoom('r2').failureReason).toBeNull()
  })

  it('maps reasons to the message to show', () => {
    expect(roomFailureKind('TOPIC_NOT_AVAILABLE_IN_LANGUAGE')).toBe('language')
    expect(roomFailureKind('TOPIC_UNAVAILABLE')).toBe('topic')
    expect(roomFailureKind('QUESTION_DRAW_TIMEOUT')).toBe('timeout')
    expect(roomFailureKind('QUESTION_DRAW_FAILED')).toBe('unknown')
    expect(roomFailureKind(null)).toBe('unknown')
  })
})

describe('preparation', () => {
  it('maps server statuses to the four steps', () => {
    expect(preparationStep('WAITING_PLAYERS')).toBe(0)
    expect(preparationStep('FETCHING_QUESTIONS')).toBe(2)
    expect(preparationStep('GAME_CREATED')).toBe(3)
    expect(preparationStep('COMPLETED')).toBe(4)
  })

  it('names who the room waits for', () => {
    expect(waitingStatusLabel({ playerPresent: true, opponentPresent: true, opponentLabel: 'Sofia R.' })).toBe('Les deux joueurs sont là')
    expect(waitingStatusLabel({ playerPresent: true, opponentPresent: false, opponentLabel: 'Sofia R.' })).toBe('En attente de Sofia R.')
    expect(waitingStatusLabel({ playerPresent: true, opponentPresent: false, opponentLabel: null })).toBe("En attente d'un adversaire")
  })
})

describe('applyMatchmakingNotification', () => {
  it('goes from searching to matched', () => {
    const searching = applyMatchmakingNotification(emptyMatchmaking('m1'), { type: 'SEARCHING', ticketId: 'm1', topicId: 't1', deadlineAt: '2026-11-11T10:00:10Z' })
    expect(searching.deadlineAt).toBe('2026-11-11T10:00:10Z')
    const matched = applyMatchmakingNotification(searching, { type: 'MATCHED', ticketId: 'm1', roomId: 'r1', opponentId: 'p2', vsBot: false, opponent: null })
    expect(matched.status).toBe('MATCHED')
    expect(matched.roomId).toBe('r1')
  })
})
