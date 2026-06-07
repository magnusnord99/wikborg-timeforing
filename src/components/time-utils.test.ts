import { describe, expect, it } from 'vitest'
import type { TimeEntry } from '../types'
import { getLocalDayRange, getMonthEnd, groupEntriesByDate, toDateString } from './time-utils'

function buildEntry(id: string, startTime: string, endTime: string): TimeEntry {
  return {
    id,
    user_id: 'user-1',
    project_id: 'project-1',
    start_time: startTime,
    end_time: endTime,
    description: null,
    created_at: startTime,
    updated_at: startTime,
  }
}

describe('local calendar date helpers', () => {
  it('keeps local midnight on the same calendar date', () => {
    expect(toDateString(new Date(2026, 3, 30))).toBe('2026-04-30')
  })

  it('returns the real final local day of a month', () => {
    expect(getMonthEnd('2026-04')).toBe('2026-04-30')
  })

  it('builds UTC instants for the selected local day', () => {
    expect(getLocalDayRange('2026-05-01')).toEqual({
      startIso: '2026-04-30T22:00:00.000Z',
      endIso: '2026-05-01T22:00:00.000Z',
    })
  })

  it('groups entries by local start date rather than UTC date', () => {
    const entries = [
      buildEntry('entry-1', '2026-04-30T22:30:00.000Z', '2026-04-30T23:30:00.000Z'),
    ]

    const grouped = groupEntriesByDate(entries)

    expect(grouped.get('2026-05-01')?.map((entry) => entry.id)).toEqual(['entry-1'])
    expect(grouped.has('2026-04-30')).toBe(false)
  })
})
