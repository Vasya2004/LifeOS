// ============================================
// ZOD VALIDATION SCHEMAS
// ============================================

import { z } from "zod"

// ============================================
// FOUNDATION LAYER
// ============================================

export const identitySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "Имя обязательно").max(100, "Максимум 100 символов"),
  vision: z.string().max(500, "Максимум 500 символов").optional(),
  mission: z.string().max(500, "Максимум 500 символов").optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const coreValueSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "Название обязательно").max(100, "Максимум 100 символов"),
  description: z.string().max(500, "Максимум 500 символов").optional(),
  importance: z.number().int().min(1).max(5),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Неверный формат цвета"),
})

export const lifeAreaSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "Название обязательно").max(100, "Максимум 100 символов"),
  icon: z.string().min(1),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Неверный формат цвета"),
  vision: z.string().max(500, "Максимум 500 символов").optional(),
  currentLevel: z.number().int().min(1).max(10),
  targetLevel: z.number().int().min(1).max(10),
  isActive: z.boolean(),
})

export const roleSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "Название обязательно").max(100, "Максимум 100 символов"),
  areaId: z.string().min(1, "Сфера жизни обязательна"),
  description: z.string().max(500, "Максимум 500 символов").optional(),
  commitments: z.array(z.string().min(1)).default([]),
})

// ============================================
// OPERATIONAL LAYER
// ============================================

export const milestoneSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1, "Название обязательно").max(200, "Максимум 200 символов"),
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Неверный формат даты"),
  isCompleted: z.boolean(),
  completedAt: z.string().datetime().optional(),
})

export const goalSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1, "Название цели обязательно").max(200, "Максимум 200 символов"),
  description: z.string().max(1000, "Максимум 1000 символов").optional(),
  areaId: z.string().min(1, "Сфера жизни обязательна"),
  type: z.enum(["outcome", "process"]),
  status: z.enum(["active", "completed", "paused", "dropped"]),
  priority: z.number().int().min(1).max(5),
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Неверный формат даты"),
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
  progress: z.number().min(0).max(100),
  milestones: z.array(milestoneSchema).default([]),
  relatedValues: z.array(z.string()).default([]),
  relatedRoles: z.array(z.string()).default([]),
})

// Schema for creating a new goal (without auto-generated fields)
export const createGoalSchema = z.object({
  title: z.string().min(1, "Название цели обязательно").max(200, "Максимум 200 символов"),
  description: z.string().max(1000, "Максимум 1000 символов").optional().default(""),
  areaId: z.string().min(1, "Сфера жизни обязательна"),
  type: z.enum(["outcome", "process"]),
  priority: z.number().int().min(1).max(5),
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Выберите дату дедлайна"),
})

export const projectSchema = z.object({
  id: z.string().min(1),
  goalId: z.string().min(1),
  title: z.string().min(1, "Название обязательно").max(200, "Максимум 200 символов"),
  description: z.string().max(1000, "Максимум 1000 символов").optional(),
  status: z.enum(["planning", "active", "completed", "on_hold"]),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Неверный формат даты"),
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Неверный формат даты"),
  completedAt: z.string().datetime().optional(),
  estimatedHours: z.number().min(0).max(10000),
  actualHours: z.number().min(0).max(10000),
  difficulty: z.enum(["easy", "medium", "hard", "epic"]),
  xpReward: z.number().min(0),
  coinReward: z.number().min(0),
})

export const taskSchema = z.object({
  id: z.string().min(1),
  projectId: z.string().optional(),
  title: z.string().min(1, "Название задачи обязательно").max(200, "Максимум 200 символов"),
  description: z.string().max(1000, "Максимум 1000 символов").optional(),
  scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Неверный формат даты"),
  scheduledTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Неверный формат времени").optional(),
  duration: z.number().int().min(5, "Минимум 5 минут").max(1440, "Максимум 24 часа").optional(),
  status: z.enum(["todo", "in_progress", "completed", "cancelled"]),
  priority: z.enum(["critical", "high", "medium", "low"]),
  energyCost: z.enum(["low", "medium", "high"]),
  energyType: z.enum(["physical", "mental", "emotional", "creative"]),
  completedAt: z.string().datetime().optional(),
  actualDuration: z.number().min(0).optional(),
  notes: z.string().max(2000, "Максимум 2000 символов").optional(),
})

// Schema for creating a new task
export const createTaskSchema = z.object({
  title: z.string().min(1, "Название задачи обязательно").max(200, "Максимум 200 символов"),
  description: z.string().max(1000, "Максимум 1000 символов").optional().default(""),
  projectId: z.string().optional(),
  scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Выберите дату"),
  scheduledTime: z.string().optional(),
  duration: z.number().int().min(5, "Минимум 5 минут").max(1440, "Максимум 24 часа"),
  priority: z.enum(["critical", "high", "medium", "low"]),
  energyCost: z.enum(["low", "medium", "high"]),
  energyType: z.enum(["physical", "mental", "emotional", "creative"]),
})

