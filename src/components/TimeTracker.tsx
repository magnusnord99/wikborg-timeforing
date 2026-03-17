import { useEffect, useState } from 'react'
import {
  Activity,
  BellRing,
  CalendarDays,
  ChartColumn,
  Clock3,
  FolderKanban,
  ListTodo,
  LogOut,
  Play,
  Square,
  TimerReset,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Project, TimeEntry } from '../types'
import { ProjectsList } from './ProjectsList'
import { TimeLog } from './TimeLog'
import { DailySummary } from './DailySummary'

type PanelId = 'focus' | 'projects' | 'log' | 'summary'

export function TimeTracker() {
  const [projects, setProjects] = useState<Project[]>([])
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null)
  const [selectedDate, setSelectedDate] = useState(() => toDateString(new Date()))
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState<{ type: 'error' | 'info'; text: string } | null>(null)
  const [now, setNow] = useState(() => Date.now())
  const [activePanel, setActivePanel] = useState<PanelId>('projects')
  const [sessionNote, setSessionNote] = useState('')

  useEffect(() => {
    void fetchProjects()
  }, [])

  useEffect(() => {
    void fetchEntries()
  }, [selectedDate])

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
    const { data, error } = await supabase.from('projects').select('*').order('name')

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

    setNotice({ type: 'info', text: 'Timer startet. Fokusmodus er aktiv.' })
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

    setNotice({ type: 'info', text: 'Timer stoppet.' })
    setActiveEntry(null)
    await fetchEntries()
  }

  async function handleStopTimer() {
    await saveSessionNote()
    await stopTimer()
  }

  async function deleteEntry(id: string) {
    const { error } = await supabase.from('time_entries').delete().eq('id', id)

    if (error) {
      console.error('Feil ved sletting:', error)
      setNotice({ type: 'error', text: 'Kunne ikke slette timen.' })
      return
    }

    setNotice(null)
    await fetchEntries()
  }

  async function updateEntry(id: string, updates: Partial<TimeEntry>) {
    const { error } = await supabase.from('time_entries').update(updates).eq('id', id)

    if (error) {
      console.error('Feil ved oppdatering:', error)
      setNotice({ type: 'error', text: 'Kunne ikke oppdatere timen.' })
      return
    }

    setNotice(null)
    await fetchEntries()
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
    await fetchEntries()
  }

  async function saveSessionNote() {
    if (!activeEntry) return

    const nextNote = sessionNote.trim()
    if ((activeEntry.description ?? '') === nextNote) return

    const { error } = await supabase
      .from('time_entries')
      .update({ description: nextNote || null })
      .eq('id', activeEntry.id)

    if (error) {
      console.error('Feil ved lagring av notat:', error)
      setNotice({ type: 'error', text: 'Kunne ikke lagre arbeidsnotatet.' })
      return
    }

    setActiveEntry((prev) => (prev ? { ...prev, description: nextNote || null } : prev))
  }

  const completedEntries = entries.filter((entry) => entry.end_time)
  const totalCompletedMinutes = completedEntries.reduce(
    (sum, entry) => sum + getMinutesBetween(entry.start_time, entry.end_time!),
    0,
  )
  const activeProject = projects.find((project) => project.id === activeEntry?.project_id) ?? null
  const isToday = selectedDate === toDateString(new Date())
  const activeSeconds = activeEntry
    ? getSecondsBetween(activeEntry.start_time, new Date(now).toISOString())
    : 0
  const activeDurationLabel = formatDigitalDuration(activeSeconds)

  useEffect(() => {
    if (activeEntry) {
      const projectLabel = activeProject?.name ? ` ${activeProject.name}` : ''
      document.title = `● ${activeDurationLabel}${projectLabel} | Wikborg Tidsføring`
      return
    }

    document.title = 'Wikborg Tidsføring'
  }, [activeDurationLabel, activeEntry, activeProject?.name])

  const navItems: Array<{ id: PanelId; label: string; icon: LucideIcon; meta: string }> = [
    {
      id: 'focus',
      label: 'Fokus',
      icon: TimerReset,
      meta: activeEntry ? 'Aktiv økt' : 'Ingen økt',
    },
    {
      id: 'projects',
      label: 'Prosjekter',
      icon: FolderKanban,
      meta: `${projects.length}`,
    },
    {
      id: 'log',
      label: 'Timer',
      icon: ListTodo,
      meta: `${entries.length}`,
    },
    {
      id: 'summary',
      label: 'Oppsummering',
      icon: ChartColumn,
      meta: formatHours(totalCompletedMinutes),
    },
  ]

  function renderPanel() {
    if (activePanel === 'focus') {
      return (
        <section style={styles.focusSection}>
          {activeEntry && activeProject ? (
            <div className="tracker-focus-grid" style={styles.focusGrid}>
              <div style={styles.focusHero}>
                <div style={styles.focusHeroTop}>
                  <span style={styles.focusPill}>
                    <Activity size={14} />
                    Sesjon aktiv
                  </span>
                  <span style={styles.focusClock}>
                    <Clock3 size={15} />
                    Startet {formatTime(activeEntry.start_time)}
                  </span>
                </div>

                <div style={styles.focusProjectRow}>
                  <FolderKanban size={18} />
                  <span>{activeProject.name}</span>
                </div>

                <div style={styles.focusTimer}>{activeDurationLabel}</div>

                <div style={styles.focusActions}>
                  <button onClick={() => void handleStopTimer()} style={styles.stopAction}>
                    <Square size={16} />
                    <span>Stopp timer</span>
                  </button>
                  <button type="button" onClick={() => setActivePanel('log')} style={styles.secondaryActionWide}>
                    <ListTodo size={16} />
                    <span>Åpne timelogg</span>
                  </button>
                </div>

                <label style={styles.noteLabel}>
                  <span style={styles.noteLabelText}>Arbeidsnotat</span>
                  <textarea
                    value={sessionNote}
                    onChange={(e) => setSessionNote(e.target.value)}
                    onBlur={() => void saveSessionNote()}
                    placeholder="Skriv kort hva du jobber med akkurat nå"
                    style={styles.noteInput}
                  />
                </label>
              </div>

              <div style={styles.focusSide}>
                <div style={styles.miniStatCard}>
                  <span style={styles.miniStatLabel}>Ført i dag</span>
                  <strong style={styles.miniStatValue}>{formatHours(totalCompletedMinutes)}</strong>
                </div>
                <div style={styles.miniStatCard}>
                  <span style={styles.miniStatLabel}>Økter i dag</span>
                  <strong style={styles.miniStatValue}>{entries.length}</strong>
                </div>
                <div style={styles.miniStatCard}>
                  <span style={styles.miniStatLabel}>Fullført</span>
                  <strong style={styles.miniStatValue}>{completedEntries.length}</strong>
                </div>
                <button type="button" onClick={() => setActivePanel('summary')} style={styles.secondaryGhostAction}>
                  <ChartColumn size={16} />
                  <span>Se oppsummering</span>
                </button>
              </div>
            </div>
          ) : (
            <div style={styles.idleFocusCard}>
              <span style={styles.focusPillMuted}>
                <Play size={14} />
                Ingen aktiv timer
              </span>
              <h2 style={styles.idleFocusTitle}>Start fra prosjektlisten når du er klar</h2>
              <p style={styles.idleFocusText}>
                Fokusmodus blir automatisk aktiv når en økt starter. Da skjules resten av støyen.
              </p>
              <button type="button" onClick={() => setActivePanel('projects')} style={styles.primaryBlueAction}>
                <FolderKanban size={16} />
                <span>Gå til prosjekter</span>
              </button>
            </div>
          )}
        </section>
      )
    }

    if (activePanel === 'projects') {
      return (
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>Prosjekter</h2>
              <p style={styles.sectionDescription}>Velg hvor du skal føre tid, og start direkte.</p>
            </div>
            <span style={styles.sectionMeta}>{projects.length} totalt</span>
          </div>
          <ProjectsList
            projects={projects}
            onAdd={(name) => void addProject(name)}
            onRemove={(id) => void removeProject(id)}
            activeEntry={activeEntry}
            onStart={(projectId) => void startTimer(projectId)}
            onStop={() => void handleStopTimer()}
          />
        </section>
      )
    }

    if (activePanel === 'log') {
      return (
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>Timer</h2>
              <p style={styles.sectionDescription}>Se og rediger registreringer for valgt dato.</p>
            </div>
            <div className="tracker-toolbar" style={styles.dateControls}>
              <button
                type="button"
                onClick={() => setSelectedDate(shiftDate(selectedDate, -1))}
                style={styles.secondaryActionWide}
              >
                <CalendarDays size={16} />
                <span>Forrige dag</span>
              </button>
              {!isToday && (
                <button
                  type="button"
                  onClick={() => setSelectedDate(toDateString(new Date()))}
                  style={styles.secondaryActionWide}
                >
                  <Clock3 size={16} />
                  <span>I dag</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedDate(shiftDate(selectedDate, 1))}
                disabled={selectedDate >= toDateString(new Date())}
                style={styles.secondaryActionWide}
              >
                <CalendarDays size={16} />
                <span>Neste dag</span>
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
              onEdit={(id, updates) => void updateEntry(id, updates)}
              onDelete={(id) => void deleteEntry(id)}
              now={now}
            />
          )}
        </section>
      )
    }

    return (
      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <div>
            <h2 style={styles.sectionTitle}>Oppsummering</h2>
            <p style={styles.sectionDescription}>Se hvordan tiden fordeler seg på prosjekter.</p>
          </div>
          <span style={styles.sectionMeta}>{formatHours(totalCompletedMinutes)}</span>
        </div>
        <DailySummary entries={entries} projects={projects} />
      </section>
    )
  }

  return (
    <div className="tracker-shell" style={styles.layout}>
      <div className="tracker-layout" style={styles.workspace}>
        <aside className="tracker-rail" style={styles.rail}>
          <div style={styles.railTop}>
            <div style={styles.brandMark} title="Wikborg Tidsforing">
              <Clock3 size={18} />
            </div>
          </div>

          <nav className="tracker-nav" style={styles.nav}>
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activePanel === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActivePanel(item.id)}
                  className={isActive ? 'tracker-nav-button tracker-nav-button--active' : 'tracker-nav-button'}
                  style={styles.navButton}
                  aria-label={item.label}
                  title={`${item.label}: ${item.meta}`}
                >
                  <span style={styles.navIconWrap}>
                    <Icon size={18} />
                    {item.id === 'focus' && activeEntry && <span style={styles.liveDot} />}
                  </span>
                </button>
              )
            })}
          </nav>

          <div style={styles.railFooter}>
            <button
              type="button"
              onClick={() => supabase.auth.signOut()}
              style={styles.logoutRail}
              aria-label="Logg ut"
              title="Logg ut"
            >
              <LogOut size={16} />
            </button>
          </div>
        </aside>

        <div className="tracker-content-stack" style={styles.contentStack}>
          <header className="tracker-header" style={styles.header}>
            <div style={styles.titleWrap}>
              <span style={styles.eyebrow}>{activeEntry ? 'Fokusmodus' : 'Arbeidsdag'}</span>
              <h1 style={styles.title}>{activeEntry ? 'Timeren kjører' : 'Wikborg Tidsføring'}</h1>
              <p style={styles.subtitle}>
                {activeEntry
                  ? 'Vis bare det du trenger mens du jobber. Resten ligger i menyen til venstre.'
                  : isToday
                    ? 'Velg prosjekt, start timer og hold oversikten uten å forlate siden.'
                    : `Du ser historikken for ${formatDate(selectedDate)}.`}
              </p>
            </div>

            <div style={styles.headerTools}>
              <div style={styles.headerChip}>
                <CalendarDays size={16} />
                <span>{formatDate(selectedDate)}</span>
              </div>
              {activeEntry && (
                <div style={styles.headerChipLive}>
                  <Activity size={16} />
                  <span>{activeDurationLabel}</span>
                </div>
              )}
            </div>
          </header>

          {notice && (
            <div
              style={{
                ...styles.notice,
                ...(notice.type === 'error' ? styles.noticeError : styles.noticeInfo),
              }}
            >
              <div style={styles.noticeContent}>
                <BellRing size={16} />
                <span>{notice.text}</span>
              </div>
              <button type="button" onClick={() => setNotice(null)} style={styles.noticeDismiss}>
                Lukk
              </button>
            </div>
          )}

          {renderPanel()}
        </div>
      </div>
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

