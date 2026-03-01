// ============================================
// GAMIFICATION STORE - CRUD операции
// ============================================

import type { UserStats } from "@/lib/types"
import { getStore, setStore, KEYS, mutateKey } from "@/lib/store/core"
import { defaultStats } from "@/lib/store/defaults"
import type { GamificationState } from "./types"
import { calculateXpToNext, calculateLevelProgress } from "./config"

const STORAGE_KEY = KEYS.stats

/**
 * Получить текущую статистику
 */
export function getStats(): UserStats {
  return getStore(STORAGE_KEY, defaultStats)
}

/**
 * Получить расширенное состояние с метаданными
 */
export function getGamificationState(): GamificationState {
  const stats = getStats()
  return {
    ...stats,
    recentEvents: [], // Можно добавить хранение событий если нужно
    levelProgress: calculateLevelProgress(stats.xp, stats.xpToNext),
  }
}

/**
 * Обновить статистику
 */
export function updateStats(updates: Partial<UserStats>): UserStats {
  const current = getStats()
  const updated = { ...current, ...updates }
  setStore(STORAGE_KEY, updated)
  mutateKey(STORAGE_KEY, updated)
  return updated
}

/**
 * Установить полную статистику (сброс/восстановление)
 */
export function setStats(stats: UserStats): void {
  setStore(STORAGE_KEY, stats)
  mutateKey(STORAGE_KEY, stats)
}

/**
 * Сбросить статистику к значениям по умолчанию
 */
export function resetStats(): UserStats {
  setStore(STORAGE_KEY, defaultStats)
  mutateKey(STORAGE_KEY, defaultStats)
  return defaultStats
}
