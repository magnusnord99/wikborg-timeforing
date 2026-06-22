import { describe, expect, test } from 'vitest'
import type { TimeEntry } from '../types'
import {
  getLocalDayStartIso,
  getNextLocalDayStartIso,
  groupEntriesByDate,
  toDateString,
} from './time-utils'

function entryWithStart(startTime: string): TimeEntry {
  return {
    id: crypto.randomUUID(),
    user_id: 'user-1',
    project_id: 'project-1',
    start_time: startTime,
    end_time: '2026-06-21T23:30:00.000Z',
    description: null,
    created_at: startTime,
    updated_at: startTime,
  }
}

describe('local calendar day helpers', () => {
  test('formats Date objects using the local day', () => {
    expect(toDateString(new Date('2026-06-21T22:30:00.000Z'))).toBe('2026-06-22')
  })

  test('builds local day query bounds as UTC instants', () => {
    expect(getLocalDayStartIso('2026-06-22')).toBe('2026-06-21T22:00:00.000Z')
    expect(getNextLocalDayStartIso('2026-06-22')).toBe('2026-06-22T22:00:00.000Z')
  })

  test('groups late-night entries by local calendar day', () => {
    const byDate = groupEntriesByDate([entryWithStart('2026-06-21T22:30:00.000Z')])

    expect(byDate.get('2026-06-22')).toHaveLength(1)
    expect(byDate.has('2026-06-21')).toBe(false)
  })
})
