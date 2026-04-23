import { Activity, CalendarDays } from 'lucide-react'
import { formatDate } from '../time-utils'
import { styles } from './timeTrackerStyles'

interface Props {
  activeEntry: boolean
  isToday: boolean
  selectedDate: string
  activeDurationLabel: string
}

export function TrackerHeader({ activeEntry, isToday, selectedDate, activeDurationLabel }: Props) {
  return (
    <header className="tracker-header" style={styles.header}>
      <div style={styles.titleWrap}>
        <span style={styles.eyebrow}>{activeEntry ? 'Fokusmodus' : 'Arbeidsdag'}</span>
        <h1 className="tracker-title" style={styles.title}>{activeEntry ? 'Timeren kjører' : 'Wikborg Tidsføring'}</h1>
        <p className="tracker-subtitle" style={styles.subtitle}>
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
  )
}