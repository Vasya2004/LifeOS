// ============================================
// GAMIFICATION HOOKS - React hooks
// ============================================

import useSWR from "swr"
import { useCallback } from "react"
import { KEYS } from "@/lib/store/core"
import { getStats, updateStats } from "./store"
import { addXp, addCoins, spendCoins, checkAndUpdateStreak } from "./logic"
import { getLevelConfig, calculateLevelProgress } from "./config"
import type { UserStats } from "@/lib/types"

const SWR_KEY = KEYS.stats

/**
 * Hook для работы со статистикой
 */
export function useStats() {
  const { data: stats, mutate } = useSWR(SWR_KEY, getStats, {
    refreshInterval: 30000, // Обновление каждые 30 сек
  })

  const refresh = useCallback(() => {
    mutate()
  }, [mutate])

  return {
    stats: stats ?? getStats(),
    refresh,
    isLoading: !stats,
  }
}

/**
 * Hook для работы с XP и уровнями
 */
export function useXp() {
  const { stats, refresh } = useStats()

  const addXpWrapped = useCallback(
    (amount: number, reason?: string) => {
      const result = addXp(amount, reason)
      refresh()
      return result
    },
    [refresh]
  )

  const levelConfig = stats ? getLevelConfig(stats.level) : null
  const progress = stats ? calculateLevelProgress(stats.xp, stats.xpToNext) : 0

  return {
    xp: stats?.xp ?? 0,
    level: stats?.level ?? 1,
    xpToNext: stats?.xpToNext ?? 1000,
    progress,
    levelConfig,
    addXp: addXpWrapped,
  }
}

/**
 * Hook для работы с монетами
 */
export function useCoins() {
  const { stats, refresh } = useStats()

  const add = useCallback(
    (amount: number) => {
      addCoins(amount)
      refresh()
    },
    [refresh]
  )

  const spend = useCallback(
    (amount: number) => {
      const result = spendCoins(amount)
      if (result.success) {
        refresh()
      }
      return result
    },
    [refresh]
  )

  return {
    coins: stats?.coins ?? 0,
    totalEarned: stats?.totalCoinsEarned ?? 0,
    totalSpent: stats?.totalCoinsSpent ?? 0,
    addCoins: add,
    spendCoins: spend,
  }
}

/**
 * Hook для работы со streak
 */
export function useStreak() {
  const { stats, refresh } = useStats()

  const checkIn = useCallback(() => {
    const result = checkAndUpdateStreak()
    refresh()
    return result
  }, [refresh])

  return {
    currentStreak: stats?.currentStreak ?? 0,
    longestStreak: stats?.longestStreak ?? 0,
    lastActiveDate: stats?.lastActiveDate,
    checkIn,
  }
}

/**
 * Полный hook для геймификации
 */
export function useGamification() {
  const statsData = useStats()
  const xpData = useXp()
  const coinsData = useCoins()
  const streakData = useStreak()

  return {
    ...statsData,
    xp: xpData,
    coins: coinsData,
    streak: streakData,
  }
}
