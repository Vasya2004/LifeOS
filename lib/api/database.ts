// ============================================
// DATABASE API - Supabase client with offline-first support
// ============================================

import { createClient } from "@/lib/supabase/client"
import type { 
  LifeArea, Goal, Task, Habit, Skill, UserStats,
  Account, Transaction, BodyZone, CoreValue 
} from "@/lib/types"

const supabase = createClient()

// ============================================
// ERROR HANDLING
// ============================================

export class DatabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public originalError?: unknown
  ) {
    super(message)
    this.name = "DatabaseError"
  }
}

// ============================================
// PROFILES
// ============================================

export async function getProfile() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new DatabaseError("Not authenticated")

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (error) throw new DatabaseError(error.message, error.code, error)
  return data
}

export async function updateProfile(updates: Partial<{ name: string; vision: string; mission: string; avatar_url: string }>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new DatabaseError("Not authenticated")

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id)
    .select()
    .single()

  if (error) throw new DatabaseError(error.message, error.code, error)
  return data
}

// ============================================
// LIFE AREAS
// ============================================

export async function getAreas(): Promise<LifeArea[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from("life_areas")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: true })

  if (error) throw new DatabaseError(error.message, error.code, error)
  
  return (data || []).map(dbToArea)
}

export async function createArea(area: Omit<LifeArea, "id">): Promise<LifeArea> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new DatabaseError("Not authenticated")

  const dbArea = areaToDb(area, user.id)
  
  const { data, error } = await supabase
    .from("life_areas")
    .insert(dbArea)
    .select()
    .single()

  if (error) throw new DatabaseError(error.message, error.code, error)
  return dbToArea(data)
}

export async function updateArea(id: string, updates: Partial<LifeArea>): Promise<LifeArea> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new DatabaseError("Not authenticated")

  const { data, error } = await supabase
    .from("life_areas")
    .update(areaToDb(updates, user.id))
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) throw new DatabaseError(error.message, error.code, error)
  return dbToArea(data)
}

export async function deleteArea(id: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new DatabaseError("Not authenticated")

  const { error } = await supabase
    .from("life_areas")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) throw new DatabaseError(error.message, error.code, error)
}

// ============================================
// CORE VALUES
// ============================================

export async function getValues(): Promise<CoreValue[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from("core_values")
    .select("*")
    .eq("user_id", user.id)
    .order("importance", { ascending: false })

  if (error) throw new DatabaseError(error.message, error.code, error)
  return (data || []).map(dbToValue)
}

export async function createValue(value: Omit<CoreValue, "id">): Promise<CoreValue> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new DatabaseError("Not authenticated")

  const { data, error } = await supabase
    .from("core_values")
    .insert(valueToDb(value, user.id))
    .select()
    .single()

  if (error) throw new DatabaseError(error.message, error.code, error)
  return dbToValue(data)
}

export async function updateValue(id: string, updates: Partial<CoreValue>): Promise<CoreValue> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new DatabaseError("Not authenticated")

  const { data, error } = await supabase
    .from("core_values")
    .update(valueToDb(updates, user.id))
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) throw new DatabaseError(error.message, error.code, error)
  return dbToValue(data)
}

export async function deleteValue(id: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new DatabaseError("Not authenticated")

  const { error } = await supabase
    .from("core_values")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) throw new DatabaseError(error.message, error.code, error)
}

// ============================================
// GOALS
// ============================================

export async function getGoals(): Promise<Goal[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) throw new DatabaseError(error.message, error.code, error)
  return (data || []).map(dbToGoal)
}

export async function createGoal(goal: Omit<Goal, "id" | "createdAt">): Promise<Goal> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new DatabaseError("Not authenticated")

  const { data, error } = await supabase
    .from("goals")
    .insert(goalToDb(goal, user.id))
    .select()
    .single()

  if (error) throw new DatabaseError(error.message, error.code, error)
  return dbToGoal(data)
}

export async function updateGoal(id: string, updates: Partial<Goal>): Promise<Goal> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new DatabaseError("Not authenticated")

  const { data, error } = await supabase
    .from("goals")
    .update(goalToDb(updates, user.id))
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) throw new DatabaseError(error.message, error.code, error)
  return dbToGoal(data)
}

