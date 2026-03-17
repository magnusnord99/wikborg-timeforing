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
  const [notice, setNotice] = useState<{ type: 'error' | 'info'; text: string } | null>(null)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    fetchProjects()
  }, [])

  useEffect(() => {
    fetchEntries()
  }, [selectedDate])

  useEffect(() => {
    if (!activeEntry) return

    const interval = window.setInterval(() => {
      setNow(Date.now())
    }, 30000)

    return () => window.clearInterval(interval)
  }, [activeEntry])

  async function fetchProjects() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('name')

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
      setNotice({ type: 'error', text: 'Kunne ikke hente timer for valgt dato.' })
      setLoading(false)
      return
    }

    const active = (data ?? []).find((entry) => !entry.end_time)
    setNotice(null)
    setActiveEntry(active ?? null)
    setEntries(data ?? [])
    setLoading(false)
  }

  async function startTimer(projectId: string) {
    if (activeEntry) return

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const startAt = new Date().toISOString()
    const { data, error } = await supabase
      .from('time_entries')
      .insert({
        user_id: user.id,
        project_id: projectId,
        start_time: startAt,
      })
      .select()
      .single()

    if (error) {
      console.error('Feil ved start av timer:', error)
      setNotice({ type: 'error', text: 'Kunne ikke starte timeren. Prøv igjen.' })
      return
    }

    setNotice(null)
    setNow(Date.now())
    setActiveEntry(data)
    setEntries((prev) => [data, ...prev])
  }

  async function stopTimer() {
    if (!activeEntry) return

    const endAt = new Date().toISOString()
    const { error } = await supabase
      .from('time_entries')
      .update({ end_time: endAt })
      .eq('id', activeEntry.id)

    if (error) {
      console.error('Feil ved stopp av timer:', error)
      setNotice({ type: 'error', text: 'Kunne ikke stoppe timeren. Prøv igjen.' })
      return
    }

    setNotice(null)
    setActiveEntry(null)
    fetchEntries()
  }

  async function deleteEntry(id: string) {
    const { error } = await supabase.from('time_entries').delete().eq('id', id)

    if (error) {
      console.error('Feil ved sletting:', error)
      setNotice({ type: 'error', text: 'Kunne ikke slette timen.' })
      return
    }

    setNotice(null)
    fetchEntries()
  }

  async function updateEntry(id: string, updates: Partial<TimeEntry>) {
    const { error } = await supabase
      .from('time_entries')
      .update(updates)
      .eq('id', id)

    if (error) {
      console.error('Feil ved oppdatering:', error)
      setNotice({ type: 'error', text: 'Kunne ikke oppdatere timen.' })
      return
    }

    setNotice(null)
    fetchEntries()
  }

  async function addProject(name: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('projects')
      .insert({ user_id: user.id, name })
      .select()
      .single()

    if (error) {
      console.error('Feil ved opprettelse av prosjekt:', error)
      setNotice({ type: 'error', text: 'Kunne ikke opprette prosjektet.' })
      return
    }

    setNotice(null)
    setProjects((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
  }

  async function removeProject(id: string) {
    const { error } = await supabase.from('projects').delete().eq('id', id)

    if (error) {
      console.error('Feil ved sletting av prosjekt:', error)
      setNotice({ type: 'error', text: 'Kunne ikke fjerne prosjektet.' })
      return
    }

    setNotice(null)
    setProjects((prev) => prev.filter((project) => project.id !== id))
    fetchEntries()
  }

  const completedEntries = entries.filter((entry) => entry.end_time)
  const totalCompletedMinutes = completedEntries.reduce(
    (sum, entry) => sum + getMinutesBetween(entry.start_time, entry.end_time!),
    0,
  )
  const activeProject = projects.find((project) => project.id === activeEntry?.project_id) ?? null
  const isToday = selectedDate === toDateString(new Date())

  return (
    <div className="tracker-shell" style={styles.layout}>
      <header className="tracker-header" style={styles.header}>
        <div style={styles.titleWrap}>
          <span style={styles.eyebrow}>Arbeidsdag</span>
          <h1 style={styles.title}>Wikborg Tidsføring</h1>
          <p style={styles.subtitle}>
            {isToday
              ? 'Start en timer, legg inn notater fortløpende og få dagsoversikten automatisk.'
              : `Du ser historikken for ${formatDate(selectedDate)}.`}
          </p>
        </div>
        <div style={styles.headerRight}>
          <span style={styles.date}>{formatDate(selectedDate)}</span>
          <button onClick={() => supabase.auth.signOut()} style={styles.logout}>
            Logg ut
          </button>
        </div>
      </header>

      <section style={styles.heroSection}>
        <div className="tracker-stat-grid" style={styles.statsGrid}>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Aktiv status</span>
            <strong style={styles.statValue}>
              {activeEntry ? 'Timer kjører' : 'Ingen aktiv timer'}
            </strong>
            <span style={styles.statHint}>
              {activeEntry && activeProject
                ? `${activeProject.name} · ${formatHours(getMinutesBetween(activeEntry.start_time, new Date(now).toISOString()))}`
                : 'Du kan ha én aktiv timer om gangen.'}
            </span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Ført tid</span>
            <strong style={styles.statValue}>{formatHours(totalCompletedMinutes)}</strong>
            <span style={styles.statHint}>Summerte ferdige registreringer for valgt dato.</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Registreringer</span>
            <strong style={styles.statValue}>{entries.length}</strong>
            <span style={styles.statHint}>
              {completedEntries.length} fullført{completedEntries.length === 1 ? '' : 'e'} økter.
            </span>
          </div>
        </div>

        {notice && (
          <div
            style={{
              ...styles.notice,
              ...(notice.type === 'error' ? styles.noticeError : styles.noticeInfo),
            }}
          >
            <span>{notice.text}</span>
            <button type="button" onClick={() => setNotice(null)} style={styles.noticeDismiss}>
              Lukk
            </button>
          </div>
        )}

        {activeEntry && activeProject && (
          <div style={styles.activeCard}>
            <div>
              <span style={styles.activeBadge}>Aktiv timer</span>
              <div style={styles.activeProjectName}>{activeProject.name}</div>
              <div style={styles.activeMeta}>
                Startet {formatTime(activeEntry.start_time)} ·{' '}
                {formatHours(getMinutesBetween(activeEntry.start_time, new Date(now).toISOString()))}
              </div>
            </div>
            <button onClick={stopTimer} style={styles.primaryAction}>
              Stopp timer
            </button>
          </div>
        )}
      </section>

      <main className="tracker-main" style={styles.main}>
        <section className="tracker-panel tracker-panel--projects" style={styles.section}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>Prosjekter</h2>
              <p style={styles.sectionDescription}>Start og stopp timer direkte fra listen.</p>
            </div>
            <span style={styles.sectionMeta}>{projects.length} totalt</span>
          </div>
          <ProjectsList
            projects={projects}
            onAdd={addProject}
            onRemove={removeProject}
            activeEntry={activeEntry}
            onStart={startTimer}
            onStop={stopTimer}
          />
        </section>

        <section className="tracker-panel tracker-panel--timelog" style={styles.section}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>Timer</h2>
              <p style={styles.sectionDescription}>
                Bytt dato for å se historikk eller justere tidligere registreringer.
              </p>
            </div>
            <div className="tracker-toolbar" style={styles.dateControls}>
              <button
                type="button"
                onClick={() => setSelectedDate(shiftDate(selectedDate, -1))}
                style={styles.secondaryAction}
              >
                Forrige dag
              </button>
              {!isToday && (
                <button
                  type="button"
                  onClick={() => setSelectedDate(toDateString(new Date()))}
                  style={styles.secondaryAction}
                >
                  I dag
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedDate(shiftDate(selectedDate, 1))}
                disabled={selectedDate >= toDateString(new Date())}
                style={styles.secondaryAction}
              >
                Neste dag
              </button>
            </div>
          </div>

          <div className="tracker-toolbar" style={styles.dateToolbar}>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={styles.dateInput}
            />
            <span style={styles.dateHelper}>
              {isToday ? 'Aktive timer oppdateres fortløpende.' : 'Historiske timer kan redigeres manuelt.'}
            </span>
          </div>

          {loading ? (
            <p style={styles.loadingText}>Laster timer...</p>
          ) : (
            <TimeLog
              entries={entries}
              projects={projects}
              activeEntry={activeEntry}
              onEdit={updateEntry}
              onDelete={deleteEntry}
              now={now}
            />
          )}
        </section>

        <section className="tracker-panel tracker-panel--summary" style={styles.section}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>Oppsummering</h2>
              <p style={styles.sectionDescription}>Fordeling av tiden du har ført for valgt dato.</p>
            </div>
            <span style={styles.sectionMeta}>{formatHours(totalCompletedMinutes)}</span>
          </div>
          <DailySummary entries={entries} projects={projects} />
        </section>
      </main>
    </div>
  )
}

function shiftDate(dateString: string, days: number): string {
  const date = new Date(`${dateString}T12:00:00`)
  date.setDate(date.getDate() + days)
  return toDateString(date)
}

function getMinutesBetween(start: string, end: string): number {
  const startMs = new Date(start).getTime()
  const endMs = new Date(end).getTime()
  return Math.max(0, Math.round((endMs - startMs) / 60000))
}

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function formatDate(value: string): string {
  const date = new Date(`${value}T12:00:00`)
  return date.toLocaleDateString('nb-NO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('nb-NO', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatHours(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60

  if (hours === 0) return `${remainder} min`
  if (remainder === 0) return `${hours} t`
  return `${hours} t ${remainder} min`
}

const styles: Record<string, React.CSSProperties> = {
  layout: {
    minHeight: '100vh',
    maxWidth: 900,
    margin: '0 auto',
    padding: '32px 24px 48px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    flexWrap: 'wrap',
    gap: 16,
  },
  titleWrap: {
    maxWidth: 560,
  },
  eyebrow: {
    display: 'inline-block',
    marginBottom: 8,
    padding: '6px 10px',
    borderRadius: 999,
    background: 'var(--color-accent-soft)',
    color: 'var(--color-accent)',
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  title: {
    margin: 0,
    fontSize: 32,
    fontWeight: 700,
  },
  subtitle: {
    margin: '12px 0 0',
    maxWidth: 560,
    color: 'rgba(148, 163, 184, 0.9)',
    lineHeight: 1.6,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 16,
  },
  date: {
    color: 'var(--color-text-muted)',
    fontSize: 14,
  },
  logout: {
    padding: '8px 16px',
    background: 'transparent',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-muted)',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 14,
  },
  main: {
    gap: 24,
  },
  heroSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    marginBottom: 24,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 16,
  },
  statCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    padding: 18,
    background: 'var(--color-elevated)',
    border: '1px solid var(--color-elevated-border)',
    borderRadius: 16,
  },
  statLabel: {
    color: 'var(--color-text-muted)',
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 24,
    lineHeight: 1.2,
  },
  statHint: {
    color: 'rgba(148, 163, 184, 0.9)',
    fontSize: 14,
    lineHeight: 1.5,
  },
  notice: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    padding: '14px 16px',
    borderRadius: 12,
    border: '1px solid transparent',
  },
  noticeError: {
    background: 'rgba(127, 29, 29, 0.45)',
    borderColor: 'rgba(248, 113, 113, 0.24)',
    color: 'var(--color-text)',
  },
  noticeInfo: {
    background: 'var(--color-panel-strong)',
    borderColor: 'var(--color-elevated-border)',
    color: 'var(--color-text)',
  },
  noticeDismiss: {
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    background: 'transparent',
    color: 'var(--color-text-muted)',
    cursor: 'pointer',
    flexShrink: 0,
  },
  activeCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 20,
    flexWrap: 'wrap',
    padding: 20,
    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.18), rgba(30, 41, 59, 0.92))',
    border: '1px solid var(--color-accent-soft-strong)',
    borderRadius: 18,
    boxShadow: 'var(--shadow-soft)',
  },
  activeBadge: {
    display: 'inline-block',
    marginBottom: 8,
    padding: '6px 10px',
    borderRadius: 999,
    background: 'rgba(5, 6, 9, 0.35)',
    color: 'var(--color-text)',
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
  activeProjectName: {
    fontSize: 24,
    fontWeight: 700,
  },
  activeMeta: {
    marginTop: 6,
    color: 'rgba(191, 219, 254, 0.86)',
    fontSize: 14,
  },
  primaryAction: {
    padding: '12px 18px',
    borderRadius: 10,
    border: 'none',
    background: 'var(--color-danger)',
    color: 'white',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: 14,
  },
  section: {
    background: 'var(--color-panel)',
    border: '1px solid var(--color-border)',
    boxShadow: 'var(--shadow-soft)',
    borderRadius: 18,
    padding: 24,
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
    flexWrap: 'wrap',
    marginBottom: 18,
  },
  sectionTitle: {
    margin: 0,
    fontSize: 18,
    fontWeight: 600,
  },
  sectionDescription: {
    margin: '6px 0 0',
    color: 'rgba(148, 163, 184, 0.88)',
    fontSize: 14,
    lineHeight: 1.5,
  },
  sectionMeta: {
    padding: '8px 10px',
    borderRadius: 999,
    background: 'var(--color-accent-soft)',
    color: 'var(--color-text)',
    fontSize: 13,
    whiteSpace: 'nowrap',
  },
  dateControls: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
  },
  secondaryAction: {
    padding: '10px 14px',
    borderRadius: 10,
    border: '1px solid var(--color-border)',
    background: 'var(--color-input-bg)',
    color: 'var(--color-text)',
    cursor: 'pointer',
    fontSize: 14,
  },
  dateToolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
    marginBottom: 18,
  },
  dateInput: {
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    background: 'rgba(5, 6, 9, 0.72)',
    color: 'var(--color-text)',
    fontSize: 14,
  },
  dateHelper: {
    color: 'rgba(148, 163, 184, 0.86)',
    fontSize: 14,
  },
  loadingText: {
    margin: 0,
    color: 'var(--color-text-muted)',
  },
}
