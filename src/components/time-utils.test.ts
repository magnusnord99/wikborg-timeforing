import { describe, expect, it } from 'vitest'
import type { TimeEntry } from '../types'
import { getLocalDayBounds, groupEntriesByDate, toDateString, toLocalDateString } from './time-utils'

function entry(id: string, startTime: string): TimeEntry {
  return {
    id,
    user_id: 'user-1',
    project_id: 'project-1',
    start_time: startTime,
    end_time: '2026-05-31T23:00:00.000Z',
    description: null,
    created_at: startTime,
    updated_at: startTime,
  }
}

describe('local calendar date helpers', () => {
  it('formats dates using the local calendar day', () => {
    expect(toDateString(new Date('2026-05-30T22:30:00.000Z'))).toBe('2026-05-31')
    expect(toLocalDateString('2026-05-30T22:30:00.000Z')).toBe('2026-05-31')
  })

  it('builds ISO bounds for the selected local day', () => {
    expect(getLocalDayBounds('2026-05-31')).toEqual({
      startIso: '2026-05-30T22:00:00.000Z',
      endIso: '2026-05-31T22:00:00.000Z',
    })
  })

  it('groups entries by local start date instead of UTC date', () => {
    const grouped = groupEntriesByDate([
      entry('early-local-day', '2026-05-30T22:30:00.000Z'),
      entry('same-local-day', '2026-05-31T10:00:00.000Z'),
    ])

    expect(grouped.get('2026-05-31')?.map((item) => item.id)).toEqual([
      'early-local-day',
      'same-local-day',
    ])
    expect(grouped.has('2026-05-30')).toBe(false)
  })
})
