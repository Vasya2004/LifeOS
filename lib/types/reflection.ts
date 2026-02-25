// ============================================
// REFLECTION TYPES - Reviews & Journaling
// ============================================

export interface DailyReview {
  date: string
  
  // Оценка дня
  dayRating: 1 | 2 | 3 | 4 | 5
  energyLevel: 1 | 2 | 3 | 4 | 5
  focusLevel: 1 | 2 | 3 | 4 | 5
  mood: 'terrible' | 'bad' | 'neutral' | 'good' | 'excellent'
  
  // Рефлексия
  wins: string[] // Что получилось
  struggles: string[] // Что было сложно
  lessons: string // Чему научился
  gratitude: string[] // За что благодарен
  
  // Связь с целями
  goalProgress: {
    goalId: string
    action: string
  }[]
}

export interface WeeklyReview {
  weekStart: string
  weekEnd: string
  
  // Метрики недели
  tasksCompleted: number
  tasksPlanned: number
  habitsConsistency: number // %
  totalDeepWorkHours: number
  avgEnergy: number
  
  // Анализ
  topWins: string[]
  topStruggles: string[]
  insights: string
  nextWeekPriorities: string[]
  
  // Колесо баланса на этой неделе
  areaRatings: {
    areaId: string
    rating: number // 1-10
  }[]
}

export interface JournalEntry {
  id: string
  timestamp: string
  type: 'thought' | 'decision' | 'milestone' | 'gratitude' | 'problem'
  content: string
  tags: string[]
  linkedGoalId?: string
  linkedTaskId?: string
}
