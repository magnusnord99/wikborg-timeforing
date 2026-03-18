import { Check, Clock3, FileText, Pencil, Play, Trash2, X } from 'lucide-react'
import type { Project, TimeEntry } from '../../types'
import { formatDuration, formatLiveDuration, formatTime } from '../time-utils'
import { CommentInput } from './CommentInput'
import { styles } from './timeLogStyles'

interface Props {
  entry: TimeEntry
  project: Project | undefined
  isActive: boolean
  confirmDelete: boolean
  now: number
  onEdit: () => void
  onSaveComment: (description: string | null) => void
  onRequestDelete: () => void
  onCancelDelete: () => void
  onDelete: () => void
}

export function TimeLogItem({
  entry,
  project,
  isActive,
  confirmDelete,
  now,
  onEdit,
  onSaveComment,
  onRequestDelete,
  onCancelDelete,
  onDelete,
}: Props) {
  const endTime = entry.end_time ?? new Date(now).toISOString()

  return (
    <>
      <div style={styles.info}>
        <div style={styles.headerRow}>
          <span style={styles.project}>{project?.name ?? 'Ukjent'}</span>
          {isActive && (
            <span style={styles.activeBadge}>
              <Play size={12} />
              <span>Pågår</span>
            </span>
          )}
        </div>

        <div style={styles.metaRow}>
          <span style={styles.time}>
            <Clock3 size={14} />
            <span>
              {formatTime(entry.start_time)} – {entry.end_time ? formatTime(entry.end_time) : 'Nå'}
            </span>
          </span>
          <span style={styles.duration}>
            {isActive ? formatLiveDuration(entry.start_time, endTime) : formatDuration(entry.start_time, endTime)}
          </span>
        </div>

        {entry.description && !isActive && (
          <span style={styles.description}>
            <FileText size={14} />
            <span>{entry.description}</span>
          </span>
        )}

        {isActive && (
          <>
            <span style={styles.inlineHint}>Kommentar lagres automatisk når du klikker ut av feltet.</span>
            <CommentInput
              value={entry.description ?? ''}
              onSave={(description) => onSaveComment(description || null)}
              placeholder="Hva jobber du med akkurat nå?"
            />
          </>
        )}
      </div>

      {!isActive && (
        <div style={styles.actions}>
          <button type="button" onClick={onEdit} style={styles.editButton}>
            <Pencil size={15} />
            <span>Rediger</span>
          </button>
          {confirmDelete ? (
            <>
              <button type="button" onClick={onDelete} style={styles.confirmDeleteButton}>
                <Check size={15} />
                <span>Bekreft</span>
              </button>
              <button type="button" onClick={onCancelDelete} style={styles.editButton}>
                <X size={15} />
                <span>Avbryt</span>
              </button>
            </>
          ) : (
            <button type="button" onClick={onRequestDelete} style={styles.deleteButton}>
              <Trash2 size={15} />
              <span>Slett</span>
            </button>
          )}
        </div>
      )}
    </>
  )
}