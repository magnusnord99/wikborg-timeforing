import { describe, expect, it } from 'vitest'
import type { TimeEntry } from '../types'
import { getMonthGridEnd, getMonthGridStart, groupEntriesByDate, toDateString } from './time-utils'

function entryWithStart(startTime: string): TimeEntry {
  return {
    id: startTime,
    user_id: 'user',
    project_id: 'project',
    start_time: startTime,
    end_time: null,
    description: null,
    created_at: startTime,
    updated_at: startTime,
  }
}

describe('time-utils', () => {
  it('serializes Date objects using the local calendar day', () => {
    const date = new Date(2026, 4, 24, 1, 30)

    expect(toDateString(date)).toBe('2026-05-24')
  })

  it('uses local calendar days when grouping entries', () => {
    const grouped = groupEntriesByDate([entryWithStart('2026-05-23T22:30:00.000Z')])

    expect(grouped.has(toDateString(new Date('2026-05-23T22:30:00.000Z')))).toBe(true)
  })

  it('builds month grid bounds that include visible padding days', () => {
    expect(getMonthGridStart('2026-04')).toBe('2026-03-30')
    expect(getMonthGridEnd('2026-04')).toBe('2026-05-03')
  })
})
