import { useEffect, useState } from 'react'
import type { Project, TimeEntry } from '../../types'
import { getMonthEnd, getMonthStart, getWeekEnd, getWeekStart, shiftDate, shiftMonth, toDateString, toMonthString } from '../time-utils'
import {
  createProjectRecord,
  createTimerEntry,
  deleteProjectRecord,
  deleteTimeEntry,
  fetchEntriesForDate,
  fetchEntriesForRange,
  fetchOpenTimerEntry,
  fetchProjectsQuery,
  getSignedInUserId,
  stopTimerEntry,
  updateEntryDescription,
  updateTimeEntry,
} from './trackerApi'
import type { PanelId, TrackerNotice, ViewMode } from './types'

export function useTimeTrackerData() {
  const [projects, setProjects] = useState<Project[]>([])
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null)
  const [selectedDate, setSelectedDate] = useState(() => toDateString(new Date()))
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState<TrackerNotice | null>(null)
  const [now, setNow] = useState(() => Date.now())
  const [activePanel, setActivePanel] = useState<PanelId>('projects')
  const [sessionNote, setSessionNote] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('day')
  const [selectedWeek, setSelectedWeek] = useState(() => getWeekStart(toDateString(new Date())))
  const [selectedMonth, setSelectedMonth] = useState(() => toMonthString(toDateString(new Date())))
  const [rangeEntries, setRangeEntries] = useState<TimeEntry[]>([])
  const [rangeLoading, setRangeLoading] = useState(false)

  useEffect(() => {
    void fetchProjects()
  }, [])

  useEffect(() => {
    void fetchEntries()
  }, [selectedDate])

  useEffect(() => {
    if (viewMode === 'day') return
    void fetchRangeEntries()
  }, [viewMode, selectedWeek, selectedMonth])

  useEffect(() => {
    if (!activeEntry) return

    setActivePanel('focus')
    setNow(Date.now())
    const interval = window.setInterval(() => {
      setNow(Date.now())
    }, 1000)

    return () => window.clearInterval(interval)
  }, [activeEntry])

  useEffect(() => {
    setSessionNote(activeEntry?.description ?? '')
  }, [activeEntry?.id, activeEntry?.description])

  async function fetchProjects() {
    const { data, error } = await fetchProjectsQuery()

    if (error) {
      console.error('Feil ved henting av prosjekter:', error)
      setNotice({ type: 'error', text: 'Kunne ikke hente prosjekter akkurat nå.' })
      return
    }

    setNotice(null)
    setProjects(data ?? [])
  }

  async function fetchEntries() {
    setLoading(true)
    const [{ data, error }, activeResult] = await Promise.all([fetchEntriesForDate(selectedDate), fetchOpenTimerEntry()])

    if (error) {
      console.error('Feil ved henting av timer:', error)
      setNotice({ type: 'error', text: 'Kunne ikke hente timer for valgt dato.' })
      setLoading(false)
      return
    }

    const activeFromDate = (data ?? []).find((entry) => !entry.end_time)
    if (activeResult.error) {
      console.error('Feil ved henting av aktiv timer:', activeResult.error)
      setNotice({ type: 'error', text: 'Kunne ikke hente aktiv timer akkurat nå.' })
      setActiveEntry((previous) => activeFromDate ?? (previous && !previous.end_time ? previous : null))
    } else {
      const active = ((activeResult.data?.[0] as TimeEntry | undefined) ?? activeFromDate) ?? null
      setNotice(null)
      setActiveEntry(active)
    }

    setEntries(data ?? [])
    setLoading(false)
  }

  async function fetchRangeEntries() {
    setRangeLoading(true)
    const start = viewMode === 'week' ? selectedWeek : getMonthStart(selectedMonth)
    const end = viewMode === 'week' ? getWeekEnd(selectedWeek) : getMonthEnd(selectedMonth)
    const { data, error } = await fetchEntriesForRange(start, end)

    if (error) {
      console.error('Feil ved henting av timer for periode:', error)
      setNotice({ type: 'error', text: 'Kunne ikke hente timer for perioden.' })
      setRangeLoading(false)
      return
    }

    setNotice(null)
    setRangeEntries(data ?? [])
    setRangeLoading(false)
  }

  function handleDayClick(date: string) {
    setSelectedDate(date)
    setViewMode('day')
  }

  function handleWeekNav(direction: -1 | 1) {
    setSelectedWeek((prev) => shiftDate(prev, direction * 7))
  }

  function handleMonthNav(direction: -1 | 1) {
    setSelectedMonth((prev) => shiftMonth(prev, direction))
  }

  async function startTimer(projectId: string) {
    if (activeEntry) return

    const userId = await getSignedInUserId()
    if (!userId) return

    const { data: openTimerData, error: openTimerError } = await fetchOpenTimerEntry()
    if (openTimerError) {
      console.error('Feil ved sjekk av aktiv timer:', openTimerError)
      setNotice({ type: 'error', text: 'Kunne ikke sjekke om en timer allerede kjører.' })
      return
    }

    const openTimer = (openTimerData?.[0] as TimeEntry | undefined) ?? null
    if (openTimer) {
      setNotice({ type: 'info', text: 'En timer er allerede i gang.' })
      setActiveEntry(openTimer)
      setActivePanel('focus')
      return
    }

    const startAt = new Date().toISOString()
    const { data, error } = await createTimerEntry(userId, projectId, startAt)

    if (error) {
      console.error('Feil ved start av timer:', error)
      setNotice({ type: 'error', text: 'Kunne ikke starte timeren. Prøv igjen.' })
      return
    }

    setNotice({ type: 'info', text: 'Timer startet. Fokusmodus er aktiv.' })
    setNow(Date.now())
    setActiveEntry(data)
    setEntries((previous) => (toDateString(new Date(data.start_time)) === selectedDate ? [data, ...previous] : previous))
  }

  async function stopTimer() {
    if (!activeEntry) return

    const endAt = new Date().toISOString()
    const { error } = await stopTimerEntry(activeEntry.id, endAt)

    if (error) {
      console.error('Feil ved stopp av timer:', error)
      setNotice({ type: 'error', text: 'Kunne ikke stoppe timeren. Prøv igjen.' })
      return
    }

    setNotice({ type: 'info', text: 'Timer stoppet.' })
    setActiveEntry(null)
    await fetchEntries()
    if (viewMode !== 'day') {
      await fetchRangeEntries()
    }
  }

  async function handleStopTimer() {
    const noteSaved = await saveSessionNote()
    if (!noteSaved) return

    await stopTimer()
  }

  async function deleteEntry(id: string) {
    const { error } = await deleteTimeEntry(id)

    if (error) {
      console.error('Feil ved sletting:', error)
      setNotice({ type: 'error', text: 'Kunne ikke slette timen.' })
      return
    }

    setNotice(null)
    await fetchEntries()
    if (viewMode !== 'day') {
      await fetchRangeEntries()
    }
  }

  async function updateEntry(id: string, updates: Partial<TimeEntry>) {
    const { error } = await updateTimeEntry(id, updates)

    if (error) {
      console.error('Feil ved oppdatering:', error)
      setNotice({ type: 'error', text: 'Kunne ikke oppdatere timen.' })
      return
    }

    setNotice(null)
    await fetchEntries()
    if (viewMode !== 'day') {
      await fetchRangeEntries()
    }
  }

  async function addProject(name: string) {
    const userId = await getSignedInUserId()
    if (!userId) return

    const { data, error } = await createProjectRecord(userId, name)

    if (error) {
      console.error('Feil ved opprettelse av prosjekt:', error)
      setNotice({ type: 'error', text: 'Kunne ikke opprette prosjektet.' })
      return
    }

    setNotice(null)
    setProjects((previous) => [...previous, data].sort((a, b) => a.name.localeCompare(b.name)))
  }

  async function removeProject(id: string) {
    const { error } = await deleteProjectRecord(id)

    if (error) {
      console.error('Feil ved sletting av prosjekt:', error)
      setNotice({ type: 'error', text: 'Kunne ikke fjerne prosjektet.' })
      return
    }

    setNotice(null)
    setProjects((previous) => previous.filter((project) => project.id !== id))
    await fetchEntries()
    if (viewMode !== 'day') {
      await fetchRangeEntries()
    }
  }

  async function saveSessionNote(): Promise<boolean> {
    if (!activeEntry) return true

    const nextNote = sessionNote.trim()
    if ((activeEntry.description ?? '') === nextNote) return true

    const { error } = await updateEntryDescription(activeEntry.id, nextNote || null)

    if (error) {
      console.error('Feil ved lagring av notat:', error)
      setNotice({ type: 'error', text: 'Kunne ikke lagre arbeidsnotatet.' })
      return false
    }

    setActiveEntry((previous) => (previous ? { ...previous, description: nextNote || null } : previous))
    return true
  }

  return {
    projects,
    entries,
    activeEntry,
    selectedDate,
    setSelectedDate,
    loading,
    notice,
    setNotice,
    now,
    activePanel,
    setActivePanel,
    sessionNote,
    setSessionNote,
    viewMode,
    setViewMode,
    selectedWeek,
    selectedMonth,
    rangeEntries,
    rangeLoading,
    handleDayClick,
    handleWeekNav,
    handleMonthNav,
    startTimer,
    handleStopTimer,
    deleteEntry,
    updateEntry,
    addProject,
    removeProject,
    saveSessionNote,
  }
}
