import { useEffect, useState } from 'react'
import type { Project, TimeEntry } from '../../types'
import {
  getMonthGridEnd,
  getMonthGridStart,
  getWeekEnd,
  getWeekStart,
  shiftDate,
  toDateString,
  toMonthString,
} from '../time-utils'
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
    const [{ data, error }, activeResult] = await Promise.all([
      fetchEntriesForDate(selectedDate),
      fetchActiveTimerEntry(),
    ])

    if (error || activeResult.error) {
      console.error('Feil ved henting av timer:', error ?? activeResult.error)
      setNotice({ type: 'error', text: 'Kunne ikke hente timer for valgt dato.' })
      setLoading(false)
      return
    }

    setNotice(null)
    setActiveEntry((activeResult.data as TimeEntry | null) ?? null)
    setEntries(data ?? [])
    setLoading(false)
  }

  async function fetchRangeEntries() {
    setRangeLoading(true)
    const start = viewMode === 'week' ? selectedWeek : getMonthGridStart(selectedMonth)
    const end = viewMode === 'week' ? getWeekEnd(selectedWeek) : getMonthGridEnd(selectedMonth)
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

  async function refreshEntries() {
    await fetchEntries()
    if (viewMode !== 'day') {
      await fetchRangeEntries()
    }
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

    const { data: existingActive, error: activeError } = await fetchActiveTimerEntry()
    if (activeError) {
      console.error('Feil ved sjekk av aktiv timer:', activeError)
      setNotice({ type: 'error', text: 'Kunne ikke sjekke om en timer allerede kjører.' })
      return
    }

    if (existingActive) {
      setActiveEntry(existingActive as TimeEntry)
      setNotice({ type: 'info', text: 'Du har allerede en aktiv timer.' })
      return
    }

    const userId = await getSignedInUserId()
    if (!userId) return

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
    setEntries((previous) => [data, ...previous])
    if (viewMode !== 'day') {
      await fetchRangeEntries()
    }
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
    await refreshEntries()
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
    await refreshEntries()
  }

  async function updateEntry(id: string, updates: Partial<TimeEntry>) {
    const { error } = await updateTimeEntry(id, updates)

    if (error) {
      console.error('Feil ved oppdatering:', error)
      setNotice({ type: 'error', text: 'Kunne ikke oppdatere timen.' })
      return
    }

    setNotice(null)
    await refreshEntries()
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
    if (activeEntry?.project_id === id) {
      setNotice({ type: 'error', text: 'Stopp aktiv timer før prosjektet fjernes.' })
      return
    }

    const { error } = await deleteProjectRecord(id)

    if (error) {
      console.error('Feil ved sletting av prosjekt:', error)
      setNotice({ type: 'error', text: 'Kunne ikke fjerne prosjektet.' })
      return
    }

    setNotice(null)
    setProjects((previous) => previous.filter((project) => project.id !== id))
    await refreshEntries()
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
