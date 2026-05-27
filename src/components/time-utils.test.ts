import { describe, expect, it } from 'vitest'
import type { TimeEntry } from '../types'
import { getLocalDateRangeBounds, getMonthEnd, groupEntriesByDate, toDateString } from './time-utils'

function makeEntry(startTime: string): TimeEntry {
  return {
    id: 'entry-1',
    user_id: 'user-1',
    project_id: 'project-1',
    start_time: startTime,
    end_time: '2026-05-28T00:15:00.000Z',
    description: null,
    created_at: startTime,
    updated_at: startTime,
  }
}

describe('time-utils local date handling', () => {
  it('formats dates by local calendar day instead of UTC day', () => {
    expect(toDateString(new Date('2026-05-27T22:30:00.000Z'))).toBe('2026-05-28')
  })

  it('keeps the real last day of the month in positive UTC offsets', () => {
    expect(getMonthEnd('2026-04')).toBe('2026-04-30')
  })

  it('builds exclusive ISO bounds for local date range queries', () => {
    expect(getLocalDateRangeBounds('2026-04-30', '2026-04-30')).toEqual({
      start: '2026-04-29T22:00:00.000Z',
      end: '2026-04-30T22:00:00.000Z',
    })
  })

  it('groups entries under the local calendar date', () => {
    const entry = makeEntry('2026-05-27T22:30:00.000Z')

    expect(groupEntriesByDate([entry]).get('2026-05-28')).toEqual([entry])
    expect(groupEntriesByDate([entry]).has('2026-05-27')).toBe(false)
  })
})
