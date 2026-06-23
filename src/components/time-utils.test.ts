import { describe, expect, it } from 'vitest'
import { getLocalDayRange, groupEntriesByDate, toDateString } from './time-utils'
import type { TimeEntry } from '../types'

function createEntry(id: string, startTime: string): TimeEntry {
  return {
    id,
    user_id: 'user-1',
    project_id: 'project-1',
    start_time: startTime,
    end_time: '2026-06-23T00:00:00.000Z',
    description: null,
    created_at: startTime,
    updated_at: startTime,
  }
}

describe('local date helpers', () => {
  it('formats date keys from the local calendar day', () => {
    expect(toDateString(new Date('2026-06-22T22:30:00.000Z'))).toBe('2026-06-23')
  })

  it('builds local-day query bounds as explicit UTC instants', () => {
    expect(getLocalDayRange('2026-06-23')).toEqual({
      startIso: '2026-06-22T22:00:00.000Z',
      endIso: '2026-06-23T22:00:00.000Z',
    })
  })

  it('groups entries by local start date instead of UTC date slices', () => {
    const grouped = groupEntriesByDate([createEntry('entry-1', '2026-06-22T22:30:00.000Z')])

    expect(grouped.get('2026-06-23')?.map((entry) => entry.id)).toEqual(['entry-1'])
    expect(grouped.has('2026-06-22')).toBe(false)
  })
})
