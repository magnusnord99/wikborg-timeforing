import { describe, expect, it } from 'vitest'
import type { TimeEntry } from '../types'
import { getDateRangeBounds, groupEntriesByDate, toDateString } from './time-utils'

function makeEntry(startTime: string): TimeEntry {
  return {
    id: startTime,
    user_id: 'user-1',
    project_id: 'project-1',
    start_time: startTime,
    end_time: '2026-05-22T00:00:00.000Z',
    description: null,
    created_at: startTime,
    updated_at: startTime,
  }
}

describe('time-utils local calendar helpers', () => {
  it('serializes dates using the local calendar day', () => {
    expect(toDateString(new Date('2026-05-21T22:30:00.000Z'))).toBe('2026-05-22')
  })

  it('builds ISO query bounds from local day boundaries', () => {
    expect(getDateRangeBounds('2026-05-22', '2026-05-22')).toEqual({
      startIso: '2026-05-21T22:00:00.000Z',
      endIso: '2026-05-22T22:00:00.000Z',
    })
  })

  it('groups entries by local start date instead of UTC date', () => {
    const grouped = groupEntriesByDate([makeEntry('2026-05-21T22:30:00.000Z')])

    expect(grouped.get('2026-05-22')).toHaveLength(1)
    expect(grouped.get('2026-05-21')).toBeUndefined()
  })
})
