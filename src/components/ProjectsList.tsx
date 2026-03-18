import { useState, type FormEvent } from 'react'
import { FolderKanban, Plus } from 'lucide-react'
import type { Project, TimeEntry } from '../types'
import { ProjectCard } from './projects-list/ProjectCard'
import { styles } from './projects-list/projectsListStyles'

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

  function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
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
          onChange={(event) => setNewName(event.target.value)}
          style={styles.input}
        />
        <button type="submit" disabled={!newName.trim()} style={styles.addButton}>
          <Plus size={16} />
          <span>Legg til</span>
        </button>
      </form>

      <p style={styles.helperText}>
        {activeEntry
          ? 'Du har en aktiv timer. Stopp den før du starter en ny.'
          : 'Velg prosjektet du faktisk skal føre på, så holder fokusvisningen seg ren.'}
      </p>

      {projects.length === 0 && (
        <div style={styles.emptyState}>
          <div style={styles.emptyTitle}>
            <FolderKanban size={18} />
            <strong>Ingen prosjekter ennå</strong>
          </div>
          <p style={styles.emptyText}>Opprett det første prosjektet ditt for å kunne starte en timer.</p>
        </div>
      )}

      <ul style={styles.list}>
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            activeEntry={activeEntry}
            confirmDelete={confirmDelete === project.id}
            onStart={() => onStart(project.id)}
            onStop={onStop}
            onRequestDelete={() => setConfirmDelete(project.id)}
            onCancelDelete={() => setConfirmDelete(null)}
            onRemove={() => {
              onRemove(project.id)
              setConfirmDelete(null)
            }}
          />
        ))}
      </ul>
    </div>
  )
}
