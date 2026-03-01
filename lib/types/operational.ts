// ============================================
// OPERATIONAL TYPES - Goals, Tasks, Habits
// ============================================

export interface Goal {
  id: string
  title: string
  description: string
  areaId: string // Связь со сферой жизни
  type: 'outcome' | 'process' // Результат или процесс
  status: 'active' | 'completed' | 'paused' | 'dropped'
  priority: 1 | 2 | 3 | 4 | 5
  
  // Временные рамки
  targetDate: string
  startedAt: string
  completedAt?: string
  
  // Прогресс
  progress: number // 0-100
  milestones: Milestone[]
  
  // Связи
  relatedValues: string[] // ID ценностей
  relatedRoles: string[] // ID ролей
}

export interface Milestone {
  id: string
  title: string
  targetDate: string
  isCompleted: boolean
  completedAt?: string
}

export interface Project {
  id: string
  title: string
  description: string
  status: 'active' | 'paused' | 'completed' | 'archived'
  priority: 1 | 2 | 3 | 4 | 5

  // Визуал
  color: string  // hex, e.g. "#6366f1"
  icon: string   // emoji, e.g. "🚀"

  // Связи
  goalId?: string   // Optional link to a goal
  areaId?: string   // Optional link to life area

  // Даты
  startedAt: string
  deadline?: string
  completedAt?: string

  // Гейми
  xpAwarded: number

  // Мета
  createdAt: string
  updatedAt: string
}

export interface Task {
  id: string
  projectId?: string // Опционально - может быть standalone
  title: string
  description?: string
  
  // Время
  scheduledDate: string // Когда запланировано
  scheduledTime?: string // Опциональное время
  duration?: number // В минутах
  
  // Статус
  status: 'todo' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'critical' | 'high' | 'medium' | 'low'
  
  // Энергия
  energyCost: 'low' | 'medium' | 'high' // Сколько энергии требует
  energyType: 'physical' | 'mental' | 'emotional' | 'creative'
  
  // Выполнение
  completedAt?: string
  actualDuration?: number
  notes?: string
}

export interface Habit {
  id: string
  areaId: string
  title: string
  description: string
  
  // Частота
  frequency: 'daily' | 'weekly' | 'custom'
  targetDays: number[] // [1,3,5] = Пн, Ср, Пт
  targetCount?: number // Сколько раз в неделю (для weekly)
  
  // Энергия
  energyImpact: number // +10 (пополняет) или -10 (тратит)
  energyType: 'physical' | 'mental' | 'emotional' | 'creative'
  
  // Прогресс
  streak: number
  bestStreak: number
  totalCompletions: number
  entries: HabitEntry[]
  
  // Награды
  xpReward: number
}

export interface HabitEntry {
  date: string
  completed: boolean
  note?: string
}

export interface Challenge {
  id: string
  title: string
  description: string
  type: 'streak' | 'total_count' | 'consistency'
  
  // Период
  startDate: string
  durationDays: number
  endDate: string
  
  // Цель
  targetValue: number // Например, 30 дней или 10к шагов
  currentValue: number
  
  // Связь
  habitId?: string // Может быть привязан к привычке
  
  // Прогресс
  status: 'upcoming' | 'active' | 'completed' | 'failed'
  entries: ChallengeEntry[]
  
  // Награды
  xpReward: number
  coinReward: number
}

export interface ChallengeEntry {
  date: string
  value: number
  note?: string
}
