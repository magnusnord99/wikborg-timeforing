import type { CSSProperties } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Project, TimeEntry } from '../../types'
import { formatHours, getMinutesBetween, groupEntriesByDate, parseLocalDate, shiftDate, toDateString } from '../time-utils'

interface Props {
  weekStart: string
  entries: TimeEntry[]
  projects: Project[]
  loading: boolean
  onDayClick: (date: string) => void
  onNav: (direction: -1 | 1) => void
}

function getISOWeekNumber(dateStr: string): number {
  const date = parseLocalDate(dateStr)
  const thursday = new Date(date)
  thursday.setDate(date.getDate() - ((date.getDay() + 6) % 7) + 3)
  const firstThursday = new Date(thursday.getFullYear(), 0, 4)
  return 1 + Math.round((thursday.getTime() - firstThursday.getTime()) / 604800000)
}

function formatShortDate(dateStr: string): string {
  const date = parseLocalDate(dateStr)
  return date.toLocaleDateString('nb-NO', { weekday: 'long', day: 'numeric', month: 'long' })
}

function formatShortMonth(dateStr: string): string {
  const date = parseLocalDate(dateStr)
  return date.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' })
}

export function WeekView({ weekStart, entries, projects, loading, onDayClick, onNav }: Props) {
  const today = toDateString(new Date())
  const weekEnd = shiftDate(weekStart, 6)
  const days = Array.from({ length: 7 }, (_, i) => shiftDate(weekStart, i))
  const weekNum = getISOWeekNumber(weekStart)

  const completed = entries.filter((e) => e.end_time)
  const byDate = groupEntriesByDate(completed)

  const weekYear = parseLocalDate(weekStart).getFullYear()
  const weekLabel = `Uke ${weekNum}, ${formatShortMonth(weekStart)}–${formatShortMonth(weekEnd)} ${weekYear}`

  const allProjectMinutes = new Map<string, number>()
  for (const entry of completed) {
    const mins = getMinutesBetween(entry.start_time, entry.end_time!)
    allProjectMinutes.set(entry.project_id, (allProjectMinutes.get(entry.project_id) ?? 0) + mins)
  }
  const weekTotalMinutes = [...allProjectMinutes.values()].reduce((sum, m) => sum + m, 0)

  return (
    <div>
      <div style={styles.navRow}>
        <button type="button" onClick={() => onNav(-1)} style={styles.navBtn}>
          <ChevronLeft size={16} />
          <span className="nav-btn-text">Forrige uke</span>
        </button>
        <span style={styles.navLabel}>{weekLabel}</span>
        <button type="button" onClick={() => onNav(1)} style={styles.navBtn} disabled={weekStart > today}>
          <span className="nav-btn-text">Neste uke</span>
          <ChevronRight size={16} />
        </button>
      </div>

      {loading ? (
        <p style={styles.loading}>Laster timer...</p>
      ) : (
        <div style={styles.dayList}>
          {days.map((date) => {
            const dayEntries = byDate.get(date) ?? []
            const projectMinutes = new Map<string, number>()
            for (const entry of dayEntries) {
              const mins = getMinutesBetween(entry.start_time, entry.end_time!)
              projectMinutes.set(entry.project_id, (projectMinutes.get(entry.project_id) ?? 0) + mins)
            }
            const dayTotal = [...projectMinutes.values()].reduce((sum, m) => sum + m, 0)
            const isToday = date === today
            const isFuture = date > today

            return (
              <button
                key={date}
                type="button"
                onClick={() => onDayClick(date)}
                style={{
                  ...styles.dayRow,
                  ...(isToday ? styles.dayRowToday : {}),
                  ...(isFuture ? styles.dayRowFuture : {}),
                }}
              >
                <div style={styles.dayHeader}>
                  <span style={{ ...styles.dayName, ...(isToday ? styles.dayNameToday : {}) }}>
                    {formatShortDate(date)}
                  </span>
                  <span style={styles.dayTotal}>
                    {dayTotal > 0 ? formatHours(dayTotal) : '—'}
                  </span>
                </div>
                {dayTotal > 0 && (
                  <div style={styles.projectList}>
                    {[...projectMinutes.entries()]
                      .sort((a, b) => b[1] - a[1])
                      .map(([projectId, mins]) => {
                        const project = projects.find((p) => p.id === projectId)
                        return (
                          <div key={projectId} style={styles.projectRow}>
                            <span style={styles.projectName}>{project?.name ?? 'Ukjent'}</span>
                            <span style={styles.projectHours}>{formatHours(mins)}</span>
                          </div>
                        )
                      })}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      )}

      {!loading && weekTotalMinutes > 0 && (
        <div style={styles.weekSummary}>
          <div style={styles.weekSummaryHeader}>
            <span>Totalt denne uken</span>
            <span>{formatHours(weekTotalMinutes)}</span>
          </div>
          <div style={styles.projectList}>
            {[...allProjectMinutes.entries()]
              .sort((a, b) => b[1] - a[1])
              .map(([projectId, mins]) => {
                const project = projects.find((p) => p.id === projectId)
                return (
                  <div key={projectId} style={styles.projectRow}>
                    <span style={styles.projectName}>{project?.name ?? 'Ukjent'}</span>
                    <span style={styles.projectHours}>{formatHours(mins)}</span>
                  </div>
                )
              })}
          </div>
        </div>
      )}
    </div>
  )
}

const styles: Record<string, CSSProperties> = {
  navRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  navBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 14px',
    borderRadius: 10,
    border: '1px solid var(--color-border)',
    background: 'var(--color-input-bg)',
    color: 'var(--color-text)',
    fontSize: 14,
    cursor: 'pointer',
  },
  navLabel: {
    fontSize: 15,
    fontWeight: 600,
    color: 'var(--color-text)',
    textAlign: 'center',
  },
  loading: {
    margin: 0,
    color: 'var(--color-text-muted)',
  },
  dayList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  dayRow: {
    width: '100%',
    textAlign: 'left',
    padding: '12px 14px',
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    background: 'var(--color-input-bg)',
    color: 'var(--color-text)',
    cursor: 'pointer',
  },
  dayRowToday: {
    border: '1px solid var(--color-accent)',
  },
  dayRowFuture: {
    opacity: 0.45,
  },
  dayHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayName: {
    fontSize: 14,
    fontWeight: 500,
    textTransform: 'capitalize',
  },
  dayNameToday: {
    color: 'var(--color-accent)',
    fontWeight: 700,
  },
  dayTotal: {
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--color-text-muted)',
  },
  projectList: {
    marginTop: 8,
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
  },
  projectRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 13,
    color: 'var(--color-text-muted)',
    paddingLeft: 8,
  },
  projectName: {},
  projectHours: {},
  weekSummary: {
    marginTop: 16,
    padding: '14px 16px',
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    background: 'var(--color-accent-soft)',
  },
  weekSummaryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontWeight: 700,
    fontSize: 15,
    marginBottom: 8,
  },
}
