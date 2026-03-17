import { useState } from 'react'
import type { Project, TimeEntry } from '../types'

interface Props {
  entries: TimeEntry[]
  projects: Project[]
}

export function DailySummary({ entries, projects }: Props) {
  const [expandedProject, setExpandedProject] = useState<string | null>(null)
  const completed = entries.filter((entry) => entry.end_time)
  const byProject = new Map<string, { project: Project; minutes: number; entries: TimeEntry[] }>()

  for (const entry of completed) {
    const project = projects.find((item) => item.id === entry.project_id)
    if (!project) continue

    const start = new Date(entry.start_time).getTime()
    const end = new Date(entry.end_time!).getTime()
    const minutes = Math.round((end - start) / 60000)

    const existing = byProject.get(project.id)
    if (existing) {
      existing.minutes += minutes
      existing.entries.push(entry)
    } else {
      byProject.set(project.id, { project, minutes, entries: [entry] })
    }
  }

  const totalMinutes = [...byProject.values()].reduce((sum, item) => sum + item.minutes, 0)

  if (totalMinutes === 0) {
    return (
      <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
        Ingen fullførte timer i dag ennå.
      </p>
    )
  }

  return (
    <div>
      <div style={styles.total}>
        <strong>Totalt i dag: {formatHours(totalMinutes)}</strong>
        <span style={styles.totalMeta}>
          {completed.length} registrering{completed.length === 1 ? '' : 'er'} fordelt på {byProject.size} prosjekt{byProject.size === 1 ? '' : 'er'}.
        </span>
      </div>
      <ul style={styles.list}>
        {[...byProject.values()]
          .sort((a, b) => b.minutes - a.minutes)
          .map(({ project, minutes, entries: projectEntries }) => {
            const descriptions = projectEntries
              .map((entry) => entry.description?.trim())
              .filter(Boolean) as string[]
            const isExpanded = expandedProject === project.id
            const percent = Math.round((minutes / totalMinutes) * 100)

            return (
              <li key={project.id} style={styles.item}>
                <div style={styles.itemRow}>
                  <div style={styles.projectBlock}>
                    <span style={styles.projectName}>{project.name}</span>
                    <span style={styles.projectMeta}>
                      {projectEntries.length} økt{projectEntries.length === 1 ? '' : 'er'} · {percent}% av dagen
                    </span>
                  </div>
                  <span style={styles.hours}>{formatHours(minutes)}</span>
                </div>
                <div style={styles.progressTrack}>
                  <div style={{ ...styles.progressFill, width: `${percent}%` }} />
                </div>
                {descriptions.length > 0 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setExpandedProject(isExpanded ? null : project.id)}
                      style={styles.showButton}
                    >
                      {isExpanded ? 'Skjul beskrivelser' : 'Vis hva jeg har gjort'}
                    </button>
                    {isExpanded && (
                      <div style={styles.descriptionList}>
                        {descriptions.map((desc, index) => (
                          <div key={index} style={styles.descriptionItem}>
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
  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60
  if (hours === 0) return `${remainder} min`
  if (remainder === 0) return `${hours} t`
  return `${hours} t ${remainder} min`
}

const styles: Record<string, React.CSSProperties> = {
  total: {
    marginBottom: 16,
    fontSize: 18,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  totalMeta: {
    color: 'var(--color-text-muted)',
    fontSize: 14,
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
    padding: '16px',
    background: 'var(--color-elevated)',
    border: '1px solid var(--color-elevated-border)',
    borderRadius: 14,
    fontSize: 15,
  },
  itemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  projectBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  projectName: {
    fontWeight: 600,
  },
  projectMeta: {
    color: 'var(--color-text-muted)',
    fontSize: 13,
  },
  hours: {
    fontWeight: 700,
  },
  progressTrack: {
    height: 8,
    marginTop: 14,
    background: 'rgba(5, 6, 9, 0.45)',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    background: 'linear-gradient(90deg, var(--color-accent), #93c5fd)',
  },
  showButton: {
    marginTop: 10,
    padding: '4px 0',
    background: 'none',
    border: 'none',
    color: 'var(--color-text-muted)',
    fontSize: 13,
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  descriptionList: {
    marginTop: 8,
    padding: 12,
    background: 'var(--color-input-bg)',
    border: '1px solid var(--color-elevated-border)',
    borderRadius: 8,
    fontSize: 14,
    color: 'var(--color-text)',
  },
  descriptionItem: {
    marginBottom: 4,
  },
}
