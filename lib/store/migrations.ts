// ============================================
// DATA MIGRATIONS - Handle schema changes
// ============================================

import { getStore, setStore } from "./utils/storage"
import { KEYS } from "./keys"

// Current app data version
export const CURRENT_DATA_VERSION = "2.0.0"

const VERSION_KEY = "lifeos_data_version"

// ============================================
// Migration Types
// ============================================

export interface Migration {
  version: string
  description: string
  migrate: (data: any) => any
}

// ============================================
// Migration Registry
// ============================================

const migrations: Migration[] = [
  {
    version: "2.0.0",
    description: "Add skill decay tracking",
    migrate: (data: any) => {
      if (data.skills && Array.isArray(data.skills)) {
        data.skills.forEach((skill: any) => {
          skill.isDecaying = skill.isDecaying ?? false
          skill.activities = skill.activities || []
          skill.certificates = skill.certificates || []
          skill.decayLogs = skill.decayLogs || []
        })
      }
      return data
    }
  },
  {
    version: "1.9.0",
    description: "Add health module fields",
    migrate: (data: any) => {
      if (data.bodyZones && Array.isArray(data.bodyZones)) {
        data.bodyZones.forEach((zone: any) => {
          zone.lastCheckup = zone.lastCheckup || null
        })
      }
      if (!data.healthProfile) {
        data.healthProfile = {
          allergies: [],
          chronicConditions: [],
          medications: [],
        }
      }
      return data
    }
  },
  {
    version: "1.8.0",
    description: "Add finance categories",
    migrate: (data: any) => {
      if (data.transactions && Array.isArray(data.transactions)) {
        data.transactions.forEach((tx: any) => {
          if (!tx.category) {
            tx.category = tx.type === 'income' ? 'other_income' : 'other_expense'
          }
        })
      }
      return data
    }
  },
  {
    version: "1.7.0",
    description: "Add task energy fields",
    migrate: (data: any) => {
      if (data.tasks && Array.isArray(data.tasks)) {
        data.tasks.forEach((task: any) => {
          task.energyCost = task.energyCost || 'medium'
          task.energyType = task.energyType || 'mental'
        })
      }
      return data
    }
  },
  {
    version: "1.6.0",
    description: "Add goal milestones",
    migrate: (data: any) => {
      if (data.goals && Array.isArray(data.goals)) {
        data.goals.forEach((goal: any) => {
          goal.milestones = goal.milestones || []
        })
      }
      return data
    }
  },
  {
    version: "1.5.0",
    description: "Add habit entries array",
    migrate: (data: any) => {
      if (data.habits && Array.isArray(data.habits)) {
        data.habits.forEach((habit: any) => {
          habit.entries = habit.entries || []
          habit.bestStreak = habit.bestStreak || 0
          habit.totalCompletions = habit.totalCompletions || 0
        })
      }
      return data
    }
  },
  {
    version: "1.4.0",
    description: "Add user stats fields",
    migrate: (data: any) => {
      if (data.stats) {
        data.stats.totalCoinsEarned = data.stats.totalCoinsEarned || 0
        data.stats.totalCoinsSpent = data.stats.totalCoinsSpent || 0
        data.stats.totalProjectsCompleted = data.stats.totalProjectsCompleted || 0
        data.stats.totalHabitCompletions = data.stats.totalHabitCompletions || 0
        data.stats.totalDeepWorkHours = data.stats.totalDeepWorkHours || 0
        data.stats.totalFocusSessions = data.stats.totalFocusSessions || 0
        data.stats.avgDailyTasks = data.stats.avgDailyTasks || 0
      }
      return data
    }
  },
  {
    version: "1.3.0",
    description: "Add identity timestamps",
    migrate: (data: any) => {
      if (data.identity) {
        data.identity.createdAt = data.identity.createdAt || new Date().toISOString()
        data.identity.updatedAt = data.identity.updatedAt || new Date().toISOString()
      }
      return data
    }
  },
  {
    version: "1.2.0",
    description: "Add life area vision",
    migrate: (data: any) => {
      if (data.areas && Array.isArray(data.areas)) {
        data.areas.forEach((area: any) => {
          area.vision = area.vision || ''
          area.targetLevel = area.targetLevel || 10
        })
      }
      return data
    }
  },
  {
    version: "1.1.0",
    description: "Add core value importance",
    migrate: (data: any) => {
      if (data.values && Array.isArray(data.values)) {
        data.values.forEach((value: any) => {
          value.importance = value.importance || 3
        })
      }
      return data
    }
  },
  {
    version: "1.0.0",
    description: "Initial schema",
    migrate: (data: any) => {
      // Ensure all required root keys exist
      const requiredKeys = [
        'identity', 'values', 'areas', 'roles',
        'goals', 'projects', 'tasks', 'habits', 'challenges',
        'skills', 'energyHistory', 'timeBlocks',
        'dailyReviews', 'weeklyReviews', 'journal',
        'stats', 'rewards', 'wishes', 'achievements',
        'accounts', 'transactions', 'financialGoals', 'budgets',
        'bodyZones', 'medicalDocuments', 'healthMetrics', 'healthProfile',
        'settings'
      ]
      
      requiredKeys.forEach(key => {
        if (!(key in data)) {
          data[key] = key === 'stats' ? getDefaultStats() : 
                       key.endsWith('s') ? [] : {}
        }
      })
      
      return data
    }
  }
]

