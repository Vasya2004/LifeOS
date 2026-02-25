// ============================================
// LEGACY API - Backward compatibility with old store.ts
// ============================================

// This file provides backward compatibility for existing code.
// New code should use feature modules directly from './index'

import { statsModule } from "./modules/stats"
import { getStore, setStore } from "./utils/storage"
import { KEYS } from "./keys"
import { mutate } from "swr"

// Root-level store functions
import {
  getIdentity as _getIdentity,
  updateIdentity as _updateIdentity,
  getGoals as _getGoals,
  addGoal as _addGoal,
  updateGoal as _updateGoal,
  deleteGoal as _deleteGoal,
  getTasks as _getTasks,
  addTask as _addTask,
  updateTask as _updateTask,
  deleteTask as _deleteTask,
  completeTask as _completeTask,
  getTodaysTasks as _getTodaysTasks,
  getHabits as _getHabits,
  addHabit as _addHabit,
  updateHabit as _updateHabit,
  deleteHabit as _deleteHabit,
  toggleHabitEntry as _toggleHabitEntry,
  getSkills as _getSkills,
  getSkillById as _getSkillById,
  addSkill as _addSkill,
  updateSkill as _updateSkill,
  deleteSkill as _deleteSkill,
  addSkillActivity as _addSkillActivity,
  checkSkillDecay as _checkSkillDecay,
  getSkillStats as _getSkillStats,
  getTopSkills as _getTopSkills,
  getRecentlyActiveSkills as _getRecentlyActiveSkills,
  getSkillsByCategory as _getSkillsByCategory,
  getAccounts as _getAccounts,
  addAccount as _addAccount,
  updateAccount as _updateAccount,
  deleteAccount as _deleteAccount,
  getTransactions as _getTransactions,
  addTransaction as _addTransaction,
  deleteTransaction as _deleteTransaction,
  getFinancialGoals as _getFinancialGoals,
  addFinancialGoal as _addFinancialGoal,
  updateFinancialGoal as _updateFinancialGoal,
  deleteFinancialGoal as _deleteFinancialGoal,
  contributeToGoal as _contributeToGoal,
  getBudgets as _getBudgets,
  getBodyZones as _getBodyZones,
  updateBodyZone as _updateBodyZone,
  getBodyZonesStats as _getBodyZonesStats,
  getMedicalDocuments as _getMedicalDocuments,
  addMedicalDocument as _addMedicalDocument,
  deleteMedicalDocument as _deleteMedicalDocument,
  getHealthMetrics as _getHealthMetrics,
  addHealthMetric as _addHealthMetric,
  deleteHealthMetric as _deleteHealthMetric,
  getHealthMetricsByType as _getHealthMetricsByType,
  getHealthMetricsByDate as _getHealthMetricsByDate,
  getHealthProfile as _getHealthProfile,
  updateHealthProfile as _updateHealthProfile,
} from "./index"

import type {
  Identity, CoreValue, LifeArea, Role,
  Goal, Project, Task, Habit, Challenge,
  DailyReview, WeeklyReview, JournalEntry,
  UserStats, Wish, Achievement, AppSettings,
  AppData, EnergyState, TimeBlock
} from "@/lib/types"

// Cloud sync - mark changes
function markChanges() {
  if (typeof window !== "undefined") {
    import("@/lib/sync/cloud-sync").then(({ markPendingChanges }) => {
      markPendingChanges()
    })
  }
}

// ============================================
// Legacy exports for backward compatibility
// ============================================

// Identity & Foundation
export const getIdentity = _getIdentity
export const updateIdentity = _updateIdentity

export const getValues = () => getStore<CoreValue[]>(KEYS.values, [])
export const addValue = (value: Omit<CoreValue, "id">) => {
  const values = getValues()
  const newValue = { ...value, id: crypto.randomUUID() }
  setStore(KEYS.values, [...values, newValue])
  mutate(KEYS.values)
  markChanges()
  return newValue
}
export const updateValue = (id: string, updates: Partial<CoreValue>) => {
  const values = getValues()
  setStore(KEYS.values, values.map(v => v.id === id ? { ...v, ...updates } : v))
  mutate(KEYS.values)
  markChanges()
}
export const deleteValue = (id: string) => {
  const values = getValues()
  setStore(KEYS.values, values.filter(v => v.id !== id))
  markChanges()
  mutate(KEYS.values)
}

export const getAreas = () => getStore<LifeArea[]>(KEYS.areas, [])
export const addArea = (area: Omit<LifeArea, "id">) => {
  const areas = getAreas()
  const newArea = { ...area, id: crypto.randomUUID() }
  setStore(KEYS.areas, [...areas, newArea])
  mutate(KEYS.areas)
  return newArea
}
export const updateArea = (id: string, updates: Partial<LifeArea>) => {
  const areas = getAreas()
  setStore(KEYS.areas, areas.map(a => a.id === id ? { ...a, ...updates } : a))
  mutate(KEYS.areas)
}