export async function deleteGoal(id: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new DatabaseError("Not authenticated")

  const { error } = await supabase
    .from("goals")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) throw new DatabaseError(error.message, error.code, error)
}

// ============================================
// TASKS
// ============================================

export async function getTasks(): Promise<Task[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .order("scheduled_date", { ascending: true })

  if (error) throw new DatabaseError(error.message, error.code, error)
  return (data || []).map(dbToTask)
}

export async function getTasksByDate(date: string): Promise<Task[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .eq("scheduled_date", date)
    .order("scheduled_time", { ascending: true })

  if (error) throw new DatabaseError(error.message, error.code, error)
  return (data || []).map(dbToTask)
}

export async function createTask(task: Omit<Task, "id">): Promise<Task> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new DatabaseError("Not authenticated")

  const { data, error } = await supabase
    .from("tasks")
    .insert(taskToDb(task, user.id))
    .select()
    .single()

  if (error) throw new DatabaseError(error.message, error.code, error)
  return dbToTask(data)
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new DatabaseError("Not authenticated")

  const { data, error } = await supabase
    .from("tasks")
    .update(taskToDb(updates, user.id))
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) throw new DatabaseError(error.message, error.code, error)
  return dbToTask(data)
}

export async function deleteTask(id: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new DatabaseError("Not authenticated")

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) throw new DatabaseError(error.message, error.code, error)
}

// ============================================
// HABITS
// ============================================

export async function getHabits(): Promise<Habit[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from("habits")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })

  if (error) throw new DatabaseError(error.message, error.code, error)
  return (data || []).map(dbToHabit)
}

export async function createHabit(habit: Omit<Habit, "id" | "streak" | "bestStreak" | "totalCompletions" | "entries">): Promise<Habit> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new DatabaseError("Not authenticated")

  const { data, error } = await supabase
    .from("habits")
    .insert(habitToDb(habit, user.id))
    .select()
    .single()

  if (error) throw new DatabaseError(error.message, error.code, error)
  return dbToHabit(data)
}

export async function updateHabit(id: string, updates: Partial<Habit>): Promise<Habit> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new DatabaseError("Not authenticated")

  const { data, error } = await supabase
    .from("habits")
    .update(habitToDb(updates, user.id))
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) throw new DatabaseError(error.message, error.code, error)
  return dbToHabit(data)
}

export async function deleteHabit(id: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new DatabaseError("Not authenticated")

  const { error } = await supabase
    .from("habits")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) throw new DatabaseError(error.message, error.code, error)
}

// ============================================
// HABIT ENTRIES
// ============================================

export async function toggleHabitEntry(habitId: string, date: string, completed: boolean): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new DatabaseError("Not authenticated")

  const { error } = await supabase
    .from("habit_entries")
    .upsert({
      habit_id: habitId,
      user_id: user.id,
      date,
      completed,
    }, { onConflict: "habit_id,date" })

  if (error) throw new DatabaseError(error.message, error.code, error)
}

// ============================================
// SKILLS
// ============================================

export async function getSkills(): Promise<Skill[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from("skills")
    .select("*")
    .eq("user_id", user.id)
    .order("current_level", { ascending: false })

  if (error) throw new DatabaseError(error.message, error.code, error)
  return (data || []).map(dbToSkill)
}

export async function createSkill(skill: Omit<Skill, "id" | "userId" | "currentLevel" | "currentXp" | "xpNeeded" | "totalXpEarned" | "lastActivityDate" | "isDecaying" | "activities" | "certificates" | "decayLogs" | "createdAt" | "updatedAt">): Promise<Skill> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new DatabaseError("Not authenticated")

  const { data, error } = await supabase
    .from("skills")
    .insert(skillToDb(skill, user.id))
    .select()
    .single()

  if (error) throw new DatabaseError(error.message, error.code, error)
  return dbToSkill(data)
}

export async function updateSkill(id: string, updates: Partial<Skill>): Promise<Skill> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new DatabaseError("Not authenticated")

  const { data, error } = await supabase
    .from("skills")
    .update(skillToDb(updates, user.id))
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) throw new DatabaseError(error.message, error.code, error)
  return dbToSkill(data)
}

