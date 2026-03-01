// ============================================
// CORE UTILITIES - Вспомогательные функции
// ============================================

/**
 * Генерация UUID v4
 */
export function genId(): string {
  try {
    if (typeof window !== "undefined" && window.crypto?.randomUUID) {
      return window.crypto.randomUUID()
    }
  } catch {
    // Fallback
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Текущая дата в ISO формате
 */
export function now(): string {
  return new Date().toISOString()
}

/**
 * Текущая дата в формате YYYY-MM-DD
 */
export function today(): string {
  return new Date().toISOString().split("T")[0]
}

/**
 * Вчерашняя дата в формате YYYY-MM-DD
 */
export function yesterday(): string {
  const date = new Date()
  date.setDate(date.getDate() - 1)
  return date.toISOString().split("T")[0]
}

/**
 * Добавить дни к дате
 */
export function addDays(date: string, days: number): string {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d.toISOString().split("T")[0]
}

/**
 * Разница в днях между датами
 */
export function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  return Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24))
}

/**
 * Форматировать дату для отображения
 */
export function formatDate(date: string): string {
  const d = new Date(date)
  return d.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

/**
 * Проверить является ли дата сегодняшней
 */
export function isToday(date: string): boolean {
  return date === today()
}

/**
 * Проверить является ли дата вчерашней
 */
export function isYesterday(date: string): boolean {
  return date === yesterday()
}
