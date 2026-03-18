import { Activity, ChartColumn, Clock3, FolderKanban, ListTodo, Square } from 'lucide-react'
import type { Project, TimeEntry } from '../../types'
import { formatHours, formatTime } from '../time-utils'
import { styles } from './timeTrackerStyles'

interface Props {
  activeEntry: TimeEntry
  activeProject: Project
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
}

export function ActiveFocusView({
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
}: Props) {
  return (
    <div className="tracker-focus-grid" style={styles.focusGrid}>
      <div style={styles.focusHero}>
        <div style={styles.focusHeroTop}>
          <span style={styles.focusPill}>
            <Activity size={14} />
            Sesjon aktiv
          </span>
          <span style={styles.focusClock}>
            <Clock3 size={15} />
            Startet {formatTime(activeEntry.start_time)}
          </span>
        </div>

        <div style={styles.focusProjectRow}>
          <FolderKanban size={18} />
          <span>{activeProject.name}</span>
        </div>

        <div style={styles.focusTimer}>{activeDurationLabel}</div>

        <div style={styles.focusActions}>
          <button type="button" onClick={onStopTimer} style={styles.stopAction}>
            <Square size={16} />
            <span>Stopp timer</span>
          </button>
          <button type="button" onClick={onOpenLog} style={styles.secondaryActionWide}>
            <ListTodo size={16} />
            <span>Åpne timelogg</span>
          </button>
        </div>

        <label style={styles.noteLabel}>
          <span style={styles.noteLabelText}>Arbeidsnotat</span>
          <textarea
            value={sessionNote}
            onChange={(event) => onSessionNoteChange(event.target.value)}
            onBlur={onSaveSessionNote}
            placeholder="Skriv kort hva du jobber med akkurat nå"
            style={styles.noteInput}
          />
        </label>
      </div>

      <div style={styles.focusSide}>
        <div style={styles.miniStatCard}>
          <span style={styles.miniStatLabel}>Ført i dag</span>
          <strong style={styles.miniStatValue}>{formatHours(totalCompletedMinutes)}</strong>
        </div>
        <div style={styles.miniStatCard}>
          <span style={styles.miniStatLabel}>Økter i dag</span>
          <strong style={styles.miniStatValue}>{entriesCount}</strong>
        </div>
        <div style={styles.miniStatCard}>
          <span style={styles.miniStatLabel}>Fullført</span>
          <strong style={styles.miniStatValue}>{completedEntriesCount}</strong>
        </div>
        <button type="button" onClick={onOpenSummary} style={styles.secondaryGhostAction}>
          <ChartColumn size={16} />
          <span>Se oppsummering</span>
        </button>
      </div>
    </div>
  )
}