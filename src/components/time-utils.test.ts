import { describe, expect, it } from 'vitest'
import type { TimeEntry } from '../types'
import { groupEntriesByDate, toDateString, toLocalDayBounds } from './time-utils'

describe('local date helpers', () => {
  it('serializes dates by the local calendar day', () => {
    expect(toDateString(new Date('2026-03-31T22:30:00.000Z'))).toBe('2026-04-01')
  })

  it('builds ISO query bounds for the full local day', () => {
    expect(toLocalDayBounds('2026-04-01')).toEqual({
      start: '2026-03-31T22:00:00.000Z',
      end: '2026-04-01T21:59:59.999Z',
    })
  })

  it('groups entries by local start date', () => {
    const entry = {
      id: 'entry-1',
      user_id: 'user-1',
      project_id: 'project-1',
      start_time: '2026-03-31T22:30:00.000Z',
      end_time: '2026-03-31T23:30:00.000Z',
      description: null,
      created_at: '2026-03-31T22:30:00.000Z',
      updated_at: '2026-03-31T22:30:00.000Z',
    } satisfies TimeEntry

    const grouped = groupEntriesByDate([entry])

    expect(grouped.get('2026-04-01')).toEqual([entry])
    expect(grouped.has('2026-03-31')).toBe(false)
  })
})