export const habitEntrySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Неверный формат даты"),
  completed: z.boolean(),
  note: z.string().max(500, "Максимум 500 символов").optional(),
})

export const habitSchema = z.object({
  id: z.string().min(1),
  areaId: z.string().min(1, "Сфера жизни обязательна"),
  title: z.string().min(1, "Название привычки обязательно").max(200, "Максимум 200 символов"),
  description: z.string().max(1000, "Максимум 1000 символов").optional(),
  frequency: z.enum(["daily", "weekly", "custom"]),
  targetDays: z.array(z.number().int().min(0).max(6)).default([]),
  targetCount: z.number().int().min(1).max(7).optional(),
  energyImpact: z.number().int().min(-100).max(100),
  energyType: z.enum(["physical", "mental", "emotional", "creative"]),
  streak: z.number().int().min(0).default(0),
  bestStreak: z.number().int().min(0).default(0),
  totalCompletions: z.number().int().min(0).default(0),
  entries: z.array(habitEntrySchema).default([]),
  xpReward: z.number().int().min(0).default(10),
})

// Schema for creating a new habit
export const createHabitSchema = z.object({
  areaId: z.string().min(1, "Сфера жизни обязательна"),
  title: z.string().min(1, "Название привычки обязательно").max(200, "Максимум 200 символов"),
  description: z.string().max(1000, "Максимум 1000 символов").optional().default(""),
  frequency: z.enum(["daily", "weekly", "custom"]),
  targetDays: z.array(z.number().int().min(0).max(6)),
  targetCount: z.number().int().min(1).max(7).optional(),
  energyImpact: z.number().int().min(-100).max(100),
  energyType: z.enum(["physical", "mental", "emotional", "creative"]),
  xpReward: z.number().int().min(0),
})

// ============================================
// REFLECTION LAYER
// ============================================

export const dailyReviewSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Неверный формат даты"),
  dayRating: z.number().int().min(1).max(5),
  energyLevel: z.number().int().min(1).max(5),
  focusLevel: z.number().int().min(1).max(5),
  mood: z.enum(["terrible", "bad", "neutral", "good", "excellent"]),
  wins: z.array(z.string().min(1).max(200)).max(10, "Максимум 10 побед").default([]),
  struggles: z.array(z.string().min(1).max(200)).max(10, "Максимум 10 сложностей").default([]),
  lessons: z.string().max(2000, "Максимум 2000 символов").optional(),
  gratitude: z.array(z.string().min(1).max(200)).max(10, "Максимум 10 пунктов").default([]),
  goalProgress: z.array(z.object({
    goalId: z.string(),
    action: z.string().max(500),
  })).default([]),
})

export const journalEntrySchema = z.object({
  id: z.string().min(1),
  timestamp: z.string().datetime(),
  type: z.enum(["thought", "decision", "milestone", "gratitude", "problem"]),
  content: z.string().min(1, "Содержание обязательно").max(5000, "Максимум 5000 символов"),
  tags: z.array(z.string().min(1).max(50)).max(20, "Максимум 20 тегов").default([]),
  linkedGoalId: z.string().optional(),
  linkedTaskId: z.string().optional(),
})

// ============================================
// GAMIFICATION LAYER
// ============================================

export const userStatsSchema = z.object({
  level: z.number().int().min(1).default(1),
  xp: z.number().int().min(0).default(0),
  xpToNext: z.number().int().min(1).default(1000),
  coins: z.number().int().min(0).default(0),
  totalCoinsEarned: z.number().int().min(0).default(0),
  totalCoinsSpent: z.number().int().min(0).default(0),
  currentStreak: z.number().int().min(0).default(0),
  longestStreak: z.number().int().min(0).default(0),
  lastActiveDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  totalTasksCompleted: z.number().int().min(0).default(0),
  totalGoalsAchieved: z.number().int().min(0).default(0),
  totalProjectsCompleted: z.number().int().min(0).default(0),
  totalHabitCompletions: z.number().int().min(0).default(0),
  totalDeepWorkHours: z.number().min(0).default(0),
  totalFocusSessions: z.number().int().min(0).default(0),
  avgDailyTasks: z.number().min(0).default(0),
})

export const wishSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1, "Название обязательно").max(200, "Максимум 200 символов"),
  description: z.string().max(1000, "Максимум 1000 символов").optional(),
  imageUrl: z.string().url("Неверный URL").optional(),
  cost: z.number().int().min(1, "Стоимость должна быть больше 0").max(1000000),
  progress: z.number().min(0).max(100).default(0),
  linkedGoalId: z.string().optional(),
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  status: z.enum(["saving", "ready", "purchased", "archived"]).default("saving"),
  purchasedAt: z.string().datetime().optional(),
})

// Schema for creating a new wish
export const createWishSchema = z.object({
  title: z.string().min(1, "Название обязательно").max(200, "Максимум 200 символов"),
  description: z.string().max(1000, "Максимум 1000 символов").optional(),
  cost: z.number().int().min(1, "Стоимость должна быть больше 0").max(1000000),
  linkedGoalId: z.string().optional(),
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})

