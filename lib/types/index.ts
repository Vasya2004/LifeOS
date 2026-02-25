// ============================================
// LIFE OS - Type System Index
// ============================================

// Foundation
export type {
  Identity,
  CoreValue,
  LifeArea,
  Role,
} from './foundation'

// Operational
export type {
  Goal,
  Milestone,
  Project,
  Task,
  Habit,
  HabitEntry,
  Challenge,
  ChallengeEntry,
} from './operational'

// Resources
export type {
  EnergyState,
  TimeBlock,
} from './resources'

// Reflection
export type {
  DailyReview,
  WeeklyReview,
  JournalEntry,
} from './reflection'

// Gamification
export type {
  UserStats,
  Reward,
  Wish,
  Achievement,
} from './gamification'

// Finance
export type {
  AccountType,
  TransactionType,
  Account,
  Transaction,
  FinancialGoal,
  Budget,
  FinancialStats,
} from './finance'

// Health
export type {
  BodyZoneStatus,
  MedicalDocumentType,
  HealthMetricType,
  BodyZone,
  MedicalDocument,
  HealthMetricEntry,
  HealthProfile,
  Medication,
  EmergencyContact,
} from './health'

// Skills
export type {
  SkillActivityType,
  SkillActivity,
  SkillCertificate,
  SkillDecayLog,
  Skill,
  SkillTierLevel,
} from './skills'

// System
export type {
  AppSettings,
  AppData,
} from './system'

// Storage
export type {
  StorageFolder,
  StorageFolderType,
  LearningSource,
  LearningSourceType,
  LearningSourceStatus,
  StorageContact,
  ContactCategory,
  Insight,
  InsightPriority,
  InsightStatus,
  StorageResource,
  ResourceType,
  StorageStats,
  CreateFolderInput,
  CreateLearningSourceInput,
  CreateInsightInput,
  CreateContactInput,
  CreateResourceInput,
} from './storage'

// Re-export constants
export {
  LIFE_AREAS,
  DIFFICULTY_MULTIPLIERS,
  FINANCE_CATEGORIES,
  BODY_ZONES_DEFAULT,
  MEDICAL_DOCUMENT_TYPES,
  HEALTH_METRIC_UNITS,
  SKILL_TIERS,
  calculateXpNeeded,
  getSkillTier,
  SKILL_ACTIVITY_XP,
  SKILL_CATEGORIES,
  SKILL_DECAY,
  CERTIFICATE_TEMPLATES,
} from './constants'
