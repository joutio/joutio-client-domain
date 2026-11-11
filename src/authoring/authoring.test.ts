import { describe, expect, it } from 'vitest'
import { questionActions, reasonCounts, snapshotDiffers, sortQuestions, todoTotal, workshopRole, type OwnerQuestionReport, type QuestionEditorView, type ReportSnapshot, type TopicPermissions } from './authoring.js'
import type { QuestionReportReason } from '../api-types/bff.js'

/** Repris de `joutio-mobile/tests/authoring.test.cjs`. */
const permissions = (overrides: Pick<TopicPermissions, 'role' | 'canManage'>): TopicPermissions => ({ canContribute: true, canManageTeam: false, canAddMembers: false, ...overrides })
const report = (reasons: QuestionReportReason[]): OwnerQuestionReport => ({ reportId: 'r', reasons, comment: null, language: null, status: 'OPEN', createdAt: '2026-11-01T00:00:00Z' })
const expectEqual = (actual: unknown, expected: unknown) => expect(actual).toEqual(expected)

describe('authoring', () => {
const question = (overrides: Partial<QuestionEditorView> = {}): QuestionEditorView => ({
  questionId: 'q',
  creatorId: 'writer',
  contents: [
    {
      language: 'fr',
      text: 'En quelle année meurt Louis XIV ?',
      answers: [
        { choice: 'A', text: '1715' },
        { choice: 'B', text: '1714' },
        { choice: 'C', text: '1789' },
        { choice: 'D', text: '1815' },
      ],
    },
  ],
  correctAnswer: 'A',
  imageUrl: null,
  status: 'APPROVED',
  suspended: false,
  archived: false,
  openReportCount: 0,
  totalReportCount: 0,
  lastReportedAt: null,
  createdAt: '2026-11-01T10:00:00Z',
  updatedAt: null,
  ...overrides,
})

it('role matrix: managers archive, restore and delete; writers only their own pending or rejected questions', () => {
  expectEqual(questionActions('creator', question(), 'creator'), ['archive', 'delete'])
  expectEqual(questionActions('admin', question({ status: 'ARCHIVED' }), 'admin'), ['restore', 'delete'])
  expectEqual(questionActions('writer', question({ status: 'PENDING' }), 'writer'), ['archive', 'delete'])
  expectEqual(questionActions('writer', question({ status: 'REJECTED' }), 'writer'), ['archive', 'delete'])
  expectEqual(questionActions('writer', question({ status: 'APPROVED' }), 'writer'), [])
  expectEqual(questionActions('writer', question({ status: 'PENDING' }), 'someone-else'), [])
  expectEqual(questionActions('writer', question({ status: 'ARCHIVED' }), 'writer'), [])
})

it('workshop role follows permissions: creator, Premium admin, otherwise writer', () => {
  expectEqual(workshopRole(permissions({ role: 'CREATOR', canManage: true })), 'creator')
  expectEqual(workshopRole(permissions({ role: 'ADMIN', canManage: true })), 'admin')
  expectEqual(workshopRole(permissions({ role: 'ADMIN', canManage: false })), 'writer')
  expectEqual(workshopRole(undefined), 'writer')
})

it('question sorts: recent, most reported, oldest, alphabetical', () => {
  const a = question({ questionId: 'a', createdAt: '2026-11-01T00:00:00Z', openReportCount: 0, contents: [{ language: 'fr', text: 'Zèbre ?', answers: [] }] })
  const b = question({ questionId: 'b', createdAt: '2026-11-03T00:00:00Z', openReportCount: 2, contents: [{ language: 'fr', text: 'Abeille ?', answers: [] }] })
  const c = question({
    questionId: 'c',
    createdAt: '2026-11-02T00:00:00Z',
    openReportCount: 5,
    contents: [{ language: 'fr', text: 'Éléphant ?', answers: [] }],
  })
  const ids = (list: readonly { questionId: string }[]) => list.map((item) => item.questionId)
  expectEqual(ids(sortQuestions([a, b, c], 'Plus récentes')), ['b', 'c', 'a'])
  expectEqual(ids(sortQuestions([a, b, c], 'Plus signalées')), ['c', 'b', 'a'])
  expectEqual(ids(sortQuestions([a, b, c], 'Plus anciennes')), ['a', 'c', 'b'])
  expectEqual(ids(sortQuestions([a, b, c], 'Ordre alphabétique')), ['b', 'c', 'a'])
})

it('reported content differs only when text, answers or the correct answer changed', () => {
  const same: ReportSnapshot = {
    questionText: 'En quelle année meurt Louis XIV ?',
    imageUrl: null,
    answers: question().contents[0].answers,
    correctAnswer: 'A',
    language: 'fr',
  }
  expectEqual(snapshotDiffers(question(), same), false)
  expectEqual(snapshotDiffers(question(), { ...same, correctAnswer: 'B' }), true)
  expectEqual(snapshotDiffers(question(), { ...same, answers: [{ choice: 'A', text: '1714' }, ...same.answers.slice(1)] }), true)
  expectEqual(snapshotDiffers(question(), null), false)
})

it('reason counts sort reasons from most to least cited; todo total ignores suspended', () => {
  const reports = [report(['ANSWERS']), report(['ANSWERS', 'QUESTION'])]
  expectEqual(reasonCounts(reports), [
    ['ANSWERS', 2],
    ['QUESTION', 1],
  ])
  expectEqual(todoTotal({ topicId: 't', pending: 4, reportedQuestions: 2, suspended: 1 }), 6)
  expectEqual(todoTotal(undefined), 0)
})
})
