// ============================================
// LIFE OS - Core Type System
// ============================================

// 1. FOUNDATION - Кто ты и куда идешь
// ============================================

export interface Identity {
  id: string
  name: string
  vision: string // Какой я вижу себя через 5 лет
  mission: string // Для чего я живу
  onboardingCompleted: boolean
  createdAt: string
  updatedAt: string
}

export interface CoreValue {
  id: string
  name: string
  description: string
  importance: 1 | 2 | 3 | 4 | 5 // 5 = критически важно
  color: string
}

export interface LifeArea {
  id: string
  name: string
  icon: string
  color: string
  vision: string // Видение для этой сферы
  currentLevel: number // 1-10
  targetLevel: number // 1-10
  isActive: boolean
}

export interface Role {
  id: string
  name: string
  areaId: string // К какой сфере относится
  description: string
  commitments: string[] // Что я обязуюсь делать в этой роли
}

// 2. OPERATIONAL LAYER - Что делать
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
  goalId: string // К какой цели относится
  title: string
  description: string
  status: 'planning' | 'active' | 'completed' | 'on_hold'

  // Время
  startDate: string
  targetDate: string
  completedAt?: string

  // Сложность
  estimatedHours: number
  actualHours: number
  difficulty: 'easy' | 'medium' | 'hard' | 'epic'

  // Награды
  xpReward: number
  coinReward: number
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

// 3. RESOURCES - Ресурсы
// ============================================

export interface EnergyState {
  date: string
  physical: number // 0-100
  mental: number
  emotional: number
  creative: number
  overall: number
}

export interface TimeBlock {
  id: string
  date: string
  startTime: string // "09:00"
  endTime: string // "11:00"
  title: string
  type: 'deep_work' | 'admin' | 'meeting' | 'rest' | 'exercise'
  taskId?: string
  isProtected: boolean // Нельзя переносить
}

// 4. REFLECTION - Обратная связь
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

// 5. GAMIFICATION - Игрофикация
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

// 6. SYSTEM - Системное
// ============================================

export interface AppData {
  version: string
  exportDate: string

  // Foundation
  identity: Identity
  values: CoreValue[]
  areas: LifeArea[]
  roles: Role[]

  // Operational
  goals: Goal[]
  projects: Project[]
  tasks: Task[]
  habits: Habit[]
  challenges: Challenge[]

  // Skills
  skills: Skill[]

  // Resources
  energyHistory: EnergyState[]
  timeBlocks: TimeBlock[]

  // Reflection
  dailyReviews: DailyReview[]
  weeklyReviews: WeeklyReview[]
  journal: JournalEntry[]

  // Gamification
  stats: UserStats
  rewards: Reward[]
  wishes: Wish[]
  achievements: Achievement[]

  // Finance
  accounts: Account[]
  transactions: Transaction[]
  financialGoals: FinancialGoal[]
  budgets: Budget[]

  // Health
  bodyZones: BodyZone[]
  medicalDocuments: MedicalDocument[]
  healthMetrics: HealthMetricEntry[]
  healthProfile: HealthProfile

  // Settings
  settings: AppSettings
}

export interface AppSettings {
  theme: 'dark' | 'light' | 'system'
  soundEnabled: boolean
  notificationsEnabled: boolean
  weekStartsOn: 0 | 1 // 0 = Sunday, 1 = Monday
  defaultWorkingHours: {
    start: string
    end: string
  }
}

// ============================================
// FINANCE - Financial Discipline Tracker
// ============================================

export type AccountType = 'cash' | 'bank' | 'investment' | 'crypto' | 'debt'
export type TransactionType = 'income' | 'expense' | 'transfer'

