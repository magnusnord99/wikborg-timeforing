import { supabase } from '../../lib/supabase'
import type { TimeEntry } from '../../types'
import { getLocalDateRangeBounds } from '../time-utils'

const ENTRIES_PAGE_SIZE = 1000

async function fetchEntriesBetween(start: string, endExclusive: string, ascending: boolean) {
  const allEntries: TimeEntry[] = []

  for (let from = 0; ; from += ENTRIES_PAGE_SIZE) {
    const { data, error } = await supabase
      .from('time_entries')
      .select('*')
      .gte('start_time', start)
      .lt('start_time', endExclusive)
      .order('start_time', { ascending })
      .range(from, from + ENTRIES_PAGE_SIZE - 1)

    if (error) {
      return { data: null, error }
    }

    allEntries.push(...(data ?? []))

    if (!data || data.length < ENTRIES_PAGE_SIZE) {
      return { data: allEntries, error: null }
    }
  }
}

export async function fetchProjectsQuery() {
  return supabase.from('projects').select('*').order('name')
}

export async function fetchEntriesForDate(selectedDate: string) {
  const { start, endExclusive } = getLocalDateRangeBounds(selectedDate, selectedDate)

  return fetchEntriesBetween(start, endExclusive, false)
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

export async function updateProjectRecord(projectId: string, name: string) {
  return supabase.from('projects').update({ name }).eq('id', projectId).select().single()
}

export async function updateEntryDescription(entryId: string, description: string | null) {
  return supabase.from('time_entries').update({ description }).eq('id', entryId)
}

export async function fetchEntriesForRange(startDate: string, endDate: string) {
  const { start, endExclusive } = getLocalDateRangeBounds(startDate, endDate)

  return fetchEntriesBetween(start, endExclusive, true)
}