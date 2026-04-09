import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Project, TimeEntry } from '../types'
import { ProjectsList } from './ProjectsList'
import { TimeLog } from './TimeLog'
import { DailySummary } from './DailySummary'

export function TimeTracker() {
  const [projects, setProjects] = useState<Project[]>([])
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null)
  const [selectedDate, setSelectedDate] = useState(() => toDateString(new Date()))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProjects()
  }, [])

  useEffect(() => {
    fetchEntries()
  }, [selectedDate])

  async function fetchProjects() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('name')

    if (error) {
      console.error('Feil ved henting av prosjekter:', error)
      return
    }
    setProjects(data ?? [])
  }

  async function fetchEntries() {
    setLoading(true)
    const start = `${selectedDate}T00:00:00`
    const end = `${selectedDate}T23:59:59`

    const { data, error } = await supabase
      .from('time_entries')
      .select('*')
      .gte('start_time', start)
      .lte('start_time', end)
      .order('start_time', { ascending: false })

    if (error) {
      console.error('Feil ved henting av timer:', error)
      setLoading(false)
      return
    }

    const active = (data ?? []).find((e) => !e.end_time)
    setActiveEntry(active ?? null)
    setEntries(data ?? [])
    setLoading(false)
  }

  async function startTimer(projectId: string) {
    if (activeEntry) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from('time_entries')
      .insert({
        user_id: user.id,
        project_id: projectId,
        start_time: now,
      })
      .select()
      .single()

    if (error) {
      console.error('Feil ved start av timer:', error)
      return
    }
    setActiveEntry(data)
    setEntries((prev) => [data, ...prev])
  }

  async function stopTimer() {
    if (!activeEntry) return

    const now = new Date().toISOString()
    const { error } = await supabase
      .from('time_entries')
      .update({ end_time: now })
      .eq('id', activeEntry.id)

    if (error) {
      console.error('Feil ved stopp av timer:', error)
      return
    }
    setActiveEntry(null)
    fetchEntries()
  }

  async function deleteEntry(id: string) {
    await supabase.from('time_entries').delete().eq('id', id)
    fetchEntries()
  }

  async function updateEntry(id: string, updates: Partial<TimeEntry>) {
    const { error } = await supabase
      .from('time_entries')
      .update(updates)
      .eq('id', id)

    if (error) {
      console.error('Feil ved oppdatering:', error)
      return
    }
    fetchEntries()
  }

  async function addProject(name: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('projects')
      .insert({ user_id: user.id, name })
      .select()
      .single()

    if (error) {
      console.error('Feil ved opprettelse av prosjekt:', error)
      return
    }
    setProjects((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
  }

  async function removeProject(id: string) {
    await supabase.from('projects').delete().eq('id', id)
    setProjects((prev) => prev.filter((p) => p.id !== id))
    fetchEntries()
  }

  return (
    <div className="app-layout">
      <header className="app-header">
        <h1 style={styles.title}>Wikborg Tidsføring</h1>
        <div className="app-header-right">
          <span style={styles.date}>{formatDate(selectedDate)}</span>
          <button
            onClick={() => supabase.auth.signOut()}
            style={styles.logout}
          >
            Logg ut
          </button>
        </div>
      </header>

      <main className="app-main">
        <section className="app-section">
          <h2 style={styles.sectionTitle}>Prosjekter</h2>
          <ProjectsList
            projects={projects}
            onAdd={addProject}
            onRemove={removeProject}
            activeEntry={activeEntry}
            onStart={startTimer}
            onStop={stopTimer}
          />
        </section>

        <section className="app-section">
          <h2 style={styles.sectionTitle}>Dagens timer</h2>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={styles.dateInput}
          />
          {loading ? (
            <p>Laster...</p>
          ) : (
            <TimeLog
              entries={entries}
              projects={projects}
              activeEntry={activeEntry}
              onEdit={updateEntry}
              onDelete={deleteEntry}
            />
          )}
        </section>

        <section className="app-section">
          <h2 style={styles.sectionTitle}>Oppsummering</h2>
          <DailySummary entries={entries} projects={projects} />
        </section>
      </main>
    </div>
  )
}

function toDateString(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function formatDate(s: string): string {
  const d = new Date(s + 'T12:00:00')
  return d.toLocaleDateString('nb-NO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

const styles: Record<string, React.CSSProperties> = {
  title: {
    margin: 0,
    fontSize: 24,
    fontWeight: 700,
  },
  date: {
    color: '#94a3b8',
    fontSize: 14,
  },
  logout: {
    padding: '8px 16px',
    background: 'transparent',
    border: '1px solid #475569',
    color: '#94a3b8',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 14,
  },
  sectionTitle: {
    margin: '0 0 16px',
    fontSize: 18,
    fontWeight: 600,
  },
  dateInput: {
    padding: 8,
    borderRadius: 8,
    border: '1px solid #334155',
    background: '#0f172a',
    color: '#e2e8f0',
    marginBottom: 16,
    fontSize: 14,
  },
}
