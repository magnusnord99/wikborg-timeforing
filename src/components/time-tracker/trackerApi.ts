import { supabase } from '../../lib/supabase'
import type { TimeEntry } from '../../types'
import { getLocalDayRange, shiftDate } from '../time-utils'

export async function fetchProjectsQuery() {
  return supabase.from('projects').select('*').order('name')
}

export async function fetchEntriesForDate(selectedDate: string) {
  const { startIso, endIso } = getLocalDayRange(selectedDate)

  return supabase
    .from('time_entries')
    .select('*')
    .gte('start_time', startIso)
    .lt('start_time', endIso)
    .order('start_time', { ascending: false })
}

export async function fetchActiveEntry() {
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
  const { startIso: endIso } = getLocalDayRange(shiftDate(endDate, 1))

  return supabase
    .from('time_entries')
    .select('*')
    .gte('start_time', startIso)
    .lt('start_time', endIso)
    .order('start_time', { ascending: true })
}