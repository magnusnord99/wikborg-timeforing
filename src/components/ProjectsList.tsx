import { useState } from 'react'
import type { Project, TimeEntry } from '../types'

interface Props {
  projects: Project[]
  onAdd: (name: string) => void
  onRemove: (id: string) => void
  activeEntry: TimeEntry | null
  onStart: (projectId: string) => void
  onStop: () => void
}

export function ProjectsList({
  projects,
  onAdd,
  onRemove,
  activeEntry,
  onStart,
  onStop,
}: Props) {
  const [newName, setNewName] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return
    onAdd(name)
    setNewName('')
  }

  return (
    <div>
      <form onSubmit={handleAdd} style={styles.addForm}>
        <input
          type="text"
          placeholder="Nytt prosjekt"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          style={styles.input}
        />
        <button type="submit" style={styles.addButton}>
          Legg til
        </button>
      </form>

      <ul style={styles.list}>
        {projects.map((project) => {
          const isActive = activeEntry?.project_id === project.id
          return (
            <li key={project.id} style={styles.item}>
              <span style={styles.projectName}>{project.name}</span>
              <div style={styles.actions}>
                {isActive ? (
                  <button
                    onClick={onStop}
                    style={{ ...styles.button, ...styles.stopButton }}
                  >
                    Stopp
                  </button>
                ) : (
                  <button
                    onClick={() => onStart(project.id)}
                    disabled={!!activeEntry}
                    style={styles.button}
                  >
                    Start
                  </button>
                )}
                {confirmDelete === project.id ? (
                  <>
                    <button
                      onClick={() => onRemove(project.id)}
                      style={{ ...styles.button, ...styles.dangerButton }}
                    >
                      Bekreft
                    </button>
                    <button
                      onClick={() => setConfirmDelete(null)}
                      style={styles.button}
                    >
                      Avbryt
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(project.id)}
                    style={{ ...styles.button, ...styles.removeButton }}
                  >
                    Fjern
                  </button>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  addForm: {
    display: 'flex',
    gap: 8,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    border: '1px solid #334155',
    background: '#0f172a',
    color: '#e2e8f0',
    fontSize: 14,
  },
  addButton: {
    padding: '10px 16px',
    borderRadius: 8,
    border: 'none',
    background: '#22c55e',
    color: 'white',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: 14,
  },
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
    gap: 12,
  },
  projectName: {
    flex: 1,
  },
  actions: {
    display: 'flex',
    gap: 8,
  },
  button: {
    padding: '6px 12px',
    borderRadius: 6,
    border: 'none',
    background: '#3b82f6',
    color: 'white',
    fontSize: 13,
    cursor: 'pointer',
  },
  stopButton: {
    background: '#ef4444',
  },
  removeButton: {
    background: 'transparent',
    color: '#94a3b8',
    border: '1px solid #475569',
  },
  dangerButton: {
    background: '#dc2626',
  },
}
