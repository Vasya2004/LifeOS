// ============================================
// GAMIFICATION TYPES - XP, Levels, Rewards
// ============================================

export interface UserStats {
  level: number
  xp: number
  xpToNext: number
  
  coins: number
  totalCoinsEarned: number
  totalCoinsSpent: number
  
  // Streak
  currentStreak: number
  longestStreak: number
  lastActiveDate: string
  
  // Статистика
  totalTasksCompleted: number
  totalGoalsAchieved: number
  totalProjectsCompleted: number
  totalHabitCompletions: number
  
  // Время
  totalDeepWorkHours: number
  totalFocusSessions: number
  avgDailyTasks: number
}

export interface Reward {
  id: string
  title: string
  description: string
  cost: number
  icon: string
  category: 'experience' | 'item' | 'privilege'
  isRepeatable: boolean
  cooldownDays?: number
  lastPurchasedAt?: string
}

export interface Wish {
  id: string
  title: string
  description: string
  imageUrl?: string
  cost: number
  progress: number // 0-100
  linkedGoalId?: string
  deadline?: string
  status: 'saving' | 'ready' | 'purchased' | 'archived'
  purchasedAt?: string
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  category: 'streak' | 'productivity' | 'growth' | 'social' | 'special'
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  unlockedAt?: string
  progress: number
  target: number
}
