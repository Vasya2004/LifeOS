// ============================================
// STORAGE KEYS - Константы ключей хранилища
// ============================================

/**
 * Ключи для хранения данных в localStorage
 */
export const KEYS = {
  // Foundation
  identity: "identity",
  values: "values",
  areas: "areas",
  roles: "roles",
  
  // Operational
  goals: "goals",
  projects: "projects",
  tasks: "tasks",
  habits: "habits",
  challenges: "challenges",
  
  // Skills
  skills: "skills",
  skillActivities: "skillActivities",
  skillCertificates: "skillCertificates",
  skillDecayLogs: "skillDecayLogs",
  
  // Resources
  energyHistory: "energyHistory",
  timeBlocks: "timeBlocks",
  
  // Reflection
  dailyReviews: "dailyReviews",
  weeklyReviews: "weeklyReviews",
  journal: "journal",
  
  // Gamification
  stats: "stats",
  rewards: "rewards",
  wishes: "wishes",
  achievements: "achievements",
  
  // Finance
  accounts: "accounts",
  transactions: "transactions",
  financialGoals: "financialGoals",
  budgets: "budgets",
  
  // Health
  bodyZones: "bodyZones",
  medicalDocuments: "medicalDocuments",
  healthMetrics: "healthMetrics",
  healthProfile: "healthProfile",
  
  // Profile
  principles: "principles",
  characterConfig: "character_config",

  // System
  settings: "settings",
  onboarding: "onboarding",
} as const

/** Тип ключей хранилища */
export type StoreKey = keyof typeof KEYS

/**
 * Проверить является ли строка валидным ключом
 */
export function isValidKey(key: string): key is StoreKey {
  return key in KEYS
}
