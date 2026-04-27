import { Activity, ChartColumn, Clock3, Eye, EyeOff, FolderKanban, ListTodo, Square } from 'lucide-react'
import { useState } from 'react'
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
  const [discreet, setDiscreet] = useState(false)

  return (
    <div className="tracker-focus-grid" style={styles.focusGrid}>
      <div style={styles.focusHero}>
        <div className="focus-hero-top" style={styles.focusHeroTop}>
          <span style={styles.focusPill}>
            <Activity size={14} />
            Sesjon aktiv
          </span>
          <div style={discreetStyles.topRight}>
            <span style={styles.focusClock}>
              <Clock3 size={15} />
              Startet {formatTime(activeEntry.start_time)}
            </span>
            <button
              type="button"
              onClick={() => setDiscreet((d) => !d)}
              style={discreetStyles.toggleBtn}
              title={discreet ? 'Vis timer' : 'Skjul timer'}
              aria-label={discreet ? 'Vis timer' : 'Skjul timer'}
            >
              {discreet ? <Eye size={15} /> : <EyeOff size={15} />}
              <span>{discreet ? 'Vis' : 'Diskret'}</span>
            </button>
          </div>
        </div>

        <div style={styles.focusProjectRow}>
          <FolderKanban size={18} />
          <span>{activeProject.name}</span>
        </div>

        <div style={{ ...styles.focusTimer, ...(discreet ? discreetStyles.timerHidden : {}) }}>
          {discreet ? '••:••' : activeDurationLabel}
        </div>

        <div className="focus-actions" style={styles.focusActions}>
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

const discreetStyles: Record<string, React.CSSProperties> = {
  topRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  toggleBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 10px',
    borderRadius: 8,
    border: '1px solid rgba(148, 163, 184, 0.2)',
    background: 'transparent',
    color: 'rgba(148, 163, 184, 0.7)',
    fontSize: 12,
    cursor: 'pointer',
  },
  timerHidden: {
    filter: 'blur(8px)',
    userSelect: 'none',
    color: 'rgba(191, 219, 254, 0.4)',
  },
}
