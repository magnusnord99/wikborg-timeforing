import { describe, expect, it } from 'vitest'
import {
  getLocalDateEndExclusiveIso,
  getLocalDateStartIso,
  groupEntriesByDate,
  toDateString,
} from './time-utils'
import type { TimeEntry } from '../types'

function makeEntry(startTime: string): TimeEntry {
  return {
    id: crypto.randomUUID(),
    user_id: 'user-id',
    project_id: 'project-id',
    start_time: startTime,
    end_time: '2026-01-02T01:00:00.000Z',
    description: null,
    created_at: startTime,
    updated_at: startTime,
  }
}

describe('local date helpers', () => {
  it('serializes dates using the local calendar day', () => {
    expect(toDateString(new Date('2026-01-01T23:30:00.000Z'))).toBe('2026-01-02')
  })

  it('builds local-day Supabase bounds as UTC instants', () => {
    expect(getLocalDateStartIso('2026-01-02')).toBe('2026-01-01T23:00:00.000Z')
    expect(getLocalDateEndExclusiveIso('2026-01-02')).toBe('2026-01-02T23:00:00.000Z')
  })

  it('groups entries by the local day their start time appears on', () => {
    const groups = groupEntriesByDate([makeEntry('2026-01-01T23:30:00.000Z')])

    expect(groups.get('2026-01-02')).toHaveLength(1)
    expect(groups.has('2026-01-01')).toBe(false)
  })
})
