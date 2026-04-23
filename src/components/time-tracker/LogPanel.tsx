import { CalendarDays, Clock3 } from 'lucide-react'
import type { Project, TimeEntry } from '../../types'
import { TimeLog } from '../TimeLog'
import { shiftDate, toDateString } from '../time-utils'
import { MonthView } from './MonthView'
import { WeekView } from './WeekView'
import { styles } from './timeTrackerStyles'
import type { ViewMode } from './types'

interface Props {
  entries: TimeEntry[]
  projects: Project[]
  activeEntry: TimeEntry | null
  selectedDate: string
  isToday: boolean
  loading: boolean
  now: number
  onDateChange: (value: string) => void
  onEditEntry: (id: string, updates: Partial<TimeEntry>) => void
  onDeleteEntry: (id: string) => void
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  selectedWeek: string
  selectedMonth: string
  rangeEntries: TimeEntry[]
  rangeLoading: boolean
  onDayClick: (date: string) => void
  onWeekNav: (direction: -1 | 1) => void
  onMonthNav: (direction: -1 | 1) => void
}

const VIEW_LABELS: Record<ViewMode, string> = { day: 'Dag', week: 'Uke', month: 'Måned' }

export function LogPanel({
  entries,
  projects,
  activeEntry,
  selectedDate,
  isToday,
  loading,
  now,
  onDateChange,
  onEditEntry,
  onDeleteEntry,
  viewMode,
  onViewModeChange,
  selectedWeek,
  selectedMonth,
  rangeEntries,
  rangeLoading,
  onDayClick,
  onWeekNav,
  onMonthNav,
}: Props) {
  const today = toDateString(new Date())

  return (
    <section style={styles.section}>
      <div style={styles.sectionHeader}>
        <div>
          <h2 style={styles.sectionTitle}>Timer</h2>
          <p style={styles.sectionDescription}>Se og rediger registreringer for valgt dato.</p>
        </div>
      </div>

      <div style={styles.viewSwitcher}>
        {(Object.keys(VIEW_LABELS) as ViewMode[]).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => onViewModeChange(mode)}
            style={mode === viewMode ? styles.viewTabActive : styles.viewTab}
          >
            {VIEW_LABELS[mode]}
          </button>
        ))}
      </div>

      {viewMode === 'day' && (
        <>
          <div className="tracker-toolbar" style={styles.dateControls}>
            <button type="button" onClick={() => onDateChange(shiftDate(selectedDate, -1))} style={styles.secondaryActionWide}>
              <CalendarDays size={16} />
              <span>Forrige dag</span>
            </button>
            {!isToday && (
              <button type="button" onClick={() => onDateChange(today)} style={styles.secondaryActionWide}>
                <Clock3 size={16} />
                <span>I dag</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => onDateChange(shiftDate(selectedDate, 1))}
              disabled={selectedDate >= today}
              style={styles.secondaryActionWide}
            >
              <CalendarDays size={16} />
              <span>Neste dag</span>
            </button>
          </div>

          <div className="tracker-toolbar" style={styles.dateToolbar}>
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => onDateChange(event.target.value)}
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
              onEdit={onEditEntry}
              onDelete={onDeleteEntry}
              now={now}
            />
          )}
        </>
      )}

      {viewMode === 'week' && (
        <WeekView
          weekStart={selectedWeek}
          entries={rangeEntries}
          projects={projects}
          loading={rangeLoading}
          onDayClick={onDayClick}
          onNav={onWeekNav}
        />
      )}

      {viewMode === 'month' && (
        <MonthView
          month={selectedMonth}
          entries={rangeEntries}
          projects={projects}
          loading={rangeLoading}
          onDayClick={onDayClick}
          onNav={onMonthNav}
        />
      )}
    </section>
  )
}