function getDefaultStats() {
  return {
    level: 1,
    xp: 0,
    xpToNext: 1000,
    coins: 0,
    totalCoinsEarned: 0,
    totalCoinsSpent: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: new Date().toISOString().split("T")[0],
    totalTasksCompleted: 0,
    totalGoalsAchieved: 0,
    totalProjectsCompleted: 0,
    totalHabitCompletions: 0,
    totalDeepWorkHours: 0,
    totalFocusSessions: 0,
    avgDailyTasks: 0,
  }
}

// ============================================
// Migration Engine
// ============================================

export function getCurrentVersion(): string {
  return getStore<string>(VERSION_KEY, "1.0.0")
}

export function setCurrentVersion(version: string): void {
  setStore(VERSION_KEY, version)
}

export function needsMigration(): boolean {
  const currentVersion = getCurrentVersion()
  return compareVersions(currentVersion, CURRENT_DATA_VERSION) < 0
}

export function runMigrations(): { success: boolean; migratedFrom: string; migratedTo: string; errors: string[] } {
  const currentVersion = getCurrentVersion()
  const errors: string[] = []
  
  if (!needsMigration()) {
    return { success: true, migratedFrom: currentVersion, migratedTo: currentVersion, errors }
  }
  
  console.log(`[Migration] Starting migration from ${currentVersion} to ${CURRENT_DATA_VERSION}`)
  
  // Get all data
  const allData: Record<string, any> = {}
  
  Object.values(KEYS).forEach(key => {
    if (typeof key !== 'string') return
    try {
      allData[key] = getStore<any>(key, null)
    } catch (e) {
      errors.push(`Failed to read ${key}: ${e}`)
    }
  })
  
  // Find migrations to apply (sorted by version)
  const applicableMigrations = migrations
    .filter(m => compareVersions(m.version, currentVersion) > 0)
    .sort((a, b) => compareVersions(a.version, b.version))
  
  let migratedData = { ...allData }
  
  for (const migration of applicableMigrations) {
    try {
      console.log(`[Migration] Running ${migration.version}: ${migration.description}`)
      migratedData = migration.migrate(migratedData)
    } catch (error) {
      const errorMsg = `Migration ${migration.version} failed: ${error}`
      console.error(`[Migration] ${errorMsg}`)
      errors.push(errorMsg)
      
      // Continue with other migrations, don't stop
    }
  }
  
  // Save migrated data
  Object.entries(migratedData).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      try {
        setStore(key, value)
      } catch (e) {
        errors.push(`Failed to save ${key}: ${e}`)
      }
    }
  })
  
  // Update version
  setCurrentVersion(CURRENT_DATA_VERSION)
  
  console.log(`[Migration] Completed migration to ${CURRENT_DATA_VERSION}`)
  
  return {
    success: errors.length === 0,
    migratedFrom: currentVersion,
    migratedTo: CURRENT_DATA_VERSION,
    errors
  }
}

