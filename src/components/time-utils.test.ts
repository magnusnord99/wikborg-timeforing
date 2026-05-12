import { describe, expect, it } from 'vitest'
import type { TimeEntry } from '../types'
import { getLocalDayRange, groupEntriesByDate, toDateString } from './time-utils'

function makeEntry(id: string, startTime: string): TimeEntry {
  return {
    id,
    user_id: 'user-1',
    project_id: 'project-1',
    start_time: startTime,
    end_time: '2026-05-12T03:30:00.000Z',
    description: null,
    created_at: startTime,
    updated_at: startTime,
  }
}

describe('local day helpers', () => {
  it('formats dates using the local calendar day', () => {
    expect(toDateString(new Date('2026-05-12T02:30:00.000Z'))).toBe('2026-05-11')
  })

  it('builds local-day boundaries as explicit instants', () => {
    const { start, end } = getLocalDayRange('2026-05-12')

    expect(start.toISOString()).toBe('2026-05-12T04:00:00.000Z')
    expect(end.toISOString()).toBe('2026-05-13T04:00:00.000Z')
  })

  it('groups entries by their local start date', () => {
    const grouped = groupEntriesByDate([
      makeEntry('entry-1', '2026-05-12T02:30:00.000Z'),
      makeEntry('entry-2', '2026-05-12T14:00:00.000Z'),
    ])

    expect(grouped.get('2026-05-11')?.map((entry) => entry.id)).toEqual(['entry-1'])
    expect(grouped.get('2026-05-12')?.map((entry) => entry.id)).toEqual(['entry-2'])
  })
})
