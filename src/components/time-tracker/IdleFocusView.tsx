import { FolderKanban, Play } from 'lucide-react'
import { styles } from './timeTrackerStyles'

interface Props {
  onOpenProjects: () => void
}

export function IdleFocusView({ onOpenProjects }: Props) {
  return (
    <div style={styles.idleFocusCard}>
      <span style={styles.focusPillMuted}>
        <Play size={14} />
        Ingen aktiv timer
      </span>
      <h2 style={styles.idleFocusTitle}>Start fra prosjektlisten når du er klar</h2>
      <p style={styles.idleFocusText}>
        Fokusmodus blir automatisk aktiv når en økt starter. Da skjules resten av støyen.
      </p>
      <button type="button" onClick={onOpenProjects} style={styles.primaryBlueAction}>
        <FolderKanban size={16} />
        <span>Gå til prosjekter</span>
      </button>
    </div>
  )
}