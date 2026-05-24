import type { TimeEntry } from '../types'

function padDatePart(value: number): string {
  return value.toString().padStart(2, '0')
}

export function toDateString(date: Date): string {
  return `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}`
}

export function shiftDate(dateString: string, days: number): string {
  const date = new Date(`${dateString}T12:00:00`)
  date.setDate(date.getDate() + days)
  return toDateString(date)
}

export function getMinutesBetween(start: string, end: string): number {
  const startMs = new Date(start).getTime()
  const endMs = new Date(end).getTime()
  return Math.max(0, Math.round((endMs - startMs) / 60000))
}

export function getSecondsBetween(start: string, end: string): number {
  const startMs = new Date(start).getTime()
  const endMs = new Date(end).getTime()
  return Math.max(0, Math.floor((endMs - startMs) / 1000))
}

export function formatDate(value: string): string {
  const date = new Date(`${value}T12:00:00`)
  return date.toLocaleDateString('nb-NO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('nb-NO', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatHours(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60

  if (hours === 0) return `${remainder} min`
  if (remainder === 0) return `${hours} t`
  return `${hours} t ${remainder} min`
}

export function formatDigitalDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`
}

export function toDatetimeLocal(iso: string): string {
  const date = new Date(iso)
  const pad = (value: number) => value.toString().padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function formatDuration(start: string, end: string): string {
  const minutes = getMinutesBetween(start, end)
  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60
  return hours > 0 ? `${hours} t ${remainder} min` : `${remainder} min`
}

export function formatLiveDuration(start: string, end: string): string {
  const totalSeconds = getSecondsBetween(start, end)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`
}

export function getWeekStart(date: string): string {
  const d = new Date(`${date}T12:00:00`)
  const day = d.getDay()
  const offset = day === 0 ? -6 : 1 - day
  return shiftDate(date, offset)
}

export function getWeekEnd(date: string): string {
  return shiftDate(getWeekStart(date), 6)
}

export function getMonthStart(month: string): string {
  return `${month}-01`
}

export function getMonthEnd(month: string): string {
  const [year, mon] = month.split('-').map(Number)
  const date = new Date(year, mon, 0)
  return toDateString(date)
}

export function getMonthGridStart(month: string): string {
  const monthStart = getMonthStart(month)
  const startDate = new Date(`${monthStart}T12:00:00`)
  const startDay = startDate.getDay()
  const gridStartOffset = startDay === 0 ? -6 : 1 - startDay
  return shiftDate(monthStart, gridStartOffset)
}

export function getMonthGridEnd(month: string): string {
  const monthEnd = getMonthEnd(month)
  const endDate = new Date(`${monthEnd}T12:00:00`)
  const endDay = endDate.getDay()
  const gridEndOffset = endDay === 0 ? 0 : 7 - endDay
  return shiftDate(monthEnd, gridEndOffset)
}

export function toMonthString(date: string): string {
  return date.slice(0, 7)
}

export function groupEntriesByDate(entries: TimeEntry[]): Map<string, TimeEntry[]> {
  const map = new Map<string, TimeEntry[]>()
  for (const entry of entries) {
    const key = toDateString(new Date(entry.start_time))
    const existing = map.get(key)
    if (existing) {
      existing.push(entry)
    } else {
      map.set(key, [entry])
    }
  }
  return map
}