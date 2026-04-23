import type { LucideIcon } from 'lucide-react'

export type PanelId = 'focus' | 'projects' | 'log' | 'summary'

export type ViewMode = 'day' | 'week' | 'month'

export interface TrackerNotice {
  type: 'error' | 'info'
  text: string
}

export interface TrackerNavItem {
  id: PanelId
  label: string
  icon: LucideIcon
  meta: string
}