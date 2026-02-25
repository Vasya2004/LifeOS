// ============================================
// BACKUP - Export/Import/Clear Data
// ============================================

import type { AppData } from "@/lib/types"
import { getStore, setStore, KEYS, mutateKey } from "./core"
import { cacheClear } from "./idb"
import { defaultSettings } from "./defaults"

// Import all getters
import { getIdentity, getValues, getAreas, getRoles } from "./identity"
import { getGoals, getProjects } from "./goals"
import { getTasks } from "./tasks"
import { getHabits } from "./habits"
import { getStats } from "./gamification"
import { getWishes } from "./wishes"
import { getJournal, getDailyReviews } from "./reflection"
import { getAccounts, getTransactions, getFinancialGoals, getBudgets } from "./finance"
import { getBodyZones, getMedicalDocuments, getHealthMetrics, getHealthProfile } from "./health"
import { getSkills } from "./skills"

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
    dailyReviews: getDailyReviews(),
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
    settings: getStore(KEYS.settings, defaultSettings),
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
    if (data.settings) setStore(KEYS.settings, data.settings)
    if (data.accounts) setStore(KEYS.accounts, data.accounts)
    if (data.transactions) setStore(KEYS.transactions, data.transactions)
    if (data.financialGoals) setStore(KEYS.financialGoals, data.financialGoals)
    if (data.budgets) setStore(KEYS.budgets, data.budgets)
    if (data.bodyZones) setStore(KEYS.bodyZones, data.bodyZones)
    if (data.medicalDocuments) setStore(KEYS.medicalDocuments, data.medicalDocuments)
    if (data.healthMetrics) setStore(KEYS.healthMetrics, data.healthMetrics)
    if (data.healthProfile) setStore(KEYS.healthProfile, data.healthProfile)
    
    // Mutate all keys
    Object.values(KEYS).forEach(mutateKey)
    
    return { success: true }
  } catch (e) {
    return { success: false, error: "Failed to import data" }
  }
}

export function clearAllData() {
  if (typeof window === "undefined") return
  cacheClear()
  Object.values(KEYS).forEach(mutateKey)
}

export function downloadBackup(): void {
  const data = exportAllData()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `lifeos-backup-${new Date().toISOString().split("T")[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export async function loadBackupFromFile(file: File): Promise<{ success: boolean; error?: string }> {
  try {
    const text = await file.text()
    const data = JSON.parse(text) as AppData
    
    // Version check
    if (!data.version) {
      return { success: false, error: "Invalid backup file format" }
    }
    
    return importAllData(data)
  } catch (e) {
    return { success: false, error: "Failed to parse backup file" }
  }
}
