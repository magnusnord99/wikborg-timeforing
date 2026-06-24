import { describe, expect, it } from 'vitest'
import type { TimeEntry } from '../types'
import {
  getLocalDateRangeIsoBounds,
  getMonthEnd,
  groupEntriesByDate,
  shiftDate,
  toDateString,
} from './time-utils'

function makeEntry(startTime: string): TimeEntry {
  return {
    id: startTime,
    user_id: 'user-1',
    project_id: 'project-1',
    start_time: startTime,
    end_time: '2026-05-01T00:00:00.000Z',
    description: null,
    created_at: startTime,
    updated_at: startTime,
  }
}

describe('time-utils local calendar helpers', () => {
  it('formats dates using the local calendar day', () => {
    expect(toDateString(new Date('2026-04-30T22:30:00.000Z'))).toBe('2026-05-01')
  })

  it('keeps month ends on the real local calendar day', () => {
    expect(getMonthEnd('2026-04')).toBe('2026-04-30')
  })

  it('groups entries by local day instead of UTC day', () => {
    const grouped = groupEntriesByDate([makeEntry('2026-03-30T22:30:00.000Z')])

    expect(grouped.get('2026-03-31')).toHaveLength(1)
    expect(grouped.has('2026-03-30')).toBe(false)
  })

  it('converts local date query ranges to UTC instants', () => {
    expect(getLocalDateRangeIsoBounds('2026-04-30', '2026-04-30')).toEqual({
      startIso: '2026-04-29T22:00:00.000Z',
      endExclusiveIso: '2026-04-30T22:00:00.000Z',
    })
  })

  it('shifts local date strings across month boundaries', () => {
    expect(shiftDate('2026-04-30', 1)).toBe('2026-05-01')
  })
})
