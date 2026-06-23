import { supabase } from '../../lib/supabase'
import type { TimeEntry } from '../../types'
import { getLocalDayRange } from '../time-utils'

const PAGE_SIZE = 1000

type TimeEntryListResult = {
  data: TimeEntry[] | null
  error: unknown
}

async function fetchAllTimeEntryPages(buildQuery: () => any): Promise<TimeEntryListResult> {
  const allEntries: TimeEntry[] = []

  for (let page = 0; ; page += 1) {
    const from = page * PAGE_SIZE
    const to = from + PAGE_SIZE - 1
    const { data, error } = await buildQuery().range(from, to)

    if (error) return { data: null, error }

    const entries = (data ?? []) as TimeEntry[]
    allEntries.push(...entries)

    if (entries.length < PAGE_SIZE) {
      return { data: allEntries, error: null }
    }
  }
}

export async function fetchProjectsQuery() {
  return supabase.from('projects').select('*').order('name')
}

export async function fetchEntriesForDate(selectedDate: string) {
  const { startIso, endIso } = getLocalDayRange(selectedDate)

  return fetchAllTimeEntryPages(() =>
    supabase
      .from('time_entries')
      .select('*')
      .gte('start_time', startIso)
      .lt('start_time', endIso)
      .order('start_time', { ascending: false }),
  )
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

export async function fetchActiveTimeEntry() {
  return supabase
    .from('time_entries')
    .select('*')
    .is('end_time', null)
    .order('start_time', { ascending: false })
    .limit(1)
    .maybeSingle()
}

export async function stopTimerEntry(entryId: string, endTime: string) {
  return supabase.from('time_entries').update({ end_time: endTime }).eq('id', entryId).select().single()
}

export async function deleteTimeEntry(entryId: string) {
  return supabase.from('time_entries').delete().eq('id', entryId).select().single()
}

export async function updateTimeEntry(entryId: string, updates: Partial<TimeEntry>) {
  return supabase.from('time_entries').update(updates).eq('id', entryId).select().single()
}

export async function createProjectRecord(userId: string, name: string) {
  return supabase.from('projects').insert({ user_id: userId, name }).select().single()
}

export async function deleteProjectRecord(projectId: string) {
  return supabase.from('projects').delete().eq('id', projectId)
}

export async function updateEntryDescription(entryId: string, description: string | null) {
  return supabase.from('time_entries').update({ description }).eq('id', entryId).select().single()
}

export async function fetchEntriesForRange(startDate: string, endDate: string) {
  const { startIso } = getLocalDayRange(startDate)
  const { endIso } = getLocalDayRange(endDate)

  return fetchAllTimeEntryPages(() =>
    supabase
      .from('time_entries')
      .select('*')
      .gte('start_time', startIso)
      .lt('start_time', endIso)
      .order('start_time', { ascending: true }),
  )
}