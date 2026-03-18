import { useState } from 'react'
import { Clock3 } from 'lucide-react'
import type { Project, TimeEntry } from '../types'
import { TimeLogEditForm } from './time-log/TimeLogEditForm'
import { TimeLogItem } from './time-log/TimeLogItem'
import { styles } from './time-log/timeLogStyles'

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
        <p style={styles.emptyText}>Start en timer fra prosjektlisten, eller bytt dato for å se tidligere føringer.</p>
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
              <TimeLogEditForm
                entry={entry}
                projects={projects}
                onSave={(updates) => {
                  onEdit(entry.id, updates)
                  setEditingId(null)
                }}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <TimeLogItem
                entry={entry}
                project={project}
                isActive={isActive}
                confirmDelete={confirmDeleteId === entry.id}
                now={now}
                onEdit={() => setEditingId(entry.id)}
                onSaveComment={(description) => onEdit(entry.id, { description })}
                onRequestDelete={() => setConfirmDeleteId(entry.id)}
                onCancelDelete={() => setConfirmDeleteId(null)}
                onDelete={() => {
                  onDelete(entry.id)
                  setConfirmDeleteId(null)
                }}
              />
            )}
          </li>
        )
      })}
    </ul>
  )
}