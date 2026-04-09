import { useState, useEffect } from 'react'
import type { Project, TimeEntry } from '../types'

interface Props {
  entries: TimeEntry[]
  projects: Project[]
  activeEntry: TimeEntry | null
  onEdit: (id: string, updates: Partial<TimeEntry>) => void
  onDelete: (id: string) => void
}

export function TimeLog({ entries, projects, activeEntry, onEdit, onDelete }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null)

  if (entries.length === 0) {
    return (
      <p style={{ color: '#94a3b8', margin: 0 }}>
        Ingen timer logget i dag. Start en timer fra prosjektlisten over.
      </p>
    )
  }

  return (
    <ul style={styles.list}>
      {entries.map((entry) => {
        const project = projects.find((p) => p.id === entry.project_id)
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
                  <span style={styles.project}>{project?.name ?? 'Ukjent'}</span>
                  <span style={styles.time}>
                    {formatTime(entry.start_time)} –{' '}
                    {entry.end_time ? formatTime(entry.end_time) : 'Pågår...'}
                  </span>
                  {entry.end_time && (
                    <span style={styles.duration}>
                      ({formatDuration(entry.start_time, entry.end_time)})
                    </span>
                  )}
                  {entry.description && !isActive && (
                    <span style={styles.description}>{entry.description}</span>
                  )}
                  {isActive && (
                    <CommentInput
                      value={entry.description ?? ''}
                      onSave={(desc) => onEdit(entry.id, { description: desc || null })}
                      placeholder="Hva jobber du med? (valgfritt)"
                    />
                  )}
                </div>
                {!isActive && (
                  <div style={styles.actions}>
                    <button
                      onClick={() => setEditingId(entry.id)}
                      style={styles.editButton}
                    >
                      Rediger
                    </button>
                    <button
                      onClick={() => onDelete(entry.id)}
                      style={styles.deleteButton}
                    >
                      Slett
                    </button>
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
  const d = new Date(iso)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function CommentInput({
  value,
  onSave,
  placeholder,
}: {
  value: string
  onSave: (v: string) => void
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
    <form onSubmit={handleSubmit} className="edit-form">
      <input
        type="text"
        placeholder="Kommentar (hva ble gjort)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        style={styles.input}
      />
      <select
        value={projectId}
        onChange={(e) => setProjectId(e.target.value)}
        style={styles.select}
      >
        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
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
      <div className="edit-actions">
        <button type="submit" style={styles.saveButton}>
          Lagre
        </button>
        <button type="button" onClick={onCancel} style={styles.cancelButton}>
          Avbryt
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
  const s = new Date(start).getTime()
  const e = new Date(end).getTime()
  const mins = Math.round((e - s) / 60000)
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return h > 0 ? `${h}t ${m}m` : `${m}m`
}

const styles: Record<string, React.CSSProperties> = {
  list: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
  },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #334155',
    flexWrap: 'wrap',
    gap: 8,
  },
  info: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  project: {
    fontWeight: 600,
  },
  time: {
    fontSize: 14,
    color: '#94a3b8',
  },
  duration: {
    fontSize: 13,
    color: '#64748b',
  },
  description: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
    fontStyle: 'italic',
  },
  commentInputWrap: {
    marginTop: 8,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  commentInput: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
    border: '1px solid #334155',
    background: '#0f172a',
    color: '#e2e8f0',
    fontSize: 14,
  },
  actions: {
    display: 'flex',
    gap: 8,
  },
  editButton: {
    padding: '6px 12px',
    borderRadius: 6,
    border: '1px solid #475569',
    background: 'transparent',
    color: '#94a3b8',
    fontSize: 13,
    cursor: 'pointer',
  },
  deleteButton: {
    padding: '6px 12px',
    borderRadius: 6,
    border: 'none',
    background: '#7f1d1d',
    color: '#fca5a5',
    fontSize: 13,
    cursor: 'pointer',
  },
  select: {
    padding: 8,
    borderRadius: 6,
    border: '1px solid #334155',
    background: '#0f172a',
    color: '#e2e8f0',
    fontSize: 14,
  },
  input: {
    padding: 8,
    borderRadius: 6,
    border: '1px solid #334155',
    background: '#0f172a',
    color: '#e2e8f0',
    fontSize: 14,
  },
  saveButton: {
    padding: '8px 16px',
    borderRadius: 6,
    border: 'none',
    background: '#22c55e',
    color: 'white',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: 14,
  },
  cancelButton: {
    padding: '8px 16px',
    borderRadius: 6,
    border: '1px solid #475569',
    background: 'transparent',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: 14,
  },
}
