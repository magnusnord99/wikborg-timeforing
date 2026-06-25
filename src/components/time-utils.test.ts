import { describe, expect, it } from 'vitest'
import type { TimeEntry } from '../types'
import {
  getLocalDateRangeBounds,
  getLocalDayBounds,
  getMonthEnd,
  groupEntriesByDate,
  toDateString,
} from './time-utils'

function makeEntry(id: string, startTime: string): TimeEntry {
  return {
    id,
    user_id: 'user-1',
    project_id: 'project-1',
    start_time: startTime,
    end_time: '2026-05-01T00:30:00.000Z',
    description: null,
    created_at: startTime,
    updated_at: startTime,
  }
}

describe('time-utils local calendar dates', () => {
  it('serializes local dates without shifting to the previous UTC date', () => {
    expect(toDateString(new Date(2026, 3, 1))).toBe('2026-04-01')
    expect(getMonthEnd('2026-04')).toBe('2026-04-30')
  })

  it('builds UTC query bounds for the full local day and range', () => {
    expect(getLocalDayBounds('2026-04-30')).toEqual({
      start: '2026-04-29T22:00:00.000Z',
      end: '2026-04-30T21:59:59.999Z',
    })

    expect(getLocalDateRangeBounds('2026-04-01', '2026-04-30')).toEqual({
      start: '2026-03-31T22:00:00.000Z',
      end: '2026-04-30T21:59:59.999Z',
    })
  })

  it('groups entries by the local calendar date users see', () => {
    const grouped = groupEntriesByDate([
      makeEntry('late-april', '2026-04-30T21:30:00.000Z'),
      makeEntry('early-may', '2026-04-30T22:30:00.000Z'),
    ])

    expect(grouped.get('2026-04-30')?.map((entry) => entry.id)).toEqual(['late-april'])
    expect(grouped.get('2026-05-01')?.map((entry) => entry.id)).toEqual(['early-may'])
  })
})
