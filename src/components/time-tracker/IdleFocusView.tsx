import { Play } from 'lucide-react'
import type { Project } from '../../types'
import { styles } from './timeTrackerStyles'

interface Props {
  projects: Project[]
  onStartTimer: (projectId: string) => void
}

export function IdleFocusView({ projects, onStartTimer }: Props) {
  return (
    <div style={styles.idleFocusCard}>
      <span style={styles.focusPillMuted}>
        <Play size={14} />
        Ingen aktiv timer
      </span>
      <h2 style={styles.idleFocusTitle}>Hva skal du jobbe med?</h2>

      {projects.length === 0 ? (
        <p style={styles.idleFocusText}>
          Du har ingen prosjekter ennå. Gå til Prosjekter-panelet for å legge til.
        </p>
      ) : (
        <ul style={idleStyles.list}>
          {projects.map((project) => (
            <li key={project.id} style={idleStyles.item}>
              <span style={idleStyles.name}>{project.name}</span>
              <button
                type="button"
                onClick={() => onStartTimer(project.id)}
                style={idleStyles.startBtn}
              >
                <Play size={14} />
                <span>Start</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

const idleStyles: Record<string, React.CSSProperties> = {
  list: {
    listStyle: 'none',
    margin: '8px 0 0',
    padding: 0,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderRadius: 12,
    background: 'var(--color-elevated)',
    border: '1px solid var(--color-elevated-border)',
    gap: 12,
  },
  name: {
    fontWeight: 500,
    fontSize: 15,
  },
  startBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 16px',
    borderRadius: 8,
    border: 'none',
    background: 'var(--color-success)',
    color: 'white',
    fontWeight: 600,
    fontSize: 14,
    cursor: 'pointer',
    flexShrink: 0,
  },
}
