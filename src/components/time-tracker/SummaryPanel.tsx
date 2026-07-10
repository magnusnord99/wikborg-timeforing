import { CalendarDays, Clock3 } from 'lucide-react'
import type { Project, TimeEntry } from '../../types'
import { DailySummary } from '../DailySummary'
import { formatHours, shiftDate, toDateString } from '../time-utils'
import { styles } from './timeTrackerStyles'

interface Props {
  entries: TimeEntry[]
  projects: Project[]
  totalCompletedMinutes: number
  selectedDate: string
  isToday: boolean
  onDateChange: (value: string) => void
}

export function SummaryPanel({
  entries,
  projects,
  totalCompletedMinutes,
  selectedDate,
  isToday,
  onDateChange,
}: Props) {
  const today = toDateString(new Date())

  return (
    <section style={styles.section}>
      <div style={styles.sectionHeader}>
        <div>
          <h2 style={styles.sectionTitle}>Oppsummering</h2>
          <p style={styles.sectionDescription}>Se hvordan tiden fordeler seg på prosjekter.</p>
        </div>
        <span style={styles.sectionMeta}>{formatHours(totalCompletedMinutes)}</span>
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

      <div className="tracker-toolbar" style={styles.dateToolbar}>
        <input
          type="date"
          value={selectedDate}
          onChange={(event) => onDateChange(event.target.value)}
          style={styles.dateInput}
        />
        <span style={styles.dateHelper}>
          {isToday ? 'Viser oppsummering for i dag.' : 'Viser oppsummering for valgt dato.'}
        </span>
      </div>

      <DailySummary entries={entries} projects={projects} isToday={isToday} />
    </section>
  )
}