export interface Account {
  id: string
  userId: string
  name: string
  type: AccountType
  balance: number
  currency: string
  color?: string
  icon?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Transaction {
  id: string
  userId: string
  accountId: string
  type: TransactionType
  amount: number
  category: string
  description?: string
  transactionDate: string
  relatedGoalId?: string
  createdAt: string
}

export interface FinancialGoal {
  id: string
  userId: string
  title: string
  description?: string
  targetAmount: number
  currentAmount: number
  deadline?: string
  category: 'savings' | 'investment' | 'debt_payment' | 'purchase' | 'emergency_fund'
  isCompleted: boolean
  completedAt?: string
  createdAt: string
  updatedAt: string
}

export interface Budget {
  id: string
  userId: string
  category: string
  limit: number
  period: 'weekly' | 'monthly' | 'yearly'
  startDate: string
  isActive: boolean
}

export interface FinancialStats {
  totalAssets: number
  totalLiabilities: number
  netWorth: number
  monthlyIncome: number
  monthlyExpenses: number
  monthlySavings: number
  savingsRate: number // percentage
}

export const FINANCE_CATEGORIES = {
  income: [
    { id: 'salary', name: 'Зарплата', icon: 'briefcase' },
    { id: 'freelance', name: 'Фриланс', icon: 'laptop' },
    { id: 'investment', name: 'Инвестиции', icon: 'trending-up' },
    { id: 'gift', name: 'Подарки', icon: 'gift' },
    { id: 'other_income', name: 'Другое', icon: 'plus' },
  ],
  expense: [
    { id: 'food', name: 'Еда', icon: 'utensils' },
    { id: 'transport', name: 'Транспорт', icon: 'car' },
    { id: 'housing', name: 'Жильё', icon: 'home' },
    { id: 'health', name: 'Здоровье', icon: 'heart' },
    { id: 'entertainment', name: 'Развлечения', icon: 'gamepad' },
    { id: 'education', name: 'Образование', icon: 'book' },
    { id: 'shopping', name: 'Покупки', icon: 'shopping-bag' },
    { id: 'subscriptions', name: 'Подписки', icon: 'credit-card' },
    { id: 'other_expense', name: 'Другое', icon: 'minus' },
  ],
} as const

// ============================================
// CONSTANTS & ENUMS
// ============================================

export const LIFE_AREAS = [
  { id: 'health', name: 'Health & Fitness', icon: 'heart', color: '#22c55e' },
  { id: 'career', name: 'Career & Business', icon: 'briefcase', color: '#3b82f6' },
  { id: 'finance', name: 'Finance & Wealth', icon: 'wallet', color: '#eab308' },
  { id: 'relationships', name: 'Relationships', icon: 'users', color: '#ec4899' },
  { id: 'growth', name: 'Personal Growth', icon: 'brain', color: '#8b5cf6' },
  { id: 'recreation', name: 'Recreation & Fun', icon: 'gamepad', color: '#f97316' },
  { id: 'environment', name: 'Environment', icon: 'home', color: '#14b8a6' },
  { id: 'spirituality', name: 'Spirituality', icon: 'sparkles', color: '#6366f1' },
] as const

export const DIFFICULTY_MULTIPLIERS = {
  easy: { xp: 10, coins: 5, energy: -5 },
  medium: { xp: 25, coins: 15, energy: -10 },
  hard: { xp: 50, coins: 30, energy: -20 },
  epic: { xp: 100, coins: 75, energy: -40 },
}

// ============================================
// HEALTH MODULE - Character Stats System
// ============================================

export type BodyZoneStatus = 'green' | 'yellow' | 'red'
export type MedicalDocumentType = 'blood' | 'xray' | 'prescription' | 'mri' | 'ultrasound' | 'other'
export type HealthMetricType = 'weight' | 'sleep' | 'water' | 'steps' | 'mood' | 'heart_rate' | 'blood_pressure'

export interface BodyZone {
  id: string
  name: string
  displayName: string
  icon: string
  status: BodyZoneStatus
  notes: string
  lastCheckup?: string
  position: { x: number; y: number } // For 2D map positioning (0-100%)
}

export interface MedicalDocument {
  id: string
  title: string
  fileUrl: string
  fileType: 'pdf' | 'image'
  documentType: MedicalDocumentType
  date: string
  summary?: string
  tags: string[]
  doctorName?: string
  clinic?: string
  createdAt: string
}

export interface HealthMetricEntry {
  id: string
  date: string
  type: HealthMetricType
  value: number
  unit: string
  notes?: string
  time?: string // Optional time for specific readings
}

export interface HealthProfile {
  bloodType?: string
  allergies: string[]
  chronicConditions: string[]
  medications: Medication[]
  emergencyContact?: EmergencyContact
}

export interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  startDate: string
  endDate?: string
  notes?: string
}

