import type { Project, TimeEntry } from '../../types'
import { ActiveFocusView } from './ActiveFocusView'
import { IdleFocusView } from './IdleFocusView'
import { styles } from './timeTrackerStyles'

interface Props {
  activeEntry: TimeEntry | null
  activeProject: Project | null
  activeDurationLabel: string
  totalCompletedMinutes: number
  entriesCount: number
  completedEntriesCount: number
  sessionNote: string
  onSessionNoteChange: (value: string) => void
  onSaveSessionNote: () => void
  onStopTimer: () => void
  onOpenLog: () => void
  onOpenSummary: () => void
  onOpenProjects: () => void
}

export function FocusPanel({
  activeEntry,
  activeProject,
  activeDurationLabel,
  totalCompletedMinutes,
  entriesCount,
  completedEntriesCount,
  sessionNote,
  onSessionNoteChange,
  onSaveSessionNote,
  onStopTimer,
  onOpenLog,
  onOpenSummary,
  onOpenProjects,
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
        <IdleFocusView onOpenProjects={onOpenProjects} />
      )}
    </section>
  )
}