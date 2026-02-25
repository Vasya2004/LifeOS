// ============================================
// GAMIFICATION SYSTEM
// ============================================

import type { UserStats } from "@/lib/types"
import { getStore, setStore, KEYS, mutateKey, today } from "./core"
import { defaultStats } from "./defaults"

export function getStats(): UserStats {
  return getStore(KEYS.stats, defaultStats)
}

export function updateStats(updates: Partial<UserStats>) {
  const current = getStats()
  setStore(KEYS.stats, { ...current, ...updates })
  mutateKey(KEYS.stats)
}

export function addXp(amount: number, reason?: string) {
  const stats = getStats()
  let newXp = stats.xp + amount
  let newLevel = stats.level
  let newXpToNext = stats.xpToNext
  
  // Level up logic
  while (newXp >= newXpToNext) {
    newXp -= newXpToNext
    newLevel++
    newXpToNext = Math.floor(newXpToNext * 1.2)
  }
  
  setStore(KEYS.stats, {
    ...stats,
    xp: newXp,
    level: newLevel,
    xpToNext: newXpToNext,
  })
  mutateKey(KEYS.stats)
}

export function addCoins(amount: number) {
  const stats = getStats()
  setStore(KEYS.stats, {
    ...stats,
    coins: stats.coins + amount,
    totalCoinsEarned: stats.totalCoinsEarned + amount,
  })
  mutateKey(KEYS.stats)
}

export function spendCoins(amount: number): boolean {
  const stats = getStats()
  if (stats.coins < amount) return false
  
  setStore(KEYS.stats, {
    ...stats,
    coins: stats.coins - amount,
    totalCoinsSpent: stats.totalCoinsSpent + amount,
  })
  mutateKey(KEYS.stats)
  return true
}

export function checkAndUpdateStreak() {
  const stats = getStats()
  const todayStr = today()
  
  if (!stats.lastActiveDate) {
    updateStats({ currentStreak: 1, lastActiveDate: todayStr })
    return
  }
  
  const lastDate = new Date(stats.lastActiveDate)
  const todayDate = new Date(todayStr)
  const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
  
  let newStreak = stats.currentStreak
  if (diffDays === 1) {
    newStreak++
  } else if (diffDays > 1) {
    newStreak = 1
  }
  
  const longestStreak = Math.max(stats.longestStreak, newStreak)
  updateStats({ currentStreak: newStreak, longestStreak, lastActiveDate: todayStr })
}

export function getLevelName(level: number): string {
  if (level >= 50) return "Легенда"
  if (level >= 40) return "Мастер"
  if (level >= 30) return "Эксперт"
  if (level >= 20) return "Ветеран"
  if (level >= 10) return "Адепт"
  if (level >= 5) return "Ученик"
  return "Новичок"
}
