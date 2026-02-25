// ============================================
// SYSTEM TYPES - App Configuration & Data
// ============================================

import type { Identity, CoreValue, LifeArea, Role } from './foundation'
import type { Goal, Project, Task, Habit, Challenge } from './operational'
import type { EnergyState, TimeBlock } from './resources'
import type { DailyReview, WeeklyReview, JournalEntry } from './reflection'
import type { UserStats, Reward, Wish, Achievement } from './gamification'
import type { Account, Transaction, FinancialGoal, Budget } from './finance'
import type { BodyZone, MedicalDocument, HealthMetricEntry, HealthProfile } from './health'
import type { Skill } from './skills'

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
