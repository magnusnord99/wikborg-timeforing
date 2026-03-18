export function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10)
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