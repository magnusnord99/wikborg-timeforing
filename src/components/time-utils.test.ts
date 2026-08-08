import { describe, expect, it } from 'vitest'
import type { TimeEntry } from '../types'
import { getDateRangeBounds, getMonthCalendarBounds, groupEntriesByDate, toDateString } from './time-utils'

function entry(id: string, startTime: string): TimeEntry {
  return {
    id,
    user_id: 'user-1',
    project_id: 'project-1',
    start_time: startTime,
    end_time: '2026-05-26T00:00:00.000Z',
    description: null,
    created_at: startTime,
    updated_at: startTime,
  }
}

describe('time-utils local date helpers', () => {
  it('formats dates using the local calendar day', () => {
    expect(toDateString(new Date('2026-05-25T22:30:00.000Z'))).toBe('2026-05-26')
  })

  it('builds local-day Supabase bounds as UTC instants', () => {
    expect(getDateRangeBounds('2026-05-26', '2026-05-26')).toEqual({
      startIso: '2026-05-25T22:00:00.000Z',
      endIso: '2026-05-26T22:00:00.000Z',
    })
  })

  it('groups entries by local day instead of UTC date prefix', () => {
    const grouped = groupEntriesByDate([entry('late-night', '2026-05-25T22:30:00.000Z')])

    expect(grouped.get('2026-05-26')?.map((timeEntry) => timeEntry.id)).toEqual(['late-night'])
    expect(grouped.has('2026-05-25')).toBe(false)
  })

  it('returns full visible month grid bounds', () => {
    expect(getMonthCalendarBounds('2026-02')).toEqual({
      start: '2026-01-26',
      end: '2026-03-01',
    })
  })
})
