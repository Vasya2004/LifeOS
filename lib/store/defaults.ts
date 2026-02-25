// ============================================
// DEFAULT DATA
// ============================================

import type { Identity, UserStats, AppSettings } from "@/lib/types"
import { genId, now, today } from "./core"

export const defaultIdentity: Identity = {
  id: genId(),
  name: "Игрок 1",
  vision: "",
  mission: "",
  createdAt: now(),
  updatedAt: now(),
}

export const defaultStats: UserStats = {
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

export const defaultSettings: AppSettings = {
  theme: "dark",
  soundEnabled: true,
  notificationsEnabled: false,
  weekStartsOn: 1,
  defaultWorkingHours: { start: "09:00", end: "18:00" },
}

// ============================================
// GAME BALANCE CONSTANTS
// ============================================

export const DIFFICULTY_XP = { easy: 10, medium: 25, hard: 50, epic: 100 }
export const DIFFICULTY_COINS = { easy: 5, medium: 15, hard: 30, epic: 75 }
export const PRIORITY_XP = { low: 5, medium: 10, high: 20, critical: 30 }
