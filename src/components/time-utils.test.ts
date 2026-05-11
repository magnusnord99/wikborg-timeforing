import { describe, expect, it } from 'vitest'
import type { TimeEntry } from '../types'
import { getLocalDateKey, getLocalDayRangeIso, groupEntriesByDate } from './time-utils'

process.env.TZ = 'Europe/Oslo'

function entry(id: string, startTime: string): TimeEntry {
  return {
    id,
    user_id: 'user-1',
    project_id: 'project-1',
    start_time: startTime,
    end_time: '2026-07-02T00:00:00.000Z',
    description: null,
    created_at: startTime,
    updated_at: startTime,
  }
}

describe('local date helpers', () => {
  it('maps ISO instants to the local calendar date', () => {
    expect(getLocalDateKey('2026-07-01T22:30:00.000Z')).toBe('2026-07-02')
  })

  it('builds exclusive ISO ranges for a local calendar day', () => {
    expect(getLocalDayRangeIso('2026-07-02')).toEqual({
      startIso: '2026-07-01T22:00:00.000Z',
      endIso: '2026-07-02T22:00:00.000Z',
    })
  })

  it('groups entries by local calendar date', () => {
    const grouped = groupEntriesByDate([
      entry('late-evening', '2026-07-01T22:30:00.000Z'),
      entry('next-day', '2026-07-02T10:00:00.000Z'),
    ])

    expect(grouped.get('2026-07-02')?.map((item) => item.id)).toEqual([
      'late-evening',
      'next-day',
    ])
    expect(grouped.has('2026-07-01')).toBe(false)
  })
})
