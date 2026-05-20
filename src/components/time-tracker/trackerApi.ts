import { supabase } from '../../lib/supabase'
import type { TimeEntry } from '../../types'
import { getLocalDateRange } from '../time-utils'

const ENTRY_PAGE_SIZE = 1000

async function fetchEntriesBetween(startTime: string, endTime: string, ascending: boolean) {
  const entries: TimeEntry[] = []

  for (let from = 0; ; from += ENTRY_PAGE_SIZE) {
    const { data, error } = await supabase
      .from('time_entries')
      .select('*')
      .gte('start_time', startTime)
      .lt('start_time', endTime)
      .order('start_time', { ascending })
      .range(from, from + ENTRY_PAGE_SIZE - 1)

    if (error) {
      return { data: null, error }
    }

    const page = (data ?? []) as TimeEntry[]
    entries.push(...page)

    if (page.length < ENTRY_PAGE_SIZE) {
      return { data: entries, error: null }
    }
  }
}

export async function fetchProjectsQuery() {
  return supabase.from('projects').select('*').order('name')
}

export async function fetchEntriesForDate(selectedDate: string) {
  const { start, end } = getLocalDateRange(selectedDate)

  return fetchEntriesBetween(start, end, false)
}

export async function fetchOpenTimerEntry() {
  return supabase
    .from('time_entries')
    .select('*')
    .is('end_time', null)
    .order('start_time', { ascending: false })
    .limit(1)
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
  const { start, end } = getLocalDateRange(startDate, endDate)

  return fetchEntriesBetween(start, end, true)
}