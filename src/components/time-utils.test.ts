import { describe, expect, it } from 'vitest'
import type { TimeEntry } from '../types'
import { getLocalDayBounds, groupEntriesByDate, shiftDate, toDateString, toLocalDateString } from './time-utils'

function entry(id: string, startTime: string): TimeEntry {
  return {
    id,
    user_id: 'user-1',
    project_id: 'project-1',
    start_time: startTime,
    end_time: '2026-06-05T23:45:00.000Z',
    description: null,
    created_at: startTime,
    updated_at: startTime,
  }
}

describe('time-utils local calendar helpers', () => {
  it('formats dates using the local calendar day', () => {
    expect(toDateString(new Date(2026, 5, 6, 0, 30))).toBe('2026-06-06')
  })

  it('converts ISO timestamps to local date keys', () => {
    expect(toLocalDateString('2026-06-05T22:30:00.000Z')).toBe('2026-06-06')
  })

  it('builds local day bounds as ISO instants with an exclusive next-day end', () => {
    expect(getLocalDayBounds('2026-06-06')).toEqual({
      startIso: '2026-06-05T22:00:00.000Z',
      endIso: '2026-06-06T22:00:00.000Z',
    })
  })

  it('groups entries by local day instead of UTC date slices', () => {
    const grouped = groupEntriesByDate([
      entry('late', '2026-06-05T22:30:00.000Z'),
      entry('early', '2026-06-06T05:30:00.000Z'),
    ])

    expect(grouped.get('2026-06-06')?.map((item) => item.id)).toEqual(['late', 'early'])
  })

  it('shifts dates across month boundaries without UTC rollover', () => {
    expect(shiftDate('2026-06-01', -1)).toBe('2026-05-31')
  })
})
