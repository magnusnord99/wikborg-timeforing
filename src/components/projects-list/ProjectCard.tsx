import { useState, type FormEvent } from 'react'
import { Check, Pencil, Play, Square, Trash2, X } from 'lucide-react'
import type { Project, TimeEntry } from '../../types'
import { styles } from './projectsListStyles'

interface Props {
  project: Project
  activeEntry: TimeEntry | null
  confirmDelete: boolean
  isEditing: boolean
  onStart: () => void
  onStop: () => void
  onRequestDelete: () => void
  onCancelDelete: () => void
  onRemove: () => void
  onRequestEdit: () => void
  onCancelEdit: () => void
  onSaveEdit: (name: string) => void
}

export function ProjectCard({
  project,
  activeEntry,
  confirmDelete,
  isEditing,
  onStart,
  onStop,
  onRequestDelete,
  onCancelDelete,
  onRemove,
  onRequestEdit,
  onCancelEdit,
  onSaveEdit,
}: Props) {
  const [editValue, setEditValue] = useState(project.name)
  const isActive = activeEntry?.project_id === project.id

  function handleSaveEdit(e: FormEvent) {
    e.preventDefault()
    const trimmed = editValue.trim()
    if (!trimmed || trimmed === project.name) {
      onCancelEdit()
      return
    }
    onSaveEdit(trimmed)
  }

  if (isEditing) {
    return (
      <li style={styles.item}>
        <form onSubmit={handleSaveEdit} style={styles.editForm}>
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            autoFocus
            style={styles.editInput}
          />
          <div style={styles.actions}>
            <button type="submit" style={styles.button}>
              <Check size={15} />
              <span>Lagre</span>
            </button>
            <button type="button" onClick={onCancelEdit} style={styles.ghostButton}>
              <X size={15} />
              <span>Avbryt</span>
            </button>
          </div>
        </form>
      </li>
    )
  }

  return (
    <li style={styles.item}>
      <div style={styles.projectInfo}>
        <div style={styles.projectHeader}>
          <span style={styles.projectName}>{project.name}</span>
          <button
            type="button"
            onClick={() => {
              setEditValue(project.name)
              onRequestEdit()
            }}
            style={styles.iconButton}
            aria-label="Rediger prosjektnavn"
          >
            <Pencil size={14} />
          </button>
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

        {confirmDelete ? (
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
            style={{ ...styles.ghostButton, ...styles.removeButton }}
          >
            <Trash2 size={15} />
            <span>Fjern</span>
          </button>
        )}
      </div>
    </li>
  )
}
