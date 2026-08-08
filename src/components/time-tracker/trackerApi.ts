import { supabase } from '../../lib/supabase'
import type { TimeEntry } from '../../types'
import { shiftDate } from '../time-utils'

const PAGE_SIZE = 1000

function getDateBounds(date: string) {
  return {
    start: new Date(`${date}T00:00:00`).toISOString(),
    end: new Date(`${shiftDate(date, 1)}T00:00:00`).toISOString(),
  }
}

async function fetchEntriesBetween(startDate: string, endDate: string, ascending: boolean) {
  const start = getDateBounds(startDate).start
  const end = getDateBounds(endDate).end
  const entries: TimeEntry[] = []

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from('time_entries')
      .select('*')
      .gte('start_time', start)
      .lt('start_time', end)
      .order('start_time', { ascending })
      .range(from, from + PAGE_SIZE - 1)

    if (error) return { data: null, error }

    entries.push(...((data ?? []) as TimeEntry[]))
    if ((data ?? []).length < PAGE_SIZE) return { data: entries, error: null }
  }
}

export async function fetchProjectsQuery() {
  return supabase.from('projects').select('*').order('name')
}

export async function fetchEntriesForDate(selectedDate: string) {
  return fetchEntriesBetween(selectedDate, selectedDate, false)
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
  return supabase
    .from('time_entries')
    .update({ end_time: endTime })
    .eq('id', entryId)
    .is('end_time', null)
    .select()
    .single()
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
  return supabase.from('time_entries').update({ description }).eq('id', entryId).select().single()
}

export async function fetchEntriesForRange(startDate: string, endDate: string) {
  return fetchEntriesBetween(startDate, endDate, true)
}