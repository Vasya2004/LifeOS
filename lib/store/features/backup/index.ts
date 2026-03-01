// ============================================
// BACKUP & EXPORT FEATURE MODULE
// ============================================

import type { AppData } from "@/lib/types"
import { getStore, setStore, clearStore, KEYS, now } from "@/lib/store/core"
import { defaultIdentity, defaultStats, defaultSettings } from "@/lib/store/defaults"

// ============================================
// EXPORT
// ============================================

export function exportAllData(): AppData {
  return {
    version: "1.0.0",
    exportDate: now(),
    
    // Foundation
    identity: getStore(KEYS.identity, defaultIdentity),
    values: getStore(KEYS.values, []),
    areas: getStore(KEYS.areas, []),
    roles: getStore(KEYS.roles, []),
    
    // Operational
    goals: getStore(KEYS.goals, []),
    projects: getStore(KEYS.projects, []),
    tasks: getStore(KEYS.tasks, []),
    habits: getStore(KEYS.habits, []),
    challenges: getStore(KEYS.challenges, []),
    
    // Skills
    skills: getStore(KEYS.skills, []),
    
    // Resources
    energyHistory: getStore(KEYS.energyHistory, []),
    timeBlocks: getStore(KEYS.timeBlocks, []),
    
    // Reflection
    dailyReviews: getStore(KEYS.dailyReviews, []),
    weeklyReviews: getStore(KEYS.weeklyReviews, []),
    journal: getStore(KEYS.journal, []),
    
    // Gamification
    stats: getStore(KEYS.stats, defaultStats),
    rewards: getStore(KEYS.rewards, []),
    wishes: getStore(KEYS.wishes, []),
    achievements: getStore(KEYS.achievements, []),
    
    // Finance
    accounts: getStore(KEYS.accounts, []),
    transactions: getStore(KEYS.transactions, []),
    financialGoals: getStore(KEYS.financialGoals, []),
    budgets: getStore(KEYS.budgets, []),
    
    // Health
    bodyZones: getStore(KEYS.bodyZones, []),
    medicalDocuments: getStore(KEYS.medicalDocuments, []),
    healthMetrics: getStore(KEYS.healthMetrics, []),
    healthProfile: getStore(KEYS.healthProfile, {
      allergies: [],
      chronicConditions: [],
      medications: [],
    }),
    
    // Settings
    settings: getStore(KEYS.settings, defaultSettings),
  }
}

export function downloadBackup(filename?: string) {
  const data = exportAllData()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement("a")
  link.href = url
  link.download = filename || `lifeos-backup-${new Date().toISOString().split("T")[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}

// ============================================
// IMPORT
// ============================================

export interface ImportResult {
  success: boolean
  error?: string
}

export function importAllData(data: Partial<AppData>): ImportResult {
  try {
    // Foundation
    if (data.identity) setStore(KEYS.identity, data.identity)
    if (data.values) setStore(KEYS.values, data.values)
    if (data.areas) setStore(KEYS.areas, data.areas)
    if (data.roles) setStore(KEYS.roles, data.roles)
    
    // Operational
    if (data.goals) setStore(KEYS.goals, data.goals)
    if (data.projects) setStore(KEYS.projects, data.projects)
    if (data.tasks) setStore(KEYS.tasks, data.tasks)
    if (data.habits) setStore(KEYS.habits, data.habits)
    if (data.challenges) setStore(KEYS.challenges, data.challenges)
    
    // Skills
    if (data.skills) setStore(KEYS.skills, data.skills)
    
    // Resources
    if (data.energyHistory) setStore(KEYS.energyHistory, data.energyHistory)
    if (data.timeBlocks) setStore(KEYS.timeBlocks, data.timeBlocks)
    
    // Reflection
    if (data.dailyReviews) setStore(KEYS.dailyReviews, data.dailyReviews)
    if (data.weeklyReviews) setStore(KEYS.weeklyReviews, data.weeklyReviews)
    if (data.journal) setStore(KEYS.journal, data.journal)
    
    // Gamification
    if (data.stats) setStore(KEYS.stats, data.stats)
    if (data.rewards) setStore(KEYS.rewards, data.rewards)
    if (data.wishes) setStore(KEYS.wishes, data.wishes)
    if (data.achievements) setStore(KEYS.achievements, data.achievements)
    
    // Finance
    if (data.accounts) setStore(KEYS.accounts, data.accounts)
    if (data.transactions) setStore(KEYS.transactions, data.transactions)
    if (data.financialGoals) setStore(KEYS.financialGoals, data.financialGoals)
    if (data.budgets) setStore(KEYS.budgets, data.budgets)
    
    // Health
    if (data.bodyZones) setStore(KEYS.bodyZones, data.bodyZones)
    if (data.medicalDocuments) setStore(KEYS.medicalDocuments, data.medicalDocuments)
    if (data.healthMetrics) setStore(KEYS.healthMetrics, data.healthMetrics)
    if (data.healthProfile) setStore(KEYS.healthProfile, data.healthProfile)
    
    // Settings
    if (data.settings) setStore(KEYS.settings, data.settings)
    
    return { success: true }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown import error" 
    }
  }
}

export async function loadBackupFromFile(file: File): Promise<ImportResult> {
  try {
    const text = await file.text()
    const data = JSON.parse(text) as Partial<AppData>
    return importAllData(data)
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to parse backup file" 
    }
  }
}

// ============================================
// CLEAR
// ============================================

export function clearAllData() {
  clearStore()
  // Reload to reset to defaults
  if (typeof window !== "undefined") {
    window.location.reload()
  }
}