// ============================================
// SETTINGS
// ============================================

export const appSettingsSchema = z.object({
  theme: z.enum(["dark", "light", "system"]).default("dark"),
  soundEnabled: z.boolean().default(true),
  notificationsEnabled: z.boolean().default(false),
  weekStartsOn: z.number().int().min(0).max(1).default(1),
  defaultWorkingHours: z.object({
    start: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Неверный формат времени"),
    end: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Неверный формат времени"),
  }).default({ start: "09:00", end: "18:00" }),
})

// ============================================
// EXPORT/IMPORT
// ============================================

export const appDataSchema = z.object({
  version: z.string(),
  exportDate: z.string().datetime(),
  identity: identitySchema,
  values: z.array(coreValueSchema),
  areas: z.array(lifeAreaSchema),
  roles: z.array(roleSchema),
  goals: z.array(goalSchema),
  projects: z.array(projectSchema),
  tasks: z.array(taskSchema),
  habits: z.array(habitSchema),
  challenges: z.array(z.any()), // TODO: Define challenge schema
  energyHistory: z.array(z.any()), // TODO: Define energy state schema
  timeBlocks: z.array(z.any()), // TODO: Define time block schema
  dailyReviews: z.array(dailyReviewSchema),
  weeklyReviews: z.array(z.any()), // TODO: Define weekly review schema
  journal: z.array(journalEntrySchema),
  stats: userStatsSchema,
  rewards: z.array(z.any()), // TODO: Define reward schema
  wishes: z.array(wishSchema),
  achievements: z.array(z.any()), // TODO: Define achievement schema
  settings: appSettingsSchema,
})

// ============================================
// TYPE INFERENCES
// ============================================

export type CreateGoalInput = z.infer<typeof createGoalSchema>
export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type CreateHabitInput = z.infer<typeof createHabitSchema>
export type CreateWishInput = z.infer<typeof createWishSchema>

// ============================================
// FINANCE VALIDATION SCHEMAS
// ============================================

export const accountSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  name: z.string().min(1, "Название счёта обязательно").max(100, "Максимум 100 символов"),
  type: z.enum(["cash", "bank", "investment", "crypto", "debt"]),
  balance: z.number().default(0),
  currency: z.string().default("RUB"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  icon: z.string().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const createAccountSchema = z.object({
  name: z.string().min(1, "Название счёта обязательно").max(100, "Максимум 100 символов"),
  type: z.enum(["cash", "bank", "investment", "crypto", "debt"]),
  balance: z.number().default(0),
  currency: z.string().default("RUB"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  icon: z.string().optional(),
})

export const transactionSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  accountId: z.string().min(1, "Выберите счёт"),
  type: z.enum(["income", "expense", "transfer"]),
  amount: z.number().positive("Сумма должна быть положительной").max(999999999, "Сумма слишком большая"),
  category: z.string().min(1, "Выберите категорию"),
  description: z.string().max(500, "Максимум 500 символов").optional().default(""),
  transactionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Неверный формат даты"),
  relatedGoalId: z.string().optional(),
  createdAt: z.string().datetime(),
})

export const createTransactionSchema = z.object({
  accountId: z.string().min(1, "Выберите счёт"),
  type: z.enum(["income", "expense", "transfer"]),
  amount: z.number().positive("Сумма должна быть положительной").max(999999999, "Сумма слишком большая"),
  category: z.string().min(1, "Выберите категорию"),
  description: z.string().max(500, "Максимум 500 символов").optional().default(""),
  transactionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Выберите дату"),
  relatedGoalId: z.string().optional(),
})

export const financialGoalSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  title: z.string().min(1, "Название цели обязательно").max(200, "Максимум 200 символов"),
  description: z.string().max(1000, "Максимум 1000 символов").optional().default(""),
  targetAmount: z.number().positive("Целевая сумма должна быть положительной").max(9999999999),
  currentAmount: z.number().min(0).default(0),
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  category: z.enum(["savings", "investment", "debt_payment", "purchase", "emergency_fund"]),
  isCompleted: z.boolean().default(false),
  completedAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const createFinancialGoalSchema = z.object({
  title: z.string().min(1, "Название цели обязательно").max(200, "Максимум 200 символов"),
  description: z.string().max(1000, "Максимум 1000 символов").optional().default(""),
  targetAmount: z.number().positive("Целевая сумма должна быть положительной").max(9999999999),
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  category: z.enum(["savings", "investment", "debt_payment", "purchase", "emergency_fund"]),
})

export const budgetSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  category: z.string().min(1),
  limit: z.number().positive(),
  period: z.enum(["weekly", "monthly", "yearly"]),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  isActive: z.boolean().default(true),
})

export type CreateAccountInput = z.infer<typeof createAccountSchema>
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>
export type CreateFinancialGoalInput = z.infer<typeof createFinancialGoalSchema>
