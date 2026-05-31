import { Check, Play, Square, Trash2, X } from 'lucide-react'
import type { Project, TimeEntry } from '../../types'
import { styles } from './projectsListStyles'

interface Props {
  project: Project
  activeEntry: TimeEntry | null
  confirmDelete: boolean
  onStart: () => void
  onStop: () => void
  onRequestDelete: () => void
  onCancelDelete: () => void
  onRemove: () => void
}

export function ProjectCard({
  project,
  activeEntry,
  confirmDelete,
  onStart,
  onStop,
  onRequestDelete,
  onCancelDelete,
  onRemove,
}: Props) {
  const isActive = activeEntry?.project_id === project.id

  return (
    <li style={styles.item}>
      <div style={styles.projectInfo}>
        <div style={styles.projectHeader}>
          <span style={styles.projectName}>{project.name}</span>
          {isActive && (
            <span style={styles.activeBadge}>
              <Play size={12} />
              <span>Aktiv nå</span>
            </span>
          )}
        </div>
        <span style={styles.projectMeta}>
          {isActive
            ? 'Timeren kjører på dette prosjektet.'
            : activeEntry
              ? 'Vent til aktiv timer er stoppet før du starter denne.'
              : 'Klar til å starte timer.'}
        </span>
      </div>

      <div style={styles.actions}>
        {isActive ? (
          <button type="button" onClick={onStop} style={{ ...styles.button, ...styles.stopButton }}>
            <Square size={15} />
            <span>Stopp</span>
          </button>
        ) : (
          <button type="button" onClick={onStart} disabled={!!activeEntry} style={styles.button}>
            <Play size={15} />
            <span>Start</span>
          </button>
        )}

        {confirmDelete && !isActive ? (
          <>
            <button type="button" onClick={onRemove} style={{ ...styles.button, ...styles.dangerButton }}>
              <Check size={15} />
              <span>Bekreft</span>
            </button>
            <button type="button" onClick={onCancelDelete} style={styles.ghostButton}>
              <X size={15} />
              <span>Avbryt</span>
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={onRequestDelete}
            disabled={isActive}
            style={{ ...styles.ghostButton, ...styles.removeButton }}
          >
            <Trash2 size={15} />
            <span>{isActive ? 'Stopp først' : 'Fjern'}</span>
          </button>
        )}
      </div>
    </li>
  )
}