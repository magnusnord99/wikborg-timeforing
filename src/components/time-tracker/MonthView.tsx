import type { CSSProperties } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Project, TimeEntry } from '../../types'
import { formatHours, getMinutesBetween, getMonthEnd, getMonthStart, groupEntriesByDate, shiftDate, toDateString, toMonthString } from '../time-utils'

interface Props {
  month: string
  entries: TimeEntry[]
  projects: Project[]
  loading: boolean
  onDayClick: (date: string) => void
  onNav: (direction: -1 | 1) => void
}

const DAY_LABELS = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn']

function buildCalendarGrid(month: string): string[][] {
  const monthStart = getMonthStart(month)
  const monthEnd = getMonthEnd(month)

  const startDate = new Date(`${monthStart}T12:00:00`)
  const startDay = startDate.getDay()
  const gridStartOffset = startDay === 0 ? -6 : 1 - startDay
  const gridStart = shiftDate(monthStart, gridStartOffset)

  const endDate = new Date(`${monthEnd}T12:00:00`)
  const endDay = endDate.getDay()
  const gridEndOffset = endDay === 0 ? 0 : 7 - endDay
  const gridEnd = shiftDate(monthEnd, gridEndOffset)

  const weeks: string[][] = []
  let current = gridStart

  while (current <= gridEnd) {
    const week: string[] = []
    for (let i = 0; i < 7; i++) {
      week.push(current)
      current = shiftDate(current, 1)
    }
    weeks.push(week)
  }

  return weeks
}

export function MonthView({ month, entries, projects, loading, onDayClick, onNav }: Props) {
  const today = toDateString(new Date())
  const weeks = buildCalendarGrid(month)

  const completed = entries.filter((e) => e.end_time)
  const byDate = groupEntriesByDate(completed)

  const monthLabel = new Date(`${month}-15T12:00:00`).toLocaleDateString('nb-NO', {
    month: 'long',
    year: 'numeric',
  })

  const allProjectMinutes = new Map<string, number>()
  for (const entry of completed) {
    const mins = getMinutesBetween(entry.start_time, entry.end_time!)
    allProjectMinutes.set(entry.project_id, (allProjectMinutes.get(entry.project_id) ?? 0) + mins)
  }
  const monthTotalMinutes = [...allProjectMinutes.values()].reduce((sum, m) => sum + m, 0)

  const currentMonth = toMonthString(today)
  const isCurrentOrFutureMonth = month >= currentMonth

  return (
    <div>
      <div style={styles.navRow}>
        <button type="button" onClick={() => onNav(-1)} style={styles.navBtn}>
          <ChevronLeft size={16} />
          <span className="nav-btn-text">Forrige</span>
        </button>
        <span style={styles.navLabel}>{monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}</span>
        <button type="button" onClick={() => onNav(1)} style={styles.navBtn} disabled={isCurrentOrFutureMonth}>
          <span className="nav-btn-text">Neste</span>
          <ChevronRight size={16} />
        </button>
      </div>

      {loading ? (
        <p style={styles.loading}>Laster timer...</p>
      ) : (
        <>
          <div style={styles.grid}>
            {DAY_LABELS.map((label) => (
              <div key={label} style={styles.dayLabel}>
                {label}
              </div>
            ))}
            {weeks.flat().map((date) => {
              const dayEntries = byDate.get(date) ?? []
              const dayTotal = dayEntries.reduce(
                (sum, e) => sum + getMinutesBetween(e.start_time, e.end_time!),
                0,
              )
              const isToday = date === today
              const isThisMonth = toMonthString(date) === month
              const isFuture = date > today

              return (
                <button
                  key={date}
                  type="button"
                  onClick={() => onDayClick(date)}
                  style={{
                    ...styles.cell,
                    ...(isToday ? styles.cellToday : {}),
                    ...(!isThisMonth ? styles.cellOutside : {}),
                    ...(isFuture && isThisMonth ? styles.cellFuture : {}),
                  }}
                >
                  <span style={{ ...styles.cellDay, ...(isToday ? styles.cellDayToday : {}) }}>
                    {new Date(`${date}T12:00:00`).getDate()}
                  </span>
                  {dayTotal > 0 && (
                    <span style={styles.cellHours}>{formatHours(dayTotal)}</span>
                  )}
                </button>
              )
            })}
          </div>

          {monthTotalMinutes > 0 && (
            <div style={styles.monthSummary}>
              <div style={styles.monthSummaryHeader}>
                <span>Totalt denne måneden</span>
                <span>{formatHours(monthTotalMinutes)}</span>
              </div>
              <div style={styles.projectList}>
                {[...allProjectMinutes.entries()]
                  .sort((a, b) => b[1] - a[1])
                  .map(([projectId, mins]) => {
                    const project = projects.find((p) => p.id === projectId)
                    return (
                      <div key={projectId} style={styles.projectRow}>
                        <span>{project?.name ?? 'Ukjent'}</span>
                        <span>{formatHours(mins)}</span>
                      </div>
                    )
                  })}
              </div>
            </div>
          )}
        </>
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
  },
  loading: {
    margin: 0,
    color: 'var(--color-text-muted)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: 3,
  },
  dayLabel: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--color-text-muted)',
    padding: '4px 0 8px',
  },
  cell: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    minHeight: 60,
    padding: '6px 8px',
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    background: 'var(--color-input-bg)',
    color: 'var(--color-text)',
    cursor: 'pointer',
    textAlign: 'left',
  },
  cellToday: {
    border: '1px solid var(--color-accent)',
  },
  cellOutside: {
    opacity: 0.3,
  },
  cellFuture: {
    opacity: 0.5,
  },
  cellDay: {
    fontSize: 13,
    fontWeight: 500,
    lineHeight: 1,
  },
  cellDayToday: {
    color: 'var(--color-accent)',
    fontWeight: 700,
  },
  cellHours: {
    marginTop: 4,
    fontSize: 11,
    color: 'var(--color-text-muted)',
    lineHeight: 1.2,
  },
  monthSummary: {
    marginTop: 16,
    padding: '14px 16px',
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    background: 'var(--color-accent-soft)',
  },
  monthSummaryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontWeight: 700,
    fontSize: 15,
    marginBottom: 8,
  },
  projectList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  projectRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 13,
    color: 'var(--color-text-muted)',
    paddingLeft: 8,
  },
}
