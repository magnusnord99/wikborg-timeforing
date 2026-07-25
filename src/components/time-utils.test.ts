import { describe, expect, it } from 'vitest'
import type { TimeEntry } from '../types'
import { getLocalDateRange, groupEntriesByDate, toDateString } from './time-utils'

function entryAt(startTime: string): TimeEntry {
  return {
    id: startTime,
    user_id: 'user-1',
    project_id: 'project-1',
    start_time: startTime,
    end_time: '2026-05-14T01:00:00.000Z',
    description: null,
    created_at: startTime,
    updated_at: startTime,
  }
}

describe('time-utils local date handling', () => {
  it('formats dates using the local calendar day', () => {
    expect(toDateString(new Date('2026-05-13T22:30:00.000Z'))).toBe('2026-05-14')
  })

  it('builds explicit ISO bounds for local day queries', () => {
    expect(getLocalDateRange('2026-05-14')).toEqual({
      start: '2026-05-13T22:00:00.000Z',
      end: '2026-05-14T22:00:00.000Z',
    })
  })

  it('groups entries by local start date', () => {
    const grouped = groupEntriesByDate([entryAt('2026-05-13T22:30:00.000Z')])

    expect(grouped.get('2026-05-14')).toHaveLength(1)
    expect(grouped.get('2026-05-13')).toBeUndefined()
  })
})
