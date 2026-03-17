import { useEffect, useState } from 'react'
import { Check, Clock3, FileText, Pencil, Play, Trash2, X } from 'lucide-react'
import type { Project, TimeEntry } from '../types'

interface Props {
  entries: TimeEntry[]
  projects: Project[]
  activeEntry: TimeEntry | null
  onEdit: (id: string, updates: Partial<TimeEntry>) => void
  onDelete: (id: string) => void
  now: number
}

export function TimeLog({ entries, projects, activeEntry, onEdit, onDelete, now }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  if (entries.length === 0) {
    return (
      <div style={styles.emptyState}>
        <div style={styles.emptyTitle}>
          <Clock3 size={18} />
          <strong>Ingen timer registrert</strong>
        </div>
        <p style={styles.emptyText}>
          Start en timer fra prosjektlisten, eller bytt dato for å se tidligere føringer.
        </p>
      </div>
    )
  }

  return (
    <ul style={styles.list}>
      {entries.map((entry) => {
        const project = projects.find((item) => item.id === entry.project_id)
        const isActive = activeEntry?.id === entry.id
        const isEditing = editingId === entry.id

        return (
          <li key={entry.id} style={styles.item}>
            {isEditing ? (
              <EditForm
                entry={entry}
                projects={projects}
                onSave={(updates) => {
                  onEdit(entry.id, updates)
                  setEditingId(null)
                }}
                onCancel={() => setEditingId(null)}
              />
            ) : (
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
                      {isActive
                        ? formatLiveDuration(entry.start_time, entry.end_time ?? new Date(now).toISOString())
                        : formatDuration(entry.start_time, entry.end_time ?? new Date(now).toISOString())}
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
                      <span style={styles.inlineHint}>
                        Kommentar lagres automatisk når du klikker ut av feltet.
                      </span>
                      <CommentInput
                        value={entry.description ?? ''}
                        onSave={(desc) => onEdit(entry.id, { description: desc || null })}
                        placeholder="Hva jobber du med akkurat nå?"
                      />
                    </>
                  )}
                </div>

                {!isActive && (
                  <div style={styles.actions}>
                    <button onClick={() => setEditingId(entry.id)} style={styles.editButton}>
                      <Pencil size={15} />
                      <span>Rediger</span>
                    </button>
                    {confirmDeleteId === entry.id ? (
                      <>
                        <button
                          onClick={() => {
                            onDelete(entry.id)
                            setConfirmDeleteId(null)
                          }}
                          style={styles.confirmDeleteButton}
                        >
                          <Check size={15} />
                          <span>Bekreft</span>
                        </button>
                        <button onClick={() => setConfirmDeleteId(null)} style={styles.editButton}>
                          <X size={15} />
                          <span>Avbryt</span>
                        </button>
                      </>
                    ) : (
                      <button onClick={() => setConfirmDeleteId(entry.id)} style={styles.deleteButton}>
                        <Trash2 size={15} />
                        <span>Slett</span>
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </li>
        )
      })}
    </ul>
  )
}

function toDatetimeLocal(iso: string): string {
  const date = new Date(iso)
  const pad = (value: number) => value.toString().padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function CommentInput({
  value,
  onSave,
  placeholder,
}: {
  value: string
  onSave: (value: string) => void
  placeholder: string
}) {
  const [local, setLocal] = useState(value)

  useEffect(() => setLocal(value), [value])

  function handleBlur() {
    if (local.trim() !== value.trim()) {
      onSave(local.trim())
    }
  }

  return (
    <div style={styles.commentInputWrap}>
      <input
        type="text"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={handleBlur}
        placeholder={placeholder}
        style={styles.commentInput}
      />
    </div>
  )
}

function EditForm({
  entry,
  projects,
  onSave,
  onCancel,
}: {
  entry: TimeEntry
  projects: Project[]
  onSave: (updates: Partial<TimeEntry>) => void
  onCancel: () => void
}) {
  const [projectId, setProjectId] = useState(entry.project_id)
  const [startTime, setStartTime] = useState(toDatetimeLocal(entry.start_time))
  const [endTime, setEndTime] = useState(entry.end_time ? toDatetimeLocal(entry.end_time) : '')
  const [description, setDescription] = useState(entry.description ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave({
      project_id: projectId,
      start_time: startTime ? new Date(startTime).toISOString() : entry.start_time,
      end_time: endTime ? new Date(endTime).toISOString() : null,
      description: description.trim() || null,
    })
  }

  return (
    <form onSubmit={handleSubmit} style={styles.editForm}>
      <input
        type="text"
        placeholder="Kommentar (hva ble gjort)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        style={styles.input}
      />
      <select value={projectId} onChange={(e) => setProjectId(e.target.value)} style={styles.select}>
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.name}
          </option>
        ))}
      </select>
      <input
        type="datetime-local"
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
        style={styles.input}
      />
      <input
        type="datetime-local"
        value={endTime}
        onChange={(e) => setEndTime(e.target.value)}
        style={styles.input}
        placeholder="Sluttid"
      />
      <div style={styles.editActions}>
        <button type="submit" style={styles.saveButton}>
          <Check size={15} />
          <span>Lagre</span>
        </button>
        <button type="button" onClick={onCancel} style={styles.cancelButton}>
          <X size={15} />
          <span>Avbryt</span>
        </button>
      </div>
    </form>
  )
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('nb-NO', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDuration(start: string, end: string): string {
  const startMs = new Date(start).getTime()
  const endMs = new Date(end).getTime()
  const minutes = Math.round((endMs - startMs) / 60000)
  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60
  return hours > 0 ? `${hours} t ${remainder} min` : `${remainder} min`
}

function formatLiveDuration(start: string, end: string): string {
  const startMs = new Date(start).getTime()
  const endMs = new Date(end).getTime()
  const totalSeconds = Math.max(0, Math.floor((endMs - startMs) / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`
}

const styles: Record<string, React.CSSProperties> = {
  list: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    background: 'var(--color-elevated)',
    border: '1px solid var(--color-elevated-border)',
    borderRadius: 14,
    flexWrap: 'wrap',
    gap: 12,
  },
  emptyState: {
    padding: 18,
    borderRadius: 14,
    background: 'rgba(15, 23, 42, 0.44)',
    border: '1px dashed var(--color-elevated-border)',
  },
  emptyTitle: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    margin: '8px 0 0',
    color: 'var(--color-text-muted)',
    lineHeight: 1.5,
  },
  info: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    flex: 1,
    minWidth: 220,
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  project: {
    fontWeight: 600,
  },
  activeBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 8px',
    borderRadius: 999,
    background: 'var(--color-accent-soft)',
    color: 'var(--color-text)',
    fontSize: 12,
    fontWeight: 700,
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  time: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 14,
    color: 'var(--color-text-muted)',
  },
  duration: {
    fontSize: 13,
    color: 'var(--color-text)',
    padding: '4px 8px',
    borderRadius: 999,
    background: 'var(--color-input-bg)',
  },
  description: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 14,
    color: 'var(--color-text-muted)',
    marginTop: 4,
  },
  inlineHint: {
    fontSize: 12,
    color: 'rgba(148, 163, 184, 0.82)',
  },
  commentInputWrap: {
    marginTop: 4,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  commentInput: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    background: 'var(--color-input-bg)',
    color: 'var(--color-text)',
    fontSize: 14,
  },
  actions: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
  },
  editButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    background: 'transparent',
    color: 'var(--color-text-muted)',
    fontSize: 13,
    cursor: 'pointer',
  },
  deleteButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 12px',
    borderRadius: 8,
    border: 'none',
    background: 'var(--color-danger-soft)',
    color: 'var(--color-danger-text)',
    fontSize: 13,
    cursor: 'pointer',
  },
  confirmDeleteButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 12px',
    borderRadius: 8,
    border: 'none',
    background: 'var(--color-danger-strong)',
    color: 'white',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
  },
  editForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    width: '100%',
    padding: 4,
  },
  select: {
    padding: 8,
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    background: 'var(--color-input-bg)',
    color: 'var(--color-text)',
    fontSize: 14,
  },
  input: {
    padding: 8,
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    background: 'var(--color-input-bg)',
    color: 'var(--color-text)',
    fontSize: 14,
  },
  editActions: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
  },
  saveButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 16px',
    borderRadius: 8,
    border: 'none',
    background: 'var(--color-success)',
    color: 'white',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: 14,
  },
  cancelButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 16px',
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    background: 'transparent',
    color: 'var(--color-text-muted)',
    cursor: 'pointer',
    fontSize: 14,
  },
}
