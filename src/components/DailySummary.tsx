import { useState } from 'react'
import type { Project, TimeEntry } from '../types'

interface Props {
  entries: TimeEntry[]
  projects: Project[]
  isToday: boolean
}

export function DailySummary({ entries, projects, isToday }: Props) {
  const [expandedProject, setExpandedProject] = useState<string | null>(null)
  const completed = entries.filter((e) => e.end_time)
  const byProject = new Map<string, { project: Project; minutes: number; entries: TimeEntry[] }>()

  for (const entry of completed) {
    const project = projects.find((p) => p.id === entry.project_id)
    if (!project) continue

    const start = new Date(entry.start_time).getTime()
    const end = new Date(entry.end_time!).getTime()
    const mins = Math.round((end - start) / 60000)

    const existing = byProject.get(project.id)
    if (existing) {
      existing.minutes += mins
      existing.entries.push(entry)
    } else {
      byProject.set(project.id, { project, minutes: mins, entries: [entry] })
    }
  }

  const totalMinutes = [...byProject.values()].reduce((sum, x) => sum + x.minutes, 0)

  if (totalMinutes === 0) {
    return (
      <p style={{ color: '#94a3b8', margin: 0 }}>
        {isToday ? 'Ingen fullførte timer i dag ennå.' : 'Ingen fullførte timer denne dagen.'}
      </p>
    )
  }

  return (
    <div>
      <div style={styles.total}>
        <strong>{isToday ? 'Totalt i dag:' : 'Totalt denne dagen:'}</strong> {formatHours(totalMinutes)}
      </div>
      <ul style={styles.list}>
        {[...byProject.values()]
          .sort((a, b) => b.minutes - a.minutes)
          .map(({ project, minutes, entries: projectEntries }) => {
            const descriptions = projectEntries
              .map((e) => e.description?.trim())
              .filter(Boolean) as string[]
            const isExpanded = expandedProject === project.id

            return (
              <li key={project.id} style={styles.item}>
                <div style={styles.itemRow}>
                  <span>{project.name}</span>
                  <span>{formatHours(minutes)}</span>
                </div>
                {descriptions.length > 0 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedProject(isExpanded ? null : project.id)
                      }
                      style={styles.showButton}
                    >
                      {isExpanded ? 'Skjul' : 'Vis hva jeg har gjort'}
                    </button>
                    {isExpanded && (
                      <div style={styles.descriptionList}>
                        {descriptions.map((desc, i) => (
                          <div key={i} style={styles.descriptionItem}>
                            • {desc}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </li>
            )
          })}
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
    padding: '8px 0',
    borderBottom: '1px solid #334155',
    fontSize: 15,
  },
  itemRow: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  showButton: {
    marginTop: 6,
    padding: '4px 0',
    background: 'none',
    border: 'none',
    color: '#64748b',
    fontSize: 13,
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  descriptionList: {
    marginTop: 8,
    padding: 12,
    background: '#0f172a',
    borderRadius: 8,
    fontSize: 14,
    color: '#94a3b8',
  },
  descriptionItem: {
    marginBottom: 4,
  },
}
