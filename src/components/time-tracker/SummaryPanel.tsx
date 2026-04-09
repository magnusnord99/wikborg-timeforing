import type { Project, TimeEntry } from '../../types'
import { DailySummary } from '../DailySummary'
import { formatHours } from '../time-utils'
import { styles } from './timeTrackerStyles'

interface Props {
  entries: TimeEntry[]
  projects: Project[]
  totalCompletedMinutes: number
}

export function SummaryPanel({ entries, projects, totalCompletedMinutes }: Props) {
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