export async function deleteSkill(id: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new DatabaseError("Not authenticated")

  const { error } = await supabase
    .from("skills")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) throw new DatabaseError(error.message, error.code, error)
}

// ============================================
// USER STATS
// ============================================

export async function getUserStats(): Promise<UserStats | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from("user_stats")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (error && error.code !== "PGRST116") throw new DatabaseError(error.message, error.code, error)
  return data ? dbToStats(data) : null
}

export async function updateUserStats(updates: Partial<UserStats>): Promise<UserStats> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new DatabaseError("Not authenticated")

  const { data, error } = await supabase
    .from("user_stats")
    .update(statsToDb(updates))
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) throw new DatabaseError(error.message, error.code, error)
  return dbToStats(data)
}

// ============================================
// REALTIME SUBSCRIPTIONS
// ============================================

export function subscribeToStats(callback: (stats: UserStats) => void) {
  const channel = supabase
    .channel("user_stats_changes")
    .on("postgres_changes", 
      { event: "*", schema: "public", table: "user_stats" },
      (payload) => callback(dbToStats(payload.new))
    )
    .subscribe()

  return () => supabase.removeChannel(channel)
}

export function subscribeToGoals(callback: (goals: Goal[]) => void) {
  const channel = supabase
    .channel("goals_changes")
    .on("postgres_changes",
      { event: "*", schema: "public", table: "goals" },
      async () => {
        const goals = await getGoals()
        callback(goals)
      }
    )
    .subscribe()

  return () => supabase.removeChannel(channel)
}

// ============================================
// DATA MAPPERS (DB <-> App Types)
// ============================================

function dbToArea(db: any): LifeArea {
  return {
    id: db.id,
    name: db.name,
    icon: db.icon,
    color: db.color,
    vision: db.vision,
    currentLevel: db.current_level,
    targetLevel: db.target_level,
    isActive: db.is_active,
  }
}

function areaToDb(area: Partial<LifeArea>, userId: string): any {
  return {
    user_id: userId,
    name: area.name,
    icon: area.icon,
    color: area.color,
    vision: area.vision,
    current_level: area.currentLevel,
    target_level: area.targetLevel,
    is_active: area.isActive,
  }
}

function dbToValue(db: any): CoreValue {
  return {
    id: db.id,
    name: db.name,
    description: db.description,
    importance: db.importance,
    color: db.color,
  }
}

function valueToDb(value: Partial<CoreValue>, userId: string): any {
  return {
    user_id: userId,
    name: value.name,
    description: value.description,
    importance: value.importance,
    color: value.color,
  }
}

function dbToGoal(db: any): Goal {
  return {
    id: db.id,
    title: db.title,
    description: db.description,
    areaId: db.area_id,
    type: db.type,
    status: db.status,
    priority: db.priority,
    targetDate: db.target_date,
    startedAt: db.started_at,
    completedAt: db.completed_at,
    progress: db.progress,
    milestones: db.milestones || [],
    relatedValues: db.related_values || [],
    relatedRoles: [],
  }
}

function goalToDb(goal: Partial<Goal>, userId: string): any {
  return {
    user_id: userId,
    title: goal.title,
    description: goal.description,
    area_id: goal.areaId,
    type: goal.type,
    status: goal.status,
    priority: goal.priority,
    target_date: goal.targetDate,
    completed_at: goal.completedAt,
    progress: goal.progress,
    milestones: goal.milestones,
    related_values: goal.relatedValues,
  }
}

function dbToTask(db: any): Task {
  return {
    id: db.id,
    projectId: db.goal_id,
    title: db.title,
    description: db.description,
    scheduledDate: db.scheduled_date,
    scheduledTime: db.scheduled_time,
    duration: db.duration,
    status: db.status,
    priority: db.priority,
    energyCost: db.energy_cost,
    energyType: db.energy_type,
    completedAt: db.completed_at,
    actualDuration: db.actual_duration,
    notes: db.notes,
  }
}

