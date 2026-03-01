// ============================================
// GAMIFICATION LOGIC - Бизнес-логика
// ============================================

import type { UserStats } from "@/lib/types"
import { today, daysBetween } from "@/lib/store/core"
import { getStats, updateStats } from "./store"
import { calculateXpToNext, getLevelConfig } from "./config"
import type { CoinsOperationResult } from "./types"

/**
 * Добавить XP с обработкой повышения уровня
 * @returns Обновлённая статистика
 */
export function addXp(amount: number, reason?: string): UserStats {
  const stats = getStats()
  let newXp = stats.xp + amount
  let newLevel = stats.level
  let xpToNext = stats.xpToNext

  // Обработка повышения уровня
  while (newXp >= xpToNext) {
    newXp -= xpToNext
    newLevel++
    xpToNext = calculateXpToNext(newLevel)
  }

  const updated = updateStats({
    xp: newXp,
    level: newLevel,
    xpToNext: xpToNext,
  })

  // Можно добавить логирование события
  console.log(`[Gamification] +${amount} XP${reason ? ` (${reason})` : ""}`)

  return updated
}

/**
 * Добавить монеты
 */
export function addCoins(amount: number): UserStats {
  const stats = getStats()
  return updateStats({
    coins: stats.coins + amount,
    totalCoinsEarned: stats.totalCoinsEarned + amount,
  })
}

/**
 * Потратить монеты
 * @returns true если успешно, false если недостаточно монет
 */
export function spendCoins(amount: number): boolean {
  const stats = getStats()
  
  if (stats.coins < amount) return false

  updateStats({
    coins: stats.coins - amount,
    totalCoinsSpent: stats.totalCoinsSpent + amount,
  })

  return true
}

/**
 * Потратить монеты с детальной информацией
 */
export function spendCoinsDetailed(amount: number): CoinsOperationResult {
  const stats = getStats()
  
  if (stats.coins < amount) {
    return { success: false, newBalance: stats.coins }
  }

  const newBalance = stats.coins - amount
  updateStats({
    coins: newBalance,
    totalCoinsSpent: stats.totalCoinsSpent + amount,
  })

  return { success: true, newBalance }
}

/**
 * Проверить и обновить streak
 * @returns Информация об изменении streak
 */
export function checkAndUpdateStreak(): {
  streak: number
  isIncreased: boolean
  isReset: boolean
} {
  const stats = getStats()
  const todayStr = today()

  // Первое посещение
  if (!stats.lastActiveDate) {
    updateStats({
      currentStreak: 1,
      lastActiveDate: todayStr,
    })
    return { streak: 1, isIncreased: true, isReset: false }
  }

  // Уже отмечали сегодня
  if (stats.lastActiveDate === todayStr) {
    return { streak: stats.currentStreak, isIncreased: false, isReset: false }
  }

  const diffDays = daysBetween(stats.lastActiveDate, todayStr)

  let newStreak = stats.currentStreak
  let isIncreased = false
  let isReset = false

  if (diffDays === 1) {
    // Последовательный день - увеличиваем streak
    newStreak++
    isIncreased = true
  } else if (diffDays > 1) {
    // Пропуск - сброс streak
    newStreak = 1
    isReset = true
  }

  const longestStreak = Math.max(stats.longestStreak, newStreak)
  
  updateStats({
    currentStreak: newStreak,
    longestStreak,
    lastActiveDate: todayStr,
  })

  return { streak: newStreak, isIncreased, isReset }
}

/**
 * Проверить активность за сегодня
 */
export function isActiveToday(): boolean {
  const stats = getStats()
  return stats.lastActiveDate === today()
}

/**
 * Получить количество дней до потери streak
 */
export function getStreakGracePeriod(): number {
  const stats = getStats()
  if (!stats.lastActiveDate) return Infinity
  
  const diffDays = daysBetween(stats.lastActiveDate, today())
  return Math.max(0, 1 - diffDays)
}

/**
 * Рассчитать бонусы за streak
 */
export function calculateStreakBonus(baseAmount: number): number {
  const stats = getStats()
  // +10% за каждые 7 дней streak, максимум +50%
  const multiplier = Math.min(1.5, 1 + Math.floor(stats.currentStreak / 7) * 0.1)
  return Math.floor(baseAmount * multiplier)
}
