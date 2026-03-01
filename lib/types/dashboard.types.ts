// ============================================
// DASHBOARD TYPES
// ============================================

export type LevelTier =
  | "Новичок"
  | "Ученик"
  | "Адепт"
  | "Ветеран"
  | "Эксперт"
  | "Мастер"
  | "Легенда"

export type LevelTierIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7

export interface LevelProgress {
  level: number
  xp: number
  xpToNext: number
  xpPercent: number
  tierName: LevelTier
  tierIndex: LevelTierIndex
  tierColor: string
  tierGradient: string
}

export type AIAdviceType = "warning" | "tip" | "positive" | "urgent"
export type AIAdviceCategory =
  | "productivity"
  | "health"
  | "finance"
  | "skills"
  | "balance"
  | "streak"

export interface AIAdvice {
  id: string
  type: AIAdviceType
  category: AIAdviceCategory
  title: string
  message: string
  actionLabel?: string
  actionHref?: string
  dismissible: boolean
  priority?: number
}

export interface MiniMetric {
  id: string
  label: string
  value: string
  subtext?: string
  trend?: "up" | "down" | "neutral"
  trendValue?: string
  href: string
  colorClass: string
}

export interface BossBattleData {
  id: string
  title: string
  progress: number
  daysLeft: number | null
  xpReward: number
  href: string
}

export interface DashboardData {
  stats: {
    level: number
    xp: number
    xpToNext: number
    coins: number
    currentStreak: number
    longestStreak: number
    totalTasksCompleted: number
  } | undefined
  identity: { name: string } | undefined
  todayTasksCount: number
  pendingTodayTasks: number
  energyPercent: number
}
