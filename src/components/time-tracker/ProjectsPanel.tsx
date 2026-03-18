import type { Project, TimeEntry } from '../../types'
import { ProjectsList } from '../ProjectsList'
import { styles } from './timeTrackerStyles'

interface Props {
  projects: Project[]
  activeEntry: TimeEntry | null
  onAddProject: (name: string) => void
  onRemoveProject: (id: string) => void
  onStartTimer: (projectId: string) => void
  onStopTimer: () => void
}

export function ProjectsPanel({
  projects,
  activeEntry,
  onAddProject,
  onRemoveProject,
  onStartTimer,
  onStopTimer,
}: Props) {
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
        onAdd={onAddProject}
        onRemove={onRemoveProject}
        activeEntry={activeEntry}
        onStart={onStartTimer}
        onStop={onStopTimer}
      />
    </section>
  )
}