// ============================================
// Version Comparison
// ============================================

function compareVersions(a: string, b: string): number {
  const partsA = a.split('.').map(Number)
  const partsB = b.split('.').map(Number)
  
  for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
    const partA = partsA[i] || 0
    const partB = partsB[i] || 0
    
    if (partA < partB) return -1
    if (partA > partB) return 1
  }
  
  return 0
}

// ============================================
// Data Validation
// ============================================

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

export function validateData(data: any): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  
  // Check required structure
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Data is not an object'], warnings: [] }
  }
  
  // Validate identity
  if (!data.identity) {
    errors.push('Missing identity')
  } else {
    if (!data.identity.id) errors.push('Identity missing id')
    if (!data.identity.name) warnings.push('Identity missing name')
  }
  
  // Validate stats
  if (!data.stats) {
    errors.push('Missing stats')
  } else {
    if (typeof data.stats.level !== 'number') errors.push('Stats.level is not a number')
    if (typeof data.stats.xp !== 'number') errors.push('Stats.xp is not a number')
  }
  
  // Validate arrays
  const arrayFields = ['values', 'areas', 'roles', 'goals', 'tasks', 'habits', 'skills']
  arrayFields.forEach(field => {
    if (data[field] && !Array.isArray(data[field])) {
      errors.push(`${field} is not an array`)
    }
  })
  
  // Check for duplicate IDs
  const allIds = new Map<string, string[]>()
  
  arrayFields.forEach(field => {
    if (Array.isArray(data[field])) {
      data[field].forEach((item: any, index: number) => {
        if (item?.id) {
          if (allIds.has(item.id)) {
            allIds.get(item.id)!.push(`${field}[${index}]`)
          } else {
            allIds.set(item.id, [`${field}[${index}]`])
          }
        }
      })
    }
  })
  
  allIds.forEach((locations, id) => {
    if (locations.length > 1) {
      errors.push(`Duplicate ID "${id}" found in: ${locations.join(', ')}`)
    }
  })
  
  // Check for corrupted dates
  const dateFields = ['createdAt', 'updatedAt', 'completedAt', 'scheduledDate']
  arrayFields.forEach(field => {
    if (Array.isArray(data[field])) {
      data[field].forEach((item: any, index: number) => {
        if (item) {
          dateFields.forEach(dateField => {
            if (item[dateField] && isNaN(Date.parse(item[dateField]))) {
              warnings.push(`${field}[${index}].${dateField} has invalid date: ${item[dateField]}`)
            }
          })
        }
      })
    }
  })
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  }
}

// ============================================
// Safe Import with Validation
// ============================================

export function safeImportData(importedData: any): { success: boolean; result?: any; errors: string[] } {
  const errors: string[] = []
  
  try {
    // Validate structure
    const validation = validateData(importedData)
    
    if (!validation.valid) {
      return { 
        success: false, 
        errors: [...validation.errors, ...validation.warnings] 
      }
    }
    
    // Run migrations on imported data
    let migratedData = { ...importedData }
    
    const applicableMigrations = migrations
      .filter(m => !importedData.version || compareVersions(m.version, importedData.version) > 0)
      .sort((a, b) => compareVersions(a.version, b.version))
    
    for (const migration of applicableMigrations) {
      try {
        migratedData = migration.migrate(migratedData)
      } catch (error) {
        errors.push(`Migration ${migration.version} failed: ${error}`)
      }
    }
    
    // Set current version
    migratedData.version = CURRENT_DATA_VERSION
    migratedData.exportDate = new Date().toISOString()
    
    return {
      success: errors.length === 0,
      result: migratedData,
      errors
    }
  } catch (error) {
    return {
      success: false,
      errors: [`Import failed: ${error}`]
    }
  }
}

// ============================================
// Migration UI State
// ============================================

export interface MigrationState {
  isMigrating: boolean
  progress: number
  currentStep: string
  error: string | null
}

export function createMigrationState(): MigrationState {
  return {
    isMigrating: false,
    progress: 0,
    currentStep: '',
    error: null
  }
}