function taskToDb(task: Partial<Task>, userId: string): any {
  return {
    user_id: userId,
    goal_id: task.projectId,
    title: task.title,
    description: task.description,
    scheduled_date: task.scheduledDate,
    scheduled_time: task.scheduledTime,
    duration: task.duration,
    status: task.status,
    priority: task.priority,
    energy_cost: task.energyCost,
    energy_type: task.energyType,
    completed_at: task.completedAt,
    actual_duration: task.actualDuration,
    notes: task.notes,
  }
}

function dbToHabit(db: any): Habit {
  return {
    id: db.id,
    areaId: db.area_id,
    title: db.title,
    description: db.description,
    frequency: db.frequency,
    targetDays: db.target_days,
    targetCount: db.target_count,
    energyImpact: db.energy_impact,
    energyType: db.energy_type,
    streak: db.streak,
    bestStreak: db.best_streak,
    totalCompletions: db.total_completions,
    xpReward: db.xp_reward,
    entries: [],
  }
}

function habitToDb(habit: Partial<Habit>, userId: string): any {
  return {
    user_id: userId,
    area_id: habit.areaId,
    title: habit.title,
    description: habit.description,
    frequency: habit.frequency,
    target_days: habit.targetDays,
    target_count: habit.targetCount,
    energy_impact: habit.energyImpact,
    energy_type: habit.energyType,
    streak: habit.streak,
    best_streak: habit.bestStreak,
    total_completions: habit.totalCompletions,
    xp_reward: habit.xpReward,
  }
}

function dbToSkill(db: any): Skill {
  return {
    id: db.id,
    userId: db.user_id,
    name: db.name,
    description: db.description,
    icon: db.icon,
    color: db.color,
    category: db.category,
    currentLevel: db.current_level,
    currentXp: db.current_xp,
    xpNeeded: db.xp_needed,
    totalXpEarned: db.total_xp_earned,
    lastActivityDate: db.last_activity_date,
    isDecaying: db.is_decaying,
    activities: [],
    certificates: [],
    decayLogs: [],
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  }
}

function skillToDb(skill: Partial<Skill>, userId: string): any {
  return {
    user_id: userId,
    name: skill.name,
    description: skill.description,
    icon: skill.icon,
    color: skill.color,
    category: skill.category,
    current_level: skill.currentLevel,
    current_xp: skill.currentXp,
    xp_needed: skill.xpNeeded,
    total_xp_earned: skill.totalXpEarned,
    last_activity_date: skill.lastActivityDate,
    is_decaying: skill.isDecaying,
  }
}

function dbToStats(db: any): UserStats {
  return {
    level: db.level,
    xp: db.xp,
    xpToNext: db.xp_to_next,
    coins: db.coins,
    totalCoinsEarned: db.total_coins_earned,
    totalCoinsSpent: db.total_coins_spent,
    currentStreak: db.current_streak,
    longestStreak: db.longest_streak,
    lastActiveDate: db.last_active_date,
    totalTasksCompleted: db.total_tasks_completed,
    totalGoalsAchieved: db.total_goals_achieved,
    totalProjectsCompleted: db.total_projects_completed,
    totalHabitCompletions: db.total_habit_completions,
    totalDeepWorkHours: db.total_deep_work_hours,
    totalFocusSessions: db.total_focus_sessions,
    avgDailyTasks: db.avg_daily_tasks,
  }
}

function statsToDb(stats: Partial<UserStats>): any {
  return {
    level: stats.level,
    xp: stats.xp,
    xp_to_next: stats.xpToNext,
    coins: stats.coins,
    total_coins_earned: stats.totalCoinsEarned,
    total_coins_spent: stats.totalCoinsSpent,
    current_streak: stats.currentStreak,
    longest_streak: stats.longestStreak,
    last_active_date: stats.lastActiveDate,
    total_tasks_completed: stats.totalTasksCompleted,
    total_goals_achieved: stats.totalGoalsAchieved,
    total_projects_completed: stats.totalProjectsCompleted,
    total_habit_completions: stats.totalHabitCompletions,
    total_deep_work_hours: stats.totalDeepWorkHours,
    total_focus_sessions: stats.totalFocusSessions,
    avg_daily_tasks: stats.avgDailyTasks,
  }
}