export const getRoles = () => getStore<Role[]>(KEYS.roles, [])
export const addRole = (role: Omit<Role, "id">) => {
  const roles = getRoles()
  const newRole = { ...role, id: crypto.randomUUID() }
  setStore(KEYS.roles, [...roles, newRole])
  mutate(KEYS.roles)
  return newRole
}

// Goals
export const getGoals = _getGoals
export const addGoal = _addGoal
export const updateGoal = _updateGoal
export const deleteGoal = _deleteGoal

// Projects
export const getProjects = () => getStore<Project[]>(KEYS.projects, [])
export const addProject = (project: Omit<Project, "id" | "actualHours">) => {
  const projects = getProjects()
  const newProject = { ...project, id: crypto.randomUUID(), actualHours: 0 }
  setStore(KEYS.projects, [...projects, newProject])
  mutate(KEYS.projects)
  return newProject
}
export const completeProject = (id: string) => {
  const projects = getProjects()
  setStore(KEYS.projects, projects.map(p =>
    p.id === id ? { ...p, status: "completed" as const } : p
  ))
  mutate(KEYS.projects)
}

// Tasks
export const getTasks = _getTasks
export const addTask = _addTask
export const updateTask = _updateTask
export const deleteTask = _deleteTask
export const completeTask = _completeTask
export const getTodaysTasks = _getTodaysTasks

// Habits
export const getHabits = _getHabits
export const addHabit = _addHabit
export const updateHabit = _updateHabit
export const deleteHabit = _deleteHabit
export const toggleHabitEntry = _toggleHabitEntry

// Stats
export const getStats = statsModule.get.bind(statsModule)
export const updateStats = statsModule.update.bind(statsModule)
export const addXp = statsModule.addXp.bind(statsModule)
export const addCoins = statsModule.addCoins.bind(statsModule)
export const getLevelName = statsModule.getLevelName.bind(statsModule)

// Reflection
export const getDailyReview = (date: string): DailyReview | undefined => {
  const reviews = getStore<DailyReview[]>(KEYS.dailyReviews, [])
  return reviews.find(r => r.date === date)
}
export const saveDailyReview = (review: DailyReview) => {
  const reviews = getStore<DailyReview[]>(KEYS.dailyReviews, [])
  const existingIndex = reviews.findIndex(r => r.date === review.date)
  if (existingIndex >= 0) {
    reviews[existingIndex] = review
  } else {
    reviews.push(review)
  }
  setStore(KEYS.dailyReviews, reviews)
  mutate(KEYS.dailyReviews)
}

export const getJournal = () => getStore<JournalEntry[]>(KEYS.journal, [])
export const addJournalEntry = (entry: Omit<JournalEntry, "id" | "timestamp">) => {
  const entries = getJournal()
  const newEntry = { ...entry, id: crypto.randomUUID(), timestamp: new Date().toISOString() }
  setStore(KEYS.journal, [...entries, newEntry])
  mutate(KEYS.journal)
  return newEntry
}

// Wishes
export const getWishes = () => getStore<Wish[]>(KEYS.wishes, [])
export const addWish = (wish: Omit<Wish, "id" | "progress" | "status">) => {
  const wishes = getWishes()
  const newWish = { ...wish, id: crypto.randomUUID(), progress: 0, status: "saving" as const }
  setStore(KEYS.wishes, [...wishes, newWish])
  mutate(KEYS.wishes)
  return newWish
}
export const contributeToWish = (wishId: string, amount: number) => {
  const wishes = getWishes()
  const wish = wishes.find(w => w.id === wishId)
  if (!wish) return { success: false, error: "Wish not found" }

  const stats = getStats()
  if (stats.coins < amount) return { success: false, error: "Not enough coins" }

  const newProgress = Math.min(100, wish.progress + (amount / wish.cost * 100))
  const newStatus = newProgress >= 100 ? "ready" : "saving"

  setStore(KEYS.wishes, wishes.map(w =>
    w.id === wishId ? { ...w, progress: newProgress, status: newStatus } : w
  ))
  mutate(KEYS.wishes)

  updateStats({ coins: stats.coins - amount })
  return { success: true, newProgress }
}

// Finance (legacy exports)
export const getAccounts = _getAccounts
export const addAccount = _addAccount
export const updateAccount = _updateAccount
export const deleteAccount = _deleteAccount

export const getTransactions = _getTransactions
export const addTransaction = _addTransaction
export const deleteTransaction = _deleteTransaction

export const getFinancialGoals = _getFinancialGoals
export const addFinancialGoal = _addFinancialGoal
export const updateFinancialGoal = _updateFinancialGoal
export const deleteFinancialGoal = _deleteFinancialGoal
export const contributeToGoal = _contributeToGoal

