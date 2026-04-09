import type { Project, TimeEntry } from '../../types'
import { ActiveFocusView } from './ActiveFocusView'
import { IdleFocusView } from './IdleFocusView'
import { styles } from './timeTrackerStyles'

interface Props {
  projects: Project[]
  activeEntry: TimeEntry | null
  activeProject: Project | null
  activeDurationLabel: string
  totalCompletedMinutes: number
  entriesCount: number
  completedEntriesCount: number
  sessionNote: string
  onSessionNoteChange: (value: string) => void
  onSaveSessionNote: () => void
  onStartTimer: (projectId: string) => void
  onStopTimer: () => void
  onOpenLog: () => void
  onOpenSummary: () => void
}

export function FocusPanel({
  projects,
  activeEntry,
  activeProject,
  activeDurationLabel,
  totalCompletedMinutes,
  entriesCount,
  completedEntriesCount,
  sessionNote,
  onSessionNoteChange,
  onSaveSessionNote,
  onStartTimer,
  onStopTimer,
  onOpenLog,
  onOpenSummary,
}: Props) {
  return (
    <section style={styles.focusSection}>
      {activeEntry && activeProject ? (
        <ActiveFocusView
          activeEntry={activeEntry}
          activeProject={activeProject}
          activeDurationLabel={activeDurationLabel}
          totalCompletedMinutes={totalCompletedMinutes}
          entriesCount={entriesCount}
          completedEntriesCount={completedEntriesCount}
          sessionNote={sessionNote}
          onSessionNoteChange={onSessionNoteChange}
          onSaveSessionNote={onSaveSessionNote}
          onStopTimer={onStopTimer}
          onOpenLog={onOpenLog}
          onOpenSummary={onOpenSummary}
        />
      ) : (
        <IdleFocusView projects={projects} onStartTimer={onStartTimer} />
      )}
    </section>
  )
}