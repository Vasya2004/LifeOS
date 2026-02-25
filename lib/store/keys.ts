// ============================================
// SWR KEYS
// ============================================

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
  skillActivityReasons: {
    skill_created: "skill_created",
    quest_completed: "quest_completed",
    skill_level_up: "skill_level_up", // This is a placeholder, as `skill_level_up_${number}` is a type pattern, not a fixed key.
  },
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

  // Settings
  settings: "settings",

  // Sync
  syncQueue: "syncQueue",
  lastSync: "lastSync",

  // Storage
  storageFolders: "storageFolders",
  learningSources: "learningSources",
  insights: "insights",
  storageContacts: "storageContacts",
  storageResources: "storageResources",
  quests: "quests",
} as const

export type StoreKey = Extract<typeof KEYS[keyof typeof KEYS], string>
