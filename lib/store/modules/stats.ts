// ============================================
// STATS MODULE - Gamification System
// ============================================

import { mutate } from "swr"
import { getStore, setStore } from "../utils/storage"
import { today, diffDays } from "../utils/date"
import { KEYS } from "../keys"
import type { UserStats } from "@/lib/types"

const defaultStats: UserStats = {
  level: 1,
  xp: 0,
  xpToNext: 1000,
  coins: 0,
  totalCoinsEarned: 0,
  totalCoinsSpent: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: today(),
  totalTasksCompleted: 0,
  totalGoalsAchieved: 0,
  totalProjectsCompleted: 0,
  totalHabitCompletions: 0,
  totalDeepWorkHours: 0,
  totalFocusSessions: 0,
  avgDailyTasks: 0,
}

export type XpReason =
  | "task_completed"
  | "goal_created"
  | "goal_completed"
  | "habit_completed"
  | "project_completed"
  | "account_created"
  | "transaction_created"
  | "body_zone_updated"
  | "body_zone_recovered"
  | "medical_document_uploaded"
  | "health_metric_logged"
  | "skill_activity_logged"
  | "skill_level_up"
  | "financial_goal_created"
  | "financial_goal_completed"
  | "full_checkup_achievement"
  | "skill_created"
  | "quest_completed"
  | `skill_level_up_${number}`
  | `Завершение квеста: ${string}`

class StatsModule {
  private key = KEYS.stats

  get(): UserStats {
    return getStore<UserStats>(this.key, defaultStats)
  }

  update(updates: Partial<UserStats>): UserStats {
    const current = this.get()
    const updated = { ...current, ...updates }
    setStore(this.key, updated)
    mutate(this.key)
    return updated
  }

  // ============ XP System ============

  addXp(amount: number, _reason?: XpReason): { leveledUp: boolean; newLevel?: number } {
    const stats = this.get()
    let newXp = stats.xp + amount
    let newLevel = stats.level
    let newXpToNext = stats.xpToNext
    let leveledUp = false

    // Level up logic
    while (newXp >= newXpToNext) {
      newXp -= newXpToNext
      newLevel++
      newXpToNext = Math.floor(newXpToNext * 1.2)
      leveledUp = true
    }

    this.update({
      xp: newXp,
      level: newLevel,
      xpToNext: newXpToNext,
    })

    return { leveledUp, newLevel: leveledUp ? newLevel : undefined }
  }

  // ============ Coins System ============

  addCoins(amount: number): number {
    const stats = this.get()
    this.update({
      coins: stats.coins + amount,
      totalCoinsEarned: stats.totalCoinsEarned + amount,
    })
    return stats.coins + amount
  }

  spendCoins(amount: number): { success: boolean; remaining?: number; error?: string } {
    const stats = this.get()
    if (stats.coins < amount) {
      return { success: false, error: "Недостаточно монет" }
    }

    this.update({
      coins: stats.coins - amount,
      totalCoinsSpent: stats.totalCoinsSpent + amount,
    })
    return { success: true, remaining: stats.coins - amount }
  }

  // ============ Streak System ============

  checkAndUpdateStreak(): { streakContinued: boolean; newStreak: number } {
    const stats = this.get()
    const todayStr = today()

    if (!stats.lastActiveDate) {
      this.update({ currentStreak: 1, lastActiveDate: todayStr })
      return { streakContinued: true, newStreak: 1 }
    }

    const diff = diffDays(todayStr, stats.lastActiveDate)
    let newStreak = stats.currentStreak
    let streakContinued = false

    if (diff === 0) {
      // Already active today
      streakContinued = true
    } else if (diff === 1) {
      // Continue streak
      newStreak++
      streakContinued = true
    } else if (diff > 1) {
      // Break streak
      newStreak = 1
      streakContinued = false
    }

    const longestStreak = Math.max(stats.longestStreak, newStreak)
    this.update({
      currentStreak: newStreak,
      longestStreak,
      lastActiveDate: todayStr,
    })

    return { streakContinued, newStreak }
  }

  // ============ Stats Tracking ============

  incrementStat(
    key: "totalTasksCompleted" | "totalGoalsAchieved" | "totalProjectsCompleted" | "totalHabitCompletions"
  ) {
    const stats = this.get()
    this.update({ [key]: (stats[key] || 0) + 1 })
  }

  addDeepWorkHours(hours: number) {
    const stats = this.get()
    this.update({
      totalDeepWorkHours: stats.totalDeepWorkHours + hours,
      totalFocusSessions: stats.totalFocusSessions + 1,
    })
  }

  // ============ Helpers ============

  getLevelName(): string {
    const level = this.get().level
    if (level >= 50) return "Легенда"
    if (level >= 40) return "Мастер"
    if (level >= 30) return "Эксперт"
    if (level >= 20) return "Ветеран"
    if (level >= 10) return "Адепт"
    if (level >= 5) return "Ученик"
    return "Новичок"
  }

  reset(): UserStats {
    setStore(this.key, { ...defaultStats })
    mutate(this.key)
    return this.get()
  }
}

export const statsModule = new StatsModule()
