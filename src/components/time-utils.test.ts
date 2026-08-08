import { describe, expect, it } from 'vitest'
import type { TimeEntry } from '../types'
import { getEntryDate, getLocalDateRangeBounds, groupEntriesByDate, toDateString } from './time-utils'

function makeEntry(id: string, startTime: string): TimeEntry {
  return {
    id,
    user_id: 'user-1',
    project_id: 'project-1',
    start_time: startTime,
    end_time: '2026-05-30T00:30:00.000Z',
    description: null,
    created_at: startTime,
    updated_at: startTime,
  }
}

describe('local date helpers', () => {
  it('formats dates by the local calendar day', () => {
    expect(toDateString(new Date('2026-05-29T22:30:00.000Z'))).toBe('2026-05-30')
  })

  it('builds UTC query bounds from local calendar days', () => {
    expect(getLocalDateRangeBounds('2026-05-30', '2026-05-30')).toEqual({
      start: '2026-05-29T22:00:00.000Z',
      endExclusive: '2026-05-30T22:00:00.000Z',
    })
  })

  it('groups entries by local start date instead of UTC date', () => {
    const lateNightEntry = makeEntry('entry-1', '2026-05-29T22:30:00.000Z')
    const grouped = groupEntriesByDate([lateNightEntry])

    expect(getEntryDate(lateNightEntry)).toBe('2026-05-30')
    expect(grouped.get('2026-05-30')).toEqual([lateNightEntry])
    expect(grouped.has('2026-05-29')).toBe(false)
  })
})