export interface EmergencyContact {
  name: string
  phone: string
  relationship: string
}

export const BODY_ZONES_DEFAULT: Omit<BodyZone, 'id'>[] = [
  { name: 'head', displayName: 'Голова', icon: 'brain', status: 'green', notes: '', position: { x: 50, y: 8 } },
  { name: 'chest', displayName: 'Грудная клетка', icon: 'heart', status: 'green', notes: '', position: { x: 50, y: 30 } },
  { name: 'stomach', displayName: 'Живот', icon: 'activity', status: 'green', notes: '', position: { x: 50, y: 45 } },
  { name: 'back', displayName: 'Спина', icon: 'bone', status: 'green', notes: '', position: { x: 50, y: 35 } },
  { name: 'left_arm', displayName: 'Левая рука', icon: 'arm', status: 'green', notes: '', position: { x: 20, y: 40 } },
  { name: 'right_arm', displayName: 'Правая рука', icon: 'arm', status: 'green', notes: '', position: { x: 80, y: 40 } },
  { name: 'left_leg', displayName: 'Левая нога', icon: 'leg', status: 'green', notes: '', position: { x: 35, y: 75 } },
  { name: 'right_leg', displayName: 'Правая нога', icon: 'leg', status: 'green', notes: '', position: { x: 65, y: 75 } },
]

export const MEDICAL_DOCUMENT_TYPES: { id: MedicalDocumentType; name: string; icon: string }[] = [
  { id: 'blood', name: 'Анализ крови', icon: 'droplet' },
  { id: 'xray', name: 'Рентген', icon: 'scan' },
  { id: 'mri', name: 'МРТ', icon: 'scan-line' },
  { id: 'ultrasound', name: 'УЗИ', icon: 'waves' },
  { id: 'prescription', name: 'Рецепт', icon: 'file-text' },
  { id: 'other', name: 'Другое', icon: 'file' },
]

export const HEALTH_METRIC_UNITS: Record<HealthMetricType, string> = {
  weight: 'кг',
  sleep: 'ч',
  water: 'мл',
  steps: 'шагов',
  mood: '/10',
  heart_rate: 'уд/мин',
  blood_pressure: 'мм рт.ст.',
}

// ============================================
// SKILLS MODULE - RPG-style Skill Progression
// ============================================

export type SkillActivityType = 'theory' | 'practice' | 'result'

export interface SkillActivity {
  id: string
  skillId: string
  description: string
  xpAmount: number // 1-3
  activityType: SkillActivityType
  proofUrl?: string
  proofRequired: boolean
  createdAt: string
}

export interface SkillCertificate {
  id: string
  skillId: string
  levelAchieved: number
  certificateUrl?: string
  issuedAt: string
}

export interface SkillDecayLog {
  id: string
  skillId: string
  xpLost: number
  reason: string
  createdAt: string
}

export interface Skill {
  id: string
  userId: string
  name: string
  description: string
  icon: string
  color: string
  category: string
  currentLevel: number // 1-50+
  currentXp: number
  xpNeeded: number // XP needed for next level
  totalXpEarned: number
  lastActivityDate: string
  isDecaying: boolean
  activities: SkillActivity[]
  certificates: SkillCertificate[]
  decayLogs: SkillDecayLog[]
  createdAt: string
  updatedAt: string
}

