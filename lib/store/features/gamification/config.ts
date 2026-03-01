// ============================================
// GAMIFICATION CONFIG - Конфигурация и константы
// ============================================

import type { LevelConfig } from "./types"

/** XP за сложность задачи */
export const DIFFICULTY_XP = {
  easy: 10,
  medium: 25,
  hard: 50,
  epic: 100,
} as const

/** Монеты за сложность задачи */
export const DIFFICULTY_COINS = {
  easy: 5,
  medium: 15,
  hard: 30,
  epic: 75,
} as const

/** XP за приоритет задачи */
export const PRIORITY_XP = {
  low: 5,
  medium: 10,
  high: 20,
  critical: 30,
} as const

/** Базовые значения прогрессии уровней */
export const BASE_XP_TO_NEXT = 1000
export const LEVEL_UP_MULTIPLIER = 1.2

/** Названия уровней */
export const LEVEL_TITLES: Record<number, string> = {
  1: "Новичок",
  5: "Ученик",
  10: "Адепт",
  20: "Ветеран",
  30: "Эксперт",
  40: "Мастер",
  50: "Легенда",
}

/** Цвета уровней */
export const LEVEL_COLORS: Record<number, string> = {
  1: "#6b7280",   // gray
  5: "#22c55e",   // green
  10: "#3b82f6",  // blue
  20: "#3b82f6",  // purple
  30: "#f97316",  // orange
  40: "#eab308",  // yellow
  50: "#ef4444",  // red
}

/**
 * Получить конфигурацию уровня
 */
export function getLevelConfig(level: number): LevelConfig {
  const thresholds = Object.keys(LEVEL_TITLES).map(Number).sort((a, b) => b - a)
  const applicableThreshold = thresholds.find(t => level >= t) ?? 1
  
  return {
    level,
    title: LEVEL_TITLES[applicableThreshold],
    xpToNext: calculateXpToNext(level),
    color: LEVEL_COLORS[applicableThreshold],
  }
}

/**
 * Рассчитать XP для следующего уровня
 */
export function calculateXpToNext(level: number): number {
  return Math.floor(BASE_XP_TO_NEXT * Math.pow(LEVEL_UP_MULTIPLIER, level - 1))
}

/**
 * Рассчитать общий XP для достижения уровня
 */
export function calculateTotalXpForLevel(targetLevel: number): number {
  let total = 0
  for (let i = 1; i < targetLevel; i++) {
    total += calculateXpToNext(i)
  }
  return total
}

/**
 * Получить название уровня
 */
export function getLevelName(level: number): string {
  const config = getLevelConfig(level)
  return config.title
}

/**
 * Рассчитать прогресс уровня (0-100)
 */
export function calculateLevelProgress(currentXp: number, xpToNext: number): number {
  if (xpToNext <= 0) return 100
  return Math.min(100, Math.round((currentXp / xpToNext) * 100))
}
