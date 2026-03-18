import { CalendarDays, Clock3 } from 'lucide-react'
import type { Project, TimeEntry } from '../../types'
import { TimeLog } from '../TimeLog'
import { shiftDate, toDateString } from '../time-utils'
import { styles } from './timeTrackerStyles'

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
}

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
}: Props) {
  const today = toDateString(new Date())

  return (
    <section style={styles.section}>
      <div style={styles.sectionHeader}>
        <div>
          <h2 style={styles.sectionTitle}>Timer</h2>
          <p style={styles.sectionDescription}>Se og rediger registreringer for valgt dato.</p>
        </div>
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
    </section>
  )
}