import { describe, expect, it } from 'vitest'
import type { TimeEntry } from '../types'
import { getLocalDayRange, groupEntriesByDate, shiftDate, toDateString } from './time-utils'

function timeEntry(startTime: string): TimeEntry {
  return {
    id: startTime,
    user_id: 'user-1',
    project_id: 'project-1',
    start_time: startTime,
    end_time: '2024-01-01T01:00:00.000Z',
    description: null,
    created_at: startTime,
    updated_at: startTime,
  }
}

describe('time-utils local date helpers', () => {
  it('formats the local calendar date instead of the UTC date', () => {
    const localHalfPastMidnight = new Date(2024, 0, 1, 0, 30)

    expect(localHalfPastMidnight.toISOString().slice(0, 10)).toBe('2023-12-31')
    expect(toDateString(localHalfPastMidnight)).toBe('2024-01-01')
  })

  it('builds local day bounds as UTC instants for Supabase range filters', () => {
    expect(getLocalDayRange('2024-01-01')).toEqual({
      startIso: '2023-12-31T23:00:00.000Z',
      endIso: '2024-01-01T23:00:00.000Z',
    })
  })

  it('groups entries by the local day of their start time', () => {
    const grouped = groupEntriesByDate([timeEntry('2023-12-31T23:30:00.000Z')])

    expect(grouped.get('2024-01-01')).toHaveLength(1)
    expect(grouped.get('2023-12-31')).toBeUndefined()
  })

  it('shifts calendar days across daylight-saving changes', () => {
    expect(shiftDate('2024-03-31', 1)).toBe('2024-04-01')
  })
})
