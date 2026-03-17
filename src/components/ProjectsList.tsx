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
          placeholder="Nytt prosjekt, klient eller sak"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          style={styles.input}
        />
        <button type="submit" disabled={!newName.trim()} style={styles.addButton}>
          Legg til
        </button>
      </form>

      <p style={styles.helperText}>
        {activeEntry
          ? 'Du har en aktiv timer. Stopp den før du starter en ny.'
          : 'Hold prosjektlisten kort, så blir det raskere å føre tid.'}
      </p>

      {projects.length === 0 && (
        <div style={styles.emptyState}>
          <strong>Ingen prosjekter ennå</strong>
          <p style={styles.emptyText}>
            Opprett det første prosjektet ditt for å kunne starte en timer.
          </p>
        </div>
      )}

      <ul style={styles.list}>
        {projects.map((project) => {
          const isActive = activeEntry?.project_id === project.id
          return (
            <li key={project.id} style={styles.item}>
              <div style={styles.projectInfo}>
                <div style={styles.projectHeader}>
                  <span style={styles.projectName}>{project.name}</span>
                  {isActive && <span style={styles.activeBadge}>Aktiv nå</span>}
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
                  <button onClick={onStop} style={{ ...styles.button, ...styles.stopButton }}>
                    Stopp
                  </button>
                ) : (
                  <button
                    onClick={() => onStart(project.id)}
                    disabled={!!activeEntry}
                    style={styles.button}
                  >
                    Start timer
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
                    <button onClick={() => setConfirmDelete(null)} style={styles.button}>
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
    flexWrap: 'wrap',
  },
  input: {
    flex: 1,
    minWidth: 220,
    padding: 10,
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    background: 'rgba(5, 6, 9, 0.72)',
    color: 'var(--color-text)',
    fontSize: 14,
  },
  addButton: {
    padding: '10px 16px',
    borderRadius: 8,
    border: 'none',
    background: 'var(--color-success)',
    color: 'white',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: 14,
  },
  helperText: {
    margin: '0 0 16px',
    color: 'rgba(148, 163, 184, 0.86)',
    fontSize: 14,
    lineHeight: 1.5,
  },
  emptyState: {
    padding: 18,
    marginBottom: 16,
    borderRadius: 14,
    background: 'rgba(15, 23, 42, 0.44)',
    border: '1px dashed var(--color-elevated-border)',
  },
  emptyText: {
    margin: '8px 0 0',
    color: 'var(--color-text-muted)',
    lineHeight: 1.5,
  },
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
    gap: 12,
    flexWrap: 'wrap',
  },
  projectInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    flex: 1,
    minWidth: 220,
  },
  projectHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  projectName: {
    fontWeight: 600,
  },
  activeBadge: {
    padding: '4px 8px',
    borderRadius: 999,
    background: 'var(--color-accent-soft)',
    color: 'var(--color-text)',
    fontSize: 12,
    fontWeight: 700,
  },
  projectMeta: {
    color: 'var(--color-text-muted)',
    fontSize: 13,
  },
  actions: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
  },
  button: {
    padding: '8px 12px',
    borderRadius: 6,
    border: 'none',
    background: 'var(--color-accent)',
    color: 'white',
    fontSize: 13,
    cursor: 'pointer',
  },
  stopButton: {
    background: 'var(--color-danger)',
  },
  removeButton: {
    background: 'transparent',
    color: 'var(--color-text-muted)',
    border: '1px solid var(--color-border)',
  },
  dangerButton: {
    background: 'var(--color-danger-strong)',
    color: 'white',
  },
}
