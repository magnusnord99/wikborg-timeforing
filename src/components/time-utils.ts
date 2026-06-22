import type { TimeEntry } from '../types'

export function toDateString(date: Date): string {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function shiftDate(dateString: string, days: number): string {
  const [year, month, day] = dateString.split('-').map(Number)
  const date = new Date(year, month - 1, day + days)
  return toDateString(date)
}

export function getLocalDayStartIso(dateString: string): string {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day).toISOString()
}

export function getNextLocalDayStartIso(dateString: string): string {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day + 1).toISOString()
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