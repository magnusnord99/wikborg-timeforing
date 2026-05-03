import { supabase } from '../../lib/supabase'
import type { TimeEntry } from '../../types'
import { toLocalDayEndExclusiveIso, toLocalDayStartIso } from '../time-utils'

const RANGE_PAGE_SIZE = 1000

export async function fetchProjectsQuery() {
  return supabase.from('projects').select('*').order('name')
}

export async function fetchEntriesForDate(selectedDate: string) {
  const start = toLocalDayStartIso(selectedDate)
  const end = toLocalDayEndExclusiveIso(selectedDate)

  return supabase
    .from('time_entries')
    .select('*')
    .gte('start_time', start)
    .lt('start_time', end)
    .order('start_time', { ascending: false })
}

export async function fetchActiveTimerEntry() {
  return supabase
    .from('time_entries')
    .select('*')
    .is('end_time', null)
    .order('start_time', { ascending: false })
    .limit(1)
    .maybeSingle()
}

export async function getSignedInUserId() {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user?.id ?? null
}

export async function createTimerEntry(userId: string, projectId: string, startTime: string) {
  return supabase
    .from('time_entries')
    .insert({ user_id: userId, project_id: projectId, start_time: startTime })
    .select()
    .single()
}

export async function stopTimerEntry(entryId: string, endTime: string) {
  return supabase.from('time_entries').update({ end_time: endTime }).eq('id', entryId)
}

export async function deleteTimeEntry(entryId: string) {
  return supabase.from('time_entries').delete().eq('id', entryId)
}

export async function updateTimeEntry(entryId: string, updates: Partial<TimeEntry>) {
  return supabase.from('time_entries').update(updates).eq('id', entryId)
}

export async function createProjectRecord(userId: string, name: string) {
  return supabase.from('projects').insert({ user_id: userId, name }).select().single()
}

export async function deleteProjectRecord(projectId: string) {
  return supabase.from('projects').delete().eq('id', projectId)
}

export async function updateEntryDescription(entryId: string, description: string | null) {
  return supabase.from('time_entries').update({ description }).eq('id', entryId)
}

export async function fetchEntriesForRange(startDate: string, endDate: string) {
  const start = toLocalDayStartIso(startDate)
  const end = toLocalDayEndExclusiveIso(endDate)
  const entries: TimeEntry[] = []
  let pageStart = 0

  while (true) {
    const { data, error } = await supabase
      .from('time_entries')
      .select('*')
      .gte('start_time', start)
      .lt('start_time', end)
      .order('start_time', { ascending: true })
      .range(pageStart, pageStart + RANGE_PAGE_SIZE - 1)

    if (error) {
      return { data: null, error }
    }

    entries.push(...(data ?? []))

    if (!data || data.length < RANGE_PAGE_SIZE) {
      return { data: entries, error: null }
    }

    pageStart += RANGE_PAGE_SIZE
  }
}