function getSecondsBetween(start: string, end: string): number {
  const startMs = new Date(start).getTime()
  const endMs = new Date(end).getTime()
  return Math.max(0, Math.floor((endMs - startMs) / 1000))
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

function formatDigitalDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`
}

const styles: Record<string, React.CSSProperties> = {
  layout: {
    minHeight: '100vh',
    width: '100%',
    maxWidth: 'none',
    margin: 0,
    padding: '0 24px 32px 0',
  },
  workspace: {
    display: 'grid',
    gridTemplateColumns: '76px minmax(0, 1fr)',
    gap: 24,
    alignItems: 'start',
  },
  rail: {
    position: 'sticky',
    top: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
    alignItems: 'center',
    padding: '18px 8px',
    background: 'rgba(15, 23, 42, 0.86)',
    border: '1px solid var(--color-elevated-border)',
    borderLeft: 'none',
    borderRadius: '0 22px 22px 0',
    boxShadow: 'var(--shadow-soft)',
    minHeight: '100vh',
  },
  railTop: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    paddingBottom: 10,
    borderBottom: '1px solid rgba(148, 163, 184, 0.14)',
  },
  brandMark: {
    width: 36,
    height: 36,
    borderRadius: 12,
    display: 'grid',
    placeItems: 'center',
    background: 'rgba(59, 130, 246, 0.14)',
    color: '#93c5fd',
    flexShrink: 0,
  },
  railTitle: {
    fontSize: 13,
    fontWeight: 700,
    lineHeight: 1.1,
  },
  railSubtitle: {
    fontSize: 12,
    color: 'var(--color-text-muted)',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    width: '100%',
    alignItems: 'center',
  },
  navButton: {
    width: 52,
    height: 52,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    borderRadius: 14,
    border: '1px solid transparent',
    background: 'transparent',
    color: 'var(--color-text)',
    cursor: 'pointer',
  },
  navIconWrap: {
    position: 'relative',
    width: 34,
    height: 34,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    background: 'rgba(51, 65, 85, 0.44)',
    flexShrink: 0,
  },
  liveDot: {
    position: 'absolute',
    right: 6,
    top: 6,
    width: 8,
    height: 8,
    borderRadius: 999,
    background: '#22c55e',
    boxShadow: '0 0 0 4px rgba(34, 197, 94, 0.16)',
  },
  railFooter: {
    marginTop: 'auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  logoutRail: {
    width: 52,
    height: 52,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    background: 'transparent',
    color: 'var(--color-text-muted)',
    cursor: 'pointer',
  },
  contentStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
    paddingTop: 24,
    paddingRight: 8,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
    flexWrap: 'wrap',
  },
  titleWrap: {
    maxWidth: 620,
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
    lineHeight: 1.05,
  },
  subtitle: {
    margin: '10px 0 0',
    color: 'rgba(148, 163, 184, 0.88)',
    lineHeight: 1.6,
  },
  headerTools: {
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap',
  },
  headerChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 12px',
    borderRadius: 14,
    background: 'var(--color-panel)',
    border: '1px solid var(--color-elevated-border)',
    color: 'var(--color-text)',
  },
  headerChipLive: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 12px',
    borderRadius: 14,
    background: 'rgba(34, 197, 94, 0.12)',
    border: '1px solid rgba(34, 197, 94, 0.2)',
    color: '#bbf7d0',
  },
  notice: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    padding: '14px 16px',
    borderRadius: 14,
    border: '1px solid transparent',
  },
  noticeContent: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
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
    borderRadius: 10,
    border: '1px solid var(--color-border)',
    background: 'transparent',
    color: 'var(--color-text-muted)',
    cursor: 'pointer',
  },
  focusSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
  },
  focusGrid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.45fr) minmax(260px, 0.8fr)',
    gap: 18,
  },
  focusHero: {
    padding: 24,
    borderRadius: 24,
    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.18), rgba(15, 23, 42, 0.98))',
    border: '1px solid rgba(96, 165, 250, 0.2)',
    boxShadow: 'var(--shadow-soft)',
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
  },
  focusHeroTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
  },
  focusPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '7px 10px',
    borderRadius: 999,
    background: 'rgba(34, 197, 94, 0.14)',
    color: '#bbf7d0',
    fontSize: 12,
    fontWeight: 700,
  },
  focusPillMuted: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '7px 10px',
    borderRadius: 999,
    background: 'var(--color-accent-soft)',
    color: '#bfdbfe',
    fontSize: 12,
    fontWeight: 700,
  },
  focusClock: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    color: 'rgba(191, 219, 254, 0.82)',
    fontSize: 13,
  },
  focusProjectRow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 18,
    fontWeight: 600,
  },
  focusTimer: {
    fontSize: 72,
    lineHeight: 1,
    fontWeight: 800,
    letterSpacing: '-0.06em',
  },
  focusActions: {
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap',
  },
  stopAction: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 16px',
    borderRadius: 12,
    border: 'none',
    background: 'var(--color-danger)',
    color: 'white',
    fontWeight: 700,
    cursor: 'pointer',
  },
  primaryBlueAction: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 16px',
    borderRadius: 12,
    border: 'none',
    background: 'var(--color-accent)',
    color: 'white',
    fontWeight: 700,
    cursor: 'pointer',
  },
  secondaryActionWide: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 14px',
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    background: 'var(--color-input-bg)',
    color: 'var(--color-text)',
    cursor: 'pointer',
  },
  secondaryGhostAction: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '12px 14px',
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    background: 'transparent',
    color: 'var(--color-text)',
    cursor: 'pointer',
  },
  noteLabel: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  noteLabelText: {
    fontSize: 13,
    color: 'rgba(191, 219, 254, 0.82)',
    fontWeight: 600,
  },
  noteInput: {
    minHeight: 110,
    resize: 'vertical',
    padding: 12,
    borderRadius: 14,
    border: '1px solid rgba(96, 165, 250, 0.18)',
    background: 'rgba(15, 23, 42, 0.8)',
    color: 'var(--color-text)',
  },
  focusSide: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  miniStatCard: {
    padding: '16px 18px',
    borderRadius: 18,
    background: 'var(--color-panel)',
    border: '1px solid var(--color-elevated-border)',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  miniStatLabel: {
    fontSize: 12,
    color: 'var(--color-text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  miniStatValue: {
    fontSize: 24,
    lineHeight: 1.1,
  },
  idleFocusCard: {
    padding: 24,
    borderRadius: 24,
    background: 'var(--color-panel)',
    border: '1px solid var(--color-elevated-border)',
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    alignItems: 'flex-start',
  },
  idleFocusTitle: {
    margin: 0,
    fontSize: 28,
    lineHeight: 1.1,
  },
  idleFocusText: {
    margin: 0,
    color: 'rgba(148, 163, 184, 0.88)',
    maxWidth: 540,
  },
  section: {
    background: 'var(--color-panel)',
    border: '1px solid var(--color-border)',
    boxShadow: 'var(--shadow-soft)',
    borderRadius: 20,
    padding: 22,
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
    fontSize: 20,
    fontWeight: 700,
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
  dateToolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
    marginBottom: 18,
  },
  dateInput: {
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid var(--color-border)',
    background: 'var(--color-input-bg)',
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
