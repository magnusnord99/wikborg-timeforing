import { useEffect, useRef, useState } from 'react'
import type { Project, TimeEntry } from '../../types'
import { getMonthEnd, getMonthStart, getWeekEnd, getWeekStart, shiftDate, toDateString, toMonthString } from '../time-utils'
import {
  createProjectRecord,
  createTimerEntry,
  deleteProjectRecord,
  deleteTimeEntry,
  fetchActiveTimerEntry,
  fetchEntriesForDate,
  fetchEntriesForRange,
  fetchProjectsQuery,
  getSignedInUserId,
  stopTimerEntry,
  updateEntryDescription,
  updateProjectRecord,
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
  const entriesRequestId = useRef(0)
  const rangeRequestId = useRef(0)

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
    const requestId = ++entriesRequestId.current
    const date = selectedDate
    setLoading(true)
    const [entriesResult, activeResult] = await Promise.all([
      fetchEntriesForDate(date),
      fetchActiveTimerEntry(),
    ])

    if (requestId !== entriesRequestId.current) return

    if (entriesResult.error || activeResult.error) {
      console.error('Feil ved henting av timer:', entriesResult.error ?? activeResult.error)
      setNotice({ type: 'error', text: 'Kunne ikke hente timer for valgt dato.' })
      if (!entriesResult.error) {
        setEntries(entriesResult.data ?? [])
      }
      if (!activeResult.error) {
        setActiveEntry(activeResult.data ?? null)
      }
      setLoading(false)
      return
    }

    setNotice(null)
    setActiveEntry(activeResult.data ?? null)
    setEntries(entriesResult.data ?? [])
    setLoading(false)
  }

  async function fetchRangeEntries() {
    const requestId = ++rangeRequestId.current
    setRangeLoading(true)
    const start = viewMode === 'week' ? selectedWeek : getMonthStart(selectedMonth)
    const end = viewMode === 'week' ? getWeekEnd(selectedWeek) : getMonthEnd(selectedMonth)
    const { data, error } = await fetchEntriesForRange(start, end)

    if (requestId !== rangeRequestId.current) return

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
    setSelectedMonth((prev) => {
      const [year, month] = prev.split('-').map(Number)
      const date = new Date(year, month - 1 + direction, 1)
      return toMonthString(toDateString(date))
    })
  }

  async function startTimer(projectId: string) {
    if (activeEntry) return

    const userId = await getSignedInUserId()
    if (!userId) return

    const { data: existingActive, error: activeLookupError } = await fetchActiveTimerEntry()
    if (activeLookupError) {
      console.error('Feil ved kontroll av aktiv timer:', activeLookupError)
      setNotice({ type: 'error', text: 'Kunne ikke kontrollere aktiv timer. Prøv igjen.' })
      return
    }

    if (existingActive) {
      setNotice({ type: 'info', text: 'Du har allerede en aktiv timer.' })
      setActiveEntry(existingActive)
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
    if (toDateString(new Date(data.start_time)) === selectedDate) {
      setEntries((previous) => [data, ...previous])
    }
  }

  async function stopTimer() {
    if (!activeEntry) return

    const endAt = new Date().toISOString()
    const { data, error } = await stopTimerEntry(activeEntry.id, endAt)

    if (error) {
      console.error('Feil ved stopp av timer:', error)
      setNotice({ type: 'error', text: 'Kunne ikke stoppe timeren. Prøv igjen.' })
      return
    }

    setNotice({ type: 'info', text: 'Timer stoppet.' })
    setActiveEntry(null)
    if (data && toDateString(new Date(data.start_time)) === selectedDate) {
      setEntries((previous) => previous.map((entry) => (entry.id === data.id ? data : entry)))
    }
    await fetchEntries()
    if (viewMode !== 'day') {
      await fetchRangeEntries()
    }
  }

  async function handleStopTimer() {
    const saved = await saveSessionNote()
    if (!saved) return
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

  async function renameProject(id: string, name: string) {
    const { error } = await updateProjectRecord(id, name)

    if (error) {
      console.error('Feil ved endring av prosjektnavn:', error)
      setNotice({ type: 'error', text: 'Kunne ikke endre prosjektnavnet.' })
      return
    }

    setNotice(null)
    setProjects((previous) =>
      previous
        .map((project) => (project.id === id ? { ...project, name } : project))
        .sort((a, b) => a.name.localeCompare(b.name)),
    )
  }

  async function saveSessionNote() {
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
    setEntries((previous) =>
      previous.map((entry) => (entry.id === activeEntry.id ? { ...entry, description: nextNote || null } : entry)),
    )
    setNotice(null)
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
    renameProject,
    saveSessionNote,
  }
}
