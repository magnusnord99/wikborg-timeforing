import type { Project, TimeEntry } from '../types'

interface Props {
  entries: TimeEntry[]
  projects: Project[]
}

export function DailySummary({ entries, projects }: Props) {
  const completed = entries.filter((e) => e.end_time)
  const byProject = new Map<string, { project: Project; minutes: number }>()

  for (const entry of completed) {
    const project = projects.find((p) => p.id === entry.project_id)
    if (!project) continue

    const start = new Date(entry.start_time).getTime()
    const end = new Date(entry.end_time!).getTime()
    const mins = Math.round((end - start) / 60000)

    const existing = byProject.get(project.id)
    if (existing) {
      existing.minutes += mins
    } else {
      byProject.set(project.id, { project, minutes: mins })
    }
  }

  const totalMinutes = [...byProject.values()].reduce((sum, x) => sum + x.minutes, 0)

  if (totalMinutes === 0) {
    return (
      <p style={{ color: '#94a3b8', margin: 0 }}>
        Ingen fullførte timer i dag ennå.
      </p>
    )
  }

  return (
    <div>
      <div style={styles.total}>
        <strong>Totalt i dag:</strong> {formatHours(totalMinutes)}
      </div>
      <ul style={styles.list}>
        {[...byProject.values()]
          .sort((a, b) => b.minutes - a.minutes)
          .map(({ project, minutes }) => (
            <li key={project.id} style={styles.item}>
              <span>{project.name}</span>
              <span>{formatHours(minutes)}</span>
            </li>
          ))}
      </ul>
    </div>
  )
}

function formatHours(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m} min`
  if (m === 0) return `${h} t`
  return `${h} t ${m} min`
}

const styles: Record<string, React.CSSProperties> = {
  total: {
    marginBottom: 16,
    fontSize: 18,
  },
  list: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
  },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid #334155',
    fontSize: 15,
  },
}
