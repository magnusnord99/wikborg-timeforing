import { ChartColumn, FolderKanban, ListTodo, TimerReset } from 'lucide-react'
import { formatHours } from '../time-utils'
import type { TrackerNavItem } from './types'

interface Input {
  hasActiveEntry: boolean
  projectCount: number
  entryCount: number
  totalCompletedMinutes: number
}

export function createTrackerNavItems({
  hasActiveEntry,
  projectCount,
  entryCount,
  totalCompletedMinutes,
}: Input): TrackerNavItem[] {
  return [
    { id: 'focus', label: 'Fokus', icon: TimerReset, meta: hasActiveEntry ? 'Aktiv økt' : 'Ingen økt' },
    { id: 'projects', label: 'Prosjekter', icon: FolderKanban, meta: `${projectCount}` },
    { id: 'log', label: 'Timer', icon: ListTodo, meta: `${entryCount}` },
    { id: 'summary', label: 'Oppsummering', icon: ChartColumn, meta: formatHours(totalCompletedMinutes) },
  ]
}