// Skill Tier System Configuration
export const SKILL_TIERS = {
  1: {
    title: 'Новичок',
    titleEn: 'Novice',
    color: 'text-gray-400',
    borderColor: 'border-gray-600',
    bgColor: 'bg-gray-500/10',
    glowEffect: 'none',
    requiresCertificate: false
  },
  2: {
    title: 'Любитель',
    titleEn: 'Amateur',
    color: 'text-green-500',
    borderColor: 'border-green-500',
    bgColor: 'bg-green-500/10',
    glowEffect: 'soft',
    requiresCertificate: false
  },
  3: {
    title: 'Практик',
    titleEn: 'Practitioner',
    color: 'text-blue-500',
    borderColor: 'border-blue-500',
    bgColor: 'bg-blue-500/10',
    glowEffect: 'glow',
    requiresCertificate: false
  },
  4: {
    title: 'Профи',
    titleEn: 'Professional',
    color: 'text-purple-500',
    borderColor: 'border-purple-500',
    bgColor: 'bg-purple-500/10',
    glowEffect: 'pulse',
    requiresCertificate: false
  },
  5: {
    title: 'Эксперт',
    titleEn: 'Expert',
    color: 'text-orange-500',
    borderColor: 'border-orange-500',
    bgColor: 'bg-gradient-to-br from-orange-500/20 to-yellow-500/20',
    glowEffect: 'gold',
    requiresCertificate: true
  },
  10: {
    title: 'Легенда',
    titleEn: 'Legend',
    color: 'text-red-500',
    borderColor: 'border-red-500',
    bgColor: 'bg-gradient-to-br from-red-500/20 via-orange-500/20 to-yellow-500/20',
    glowEffect: 'fire',
    requiresCertificate: true
  },
} as const

export type SkillTierLevel = keyof typeof SKILL_TIERS

// XP Formula: Each level requires 20% more XP than previous
// Level 1: 3 XP, Level 2: 4 XP, Level 3: 5 XP...
export function calculateXpNeeded(level: number): number {
  if (level >= 10) return 20
  if (level >= 5) return 15
  if (level >= 4) return 12
  if (level >= 3) return 8
  if (level >= 2) return 5
  return 3
}

// Get tier config for any level
export function getSkillTier(level: number) {
  if (level >= 10) return SKILL_TIERS[10]
  if (level >= 5) return SKILL_TIERS[5]
  if (level >= 4) return SKILL_TIERS[4]
  if (level >= 3) return SKILL_TIERS[3]
  if (level >= 2) return SKILL_TIERS[2]
  return SKILL_TIERS[1]
}

// Activity type multipliers
export const SKILL_ACTIVITY_XP = {
  theory: 1,      // Reading, watching videos
  practice: 2,    // Exercises, training
  result: 3       // Real-world application, project completion
} as const

// Skill categories
export const SKILL_CATEGORIES = [
  { id: 'technical', name: 'Технические', icon: 'code', color: '#3b82f6' },
  { id: 'creative', name: 'Творческие', icon: 'palette', color: '#ec4899' },
  { id: 'physical', name: 'Физические', icon: 'dumbbell', color: '#22c55e' },
  { id: 'mental', name: 'Ментальные', icon: 'brain', color: '#8b5cf6' },
  { id: 'social', name: 'Социальные', icon: 'users', color: '#f97316' },
  { id: 'professional', name: 'Профессиональные', icon: 'briefcase', color: '#14b8a6' },
  { id: 'languages', name: 'Языки', icon: 'languages', color: '#eab308' },
  { id: 'other', name: 'Другие', icon: 'star', color: '#6b7280' },
] as const

// Decay settings
export const SKILL_DECAY = {
  inactiveDays: 7,        // Start decay after 7 days
  decayAmount: 1,         // Lose 1 XP per day after threshold
  minLevel: 1,            // Cannot go below level 1
  gracePeriod: 3,         // 3 days grace before decay starts
} as const

// Certificate templates for Expert (5) and Legend (10+) levels
export const CERTIFICATE_TEMPLATES = {
  expert: {
    borderColor: '#f97316',
    gradient: 'from-orange-400 via-yellow-400 to-orange-500',
    badge: '🏆',
    title: 'Сертификат Эксперта'
  },
  legend: {
    borderColor: '#ef4444',
    gradient: 'from-red-500 via-orange-500 to-yellow-500',
    badge: '👑',
    title: 'Сертификат Легенды'
  }
} as const
