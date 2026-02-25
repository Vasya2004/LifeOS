// ============================================
// DATE UTILS
// ============================================

export function now(): string {
  return new Date().toISOString()
}

export function today(): string {
  return new Date().toISOString().split("T")[0]
}

export function yesterday(): string {
  const date = new Date()
  date.setDate(date.getDate() - 1)
  return date.toISOString().split("T")[0]
}

export function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr)
  date.setDate(date.getDate() + days)
  return date.toISOString().split("T")[0]
}

export function diffDays(date1: string, date2: string): number {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  return Math.floor((d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24))
}

export function isSameDay(date1: string, date2: string): boolean {
  return date1.split("T")[0] === date2.split("T")[0]
}

export function startOfWeek(date: Date, weekStartsOn: 0 | 1 = 1): Date {
  const day = date.getDay()
  const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn
  const result = new Date(date)
  result.setDate(result.getDate() - diff)
  result.setHours(0, 0, 0, 0)
  return result
}

export function formatDate(dateStr: string, locale: string = "ru-RU"): string {
  return new Date(dateStr).toLocaleDateString(locale)
}
