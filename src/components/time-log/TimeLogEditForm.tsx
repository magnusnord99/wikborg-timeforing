import { useState, type FormEvent } from 'react'
import { Check, X } from 'lucide-react'
import type { Project, TimeEntry } from '../../types'
import { toDatetimeLocal } from '../time-utils'
import { styles } from './timeLogStyles'

interface Props {
  entry: TimeEntry
  projects: Project[]
  onSave: (updates: Partial<TimeEntry>) => void
  onCancel: () => void
}

export function TimeLogEditForm({ entry, projects, onSave, onCancel }: Props) {
  const [projectId, setProjectId] = useState(entry.project_id)
  const [startTime, setStartTime] = useState(toDatetimeLocal(entry.start_time))
  const [endTime, setEndTime] = useState(entry.end_time ? toDatetimeLocal(entry.end_time) : '')
  const [description, setDescription] = useState(entry.description ?? '')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    onSave({
      project_id: projectId,
      start_time: startTime ? new Date(startTime).toISOString() : entry.start_time,
      end_time: endTime ? new Date(endTime).toISOString() : entry.end_time,
      description: description.trim() || null,
    })
  }

  return (
    <form onSubmit={handleSubmit} style={styles.editForm}>
      <input
        type="text"
        placeholder="Kommentar (hva ble gjort)"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        style={styles.input}
      />
      <select value={projectId} onChange={(event) => setProjectId(event.target.value)} style={styles.select}>
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.name}
          </option>
        ))}
      </select>
      <input
        type="datetime-local"
        value={startTime}
        onChange={(event) => setStartTime(event.target.value)}
        style={styles.input}
      />
      <input
        type="datetime-local"
        value={endTime}
        onChange={(event) => setEndTime(event.target.value)}
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