export const getBudgets = _getBudgets

// Health (legacy exports)
export const getBodyZones = _getBodyZones
export const updateBodyZone = _updateBodyZone
export const getBodyZonesStats = _getBodyZonesStats

export const getMedicalDocuments = _getMedicalDocuments
export const addMedicalDocument = _addMedicalDocument
export const deleteMedicalDocument = _deleteMedicalDocument

export const getHealthMetrics = _getHealthMetrics
export const addHealthMetric = _addHealthMetric
export const deleteHealthMetric = _deleteHealthMetric
export const getHealthMetricsByType = _getHealthMetricsByType
export const getHealthMetricsByDate = _getHealthMetricsByDate

export const getHealthProfile = _getHealthProfile
export const updateHealthProfile = _updateHealthProfile

// Skills (legacy exports)
export const getSkills = _getSkills
export const getSkillById = _getSkillById
export const addSkill = _addSkill
export const updateSkill = _updateSkill
export const deleteSkill = _deleteSkill
export const addSkillActivity = _addSkillActivity
export const checkSkillDecay = _checkSkillDecay
export const getSkillStats = _getSkillStats
export const getTopSkills = _getTopSkills
export const getRecentlyActiveSkills = _getRecentlyActiveSkills
export const getSkillsByCategory = _getSkillsByCategory
export const getDecayLogs = () => {
  const skills = _getSkills()
  return skills.flatMap((s: any) => s.decayLogs || [])
}

// Export/Import
export function exportAllData(): AppData {
  return {
    version: "2.3",
    exportDate: new Date().toISOString(),
    identity: getIdentity(),
    values: getValues(),
    areas: getAreas(),
    roles: getRoles(),
    goals: getGoals(),
    projects: getProjects(),
    tasks: getTasks(),
    habits: getHabits(),
    challenges: [],
    skills: getSkills(),
    energyHistory: [],
    timeBlocks: [],
    dailyReviews: getStore(KEYS.dailyReviews, []),
    weeklyReviews: [],
    journal: getJournal(),
    stats: getStats(),
    rewards: [],
    wishes: getWishes(),
    achievements: [],
    accounts: getAccounts(),
    transactions: getTransactions(),
    financialGoals: getFinancialGoals(),
    budgets: getBudgets(),
    bodyZones: getBodyZones(),
    medicalDocuments: getMedicalDocuments(),
    healthMetrics: getHealthMetrics(),
    healthProfile: getHealthProfile(),
    settings: getStore(KEYS.settings, { theme: 'system', soundEnabled: true, notificationsEnabled: true, weekStartsOn: 1, defaultWorkingHours: { start: '09:00', end: '18:00' } }),
  }
}

export function importAllData(data: AppData): { success: boolean; error?: string } {
  try {
    if (data.identity) setStore(KEYS.identity, data.identity)
    if (data.values) setStore(KEYS.values, data.values)
    if (data.areas) setStore(KEYS.areas, data.areas)
    if (data.roles) setStore(KEYS.roles, data.roles)
    if (data.goals) setStore(KEYS.goals, data.goals)
    if (data.projects) setStore(KEYS.projects, data.projects)
    if (data.tasks) setStore(KEYS.tasks, data.tasks)
    if (data.habits) setStore(KEYS.habits, data.habits)
    if (data.skills) setStore(KEYS.skills, data.skills)
    if (data.stats) setStore(KEYS.stats, data.stats)
    if (data.wishes) setStore(KEYS.wishes, data.wishes)
    if (data.journal) setStore(KEYS.journal, data.journal)
    if (data.dailyReviews) setStore(KEYS.dailyReviews, data.dailyReviews)
    if (data.accounts) setStore(KEYS.accounts, data.accounts)
    if (data.transactions) setStore(KEYS.transactions, data.transactions)
    if (data.financialGoals) setStore(KEYS.financialGoals, data.financialGoals)
    if (data.budgets) setStore(KEYS.budgets, data.budgets)
    if (data.bodyZones) setStore(KEYS.bodyZones, data.bodyZones)
    if (data.medicalDocuments) setStore(KEYS.medicalDocuments, data.medicalDocuments)
    if (data.healthMetrics) setStore(KEYS.healthMetrics, data.healthMetrics)
    if (data.healthProfile) setStore(KEYS.healthProfile, data.healthProfile)

    // Mutate all keys
    Object.values(KEYS).forEach(key => mutate(key))

    return { success: true }
  } catch (e) {
    return { success: false, error: "Failed to import data" }
  }
}

export function clearAllData() {
  Object.values(KEYS).forEach(key => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(`lifeos_${key}`)
    }
  })
  Object.values(KEYS).forEach(key => mutate(key))
}
