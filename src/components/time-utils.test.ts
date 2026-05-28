import { describe, expect, it } from 'vitest'
import type { TimeEntry } from '../types'
import { getLocalDateRange, groupEntriesByDate, toDateString } from './time-utils'

function entry(start_time: string): TimeEntry {
  return {
    id: start_time,
    user_id: 'user-1',
    project_id: 'project-1',
    start_time,
    end_time: '2026-05-28T10:00:00.000Z',
    description: null,
    created_at: start_time,
    updated_at: start_time,
  }
}

describe('time date helpers', () => {
  it('serializes dates using the local calendar day', () => {
    expect(toDateString(new Date(2026, 4, 28, 0, 30))).toBe('2026-05-28')
  })

  it('builds UTC query bounds for a local day', () => {
    expect(getLocalDateRange('2026-05-28')).toEqual({
      start: '2026-05-27T22:00:00.000Z',
      end: '2026-05-28T22:00:00.000Z',
    })
  })

  it('groups entries by local day instead of the ISO UTC date', () => {
    const grouped = groupEntriesByDate([entry('2026-05-27T22:30:00.000Z')])

    expect(grouped.get('2026-05-28')).toHaveLength(1)
    expect(grouped.has('2026-05-27')).toBe(false)
  })
})
