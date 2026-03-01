// ============================================
// STORE MODULE - Main Export
// ============================================
//
// Новая модульная архитектура store.
// Каждая feature имеет свою директорию с чёткими границами.
//
// Структура:
// - core/        # Низкоуровневые операции (storage, keys, utils, swr)
// - features/    # Feature-based модули
// - sync/        # Синхронизация (отдельно)
//
// ============================================

// ============================================
// CORE - Низкоуровневые операции
// ============================================

export {
  // Storage
  getStore,
  setStore,
  removeStore,
  hasStore,
  getStoreKeys,
  clearStore,
  STORAGE_PREFIX,
  // Keys
  KEYS,
  isValidKey,
  // Utils
  genId,
  now,
  today,
  yesterday,
  addDays,
  daysBetween,
  formatDate,
  isToday,
  isYesterday,
  // SWR
  mutateKey,
  mutateKeys,
  optimisticUpdate,
  getSwrKey,
} from "./core"

export type { StoreKey } from "./core"

// ============================================
// FEATURES - Модули по доменам
// ============================================

// -------- GAMIFICATION --------
export {
  // Config
  DIFFICULTY_XP,
  DIFFICULTY_COINS,
  PRIORITY_XP,
  BASE_XP_TO_NEXT,
  LEVEL_UP_MULTIPLIER,
  LEVEL_TITLES,
  LEVEL_COLORS,
  getLevelConfig,
  calculateXpToNext,
  calculateTotalXpForLevel,
  getLevelName,
  calculateLevelProgress,
  // Store
  getStats,
  getGamificationState,
  updateStats,
  setStats,
  resetStats,
  // Logic
  addXp,
  addCoins,
  spendCoins,
  checkAndUpdateStreak,
  isActiveToday,
  getStreakGracePeriod,
  calculateStreakBonus,
  // Hooks
  useStats,
  useXp,
  useCoins,
  useStreak,
  useGamification,
} from "./features/gamification"

export type {
  CoinsOperationResult,
  ActionRewards,
  LevelConfig,
  GamificationEvent,
  GamificationState,
} from "./features/gamification"

// -------- TASKS --------
export {
  // Store (CRUD)
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  completeTask,
  uncompleteTask,
  deleteTask,
  deleteTasks,
  updateTasks,
  // Queries
  getTodaysTasks,
  getTasksByDate,
  getTomorrowsTasks,
  getThisWeekTasks,
  getOverdueTasks,
  getUpcomingTasks,
  getCompletedTasks,
  getActiveTasks,
  getInProgressTasks,
  getCancelledTasks,
  getTasksByProject,
  filterTasks,
  sortTasks,
  groupTasks,
  getTasksStats,
  // Hooks
  useTasks,
  useFilteredTasks,
  useTodaysTasks,
  useActiveTasks,
  useTasksStats,
  useTask,
  useTaskManager,
} from "./features/tasks"

export type {
  TaskFilters,
  TaskSort,
  TaskSortBy,
  TaskSortOrder,
  TaskOperationResult,
  TasksStats,
  TaskGroupBy,
  GroupedTasks,
} from "./features/tasks"

// -------- GOALS --------
export {
  getGoals,
  getGoalById,
  createGoal,
  updateGoal,
  deleteGoal,
  completeGoal,
  getGoalsByArea,
  getGoalsByStatus,
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  completeProject,
  getProjectsByGoal,
  getProjectsByStatus,
  getActiveProjects,
} from "./features/goals"

// -------- HABITS --------
export {
  getHabits,
  getHabitById,
  createHabit,
  updateHabit,
  deleteHabit,
  toggleHabitEntry,
  calculateStreak,
  getHabitsByArea,
  getHabitsForDate,
  getTodaysHabits,
  getActiveHabits,
  getHabitsStats,
} from "./features/habits"

// -------- IDENTITY --------
export {
  getIdentity,
  updateIdentity,
  completeOnboarding,
  getValues,
  getValueById,
  createValue,
  updateValue,
  deleteValue,
  getAreas,
  getAreaById,
  createArea,
  updateArea,
  deleteArea,
  getActiveAreas,
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  getRolesByArea,
  getPrinciples,
  addPrinciple,
  updatePrinciple,
  deletePrinciple,
} from "./features/identity"
export type { Principle } from "./features/identity"

// -------- FINANCE --------
export {
  getAccounts,
  getAccountById,
  addAccount,
  updateAccount,
  deleteAccount,
  getTransactions,
  getTransactionById,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionsByAccount,
  getTransactionsByDateRange,
  getFinancialGoals,
  getFinancialGoalById,
  addFinancialGoal,
  updateFinancialGoal,
  deleteFinancialGoal,
  contributeToGoal,
  getBudgets,
  addBudget,
  updateBudget,
  deleteBudget,
  getFinancialStats,
  getExpensesByCategory,
} from "./features/finance"

export type { ContributeGoalResult } from "./features/finance"

// -------- HEALTH --------
export {
  getBodyZones,
  getBodyZoneById,
  updateBodyZone,
  getBodyZonesStats,
  getMedicalDocuments,
  getMedicalDocumentById,
  addMedicalDocument,
  updateMedicalDocument,
  deleteMedicalDocument,
  getHealthMetrics,
  getHealthMetricById,
  addHealthMetric,
  updateHealthMetric,
  deleteHealthMetric,
  getHealthMetricsByType,
  getHealthMetricsByDate,
  getLatestHealthMetric,
  getHealthProfile,
  updateHealthProfile,
  addMedication,
  removeMedication,
} from "./features/health"

// -------- SKILLS --------
export {
  getSkills,
  getSkillById,
  addSkill,
  updateSkill,
  deleteSkill,
  addSkillActivity,
  getSkillActivities,
  getSkillCertificates,
  checkSkillDecay,
  getDecayLogs,
  getSkillStats,
  getSkillsByCategory,
  getTopSkills,
  getRecentlyActiveSkills,
  getSkillsNeedingAttention,
} from "./features/skills"

export type { AddActivityResult } from "./features/skills"

// -------- REFLECTION --------
export {
  getDailyReviews,
  getDailyReview,
  saveDailyReview,
  deleteDailyReview,
  getWeeklyReviews,
  getWeeklyReview,
  saveWeeklyReview,
  getJournal,
  getJournalEntryById,
  addJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  getJournalEntriesByGoal,
  getJournalEntriesByType,
} from "./features/reflection"

// -------- WISHES --------
export {
  getWishes,
  getWishById,
  addWish,
  updateWish,
  deleteWish,
  contributeToWish,
  purchaseWish,
  getWishesByStatus,
  getActiveWishes,
  getWishesStats,
} from "./features/wishes"

export type { ContributeResult, PurchaseResult } from "./features/wishes"

// -------- BACKUP --------
export {
  exportAllData,
  downloadBackup,
  importAllData,
  loadBackupFromFile,
  clearAllData,
} from "./features/backup"

export type { ImportResult } from "./features/backup"

// ============================================
// DEFAULTS
// ============================================

export { defaultIdentity, defaultStats, defaultSettings } from "./defaults"

// ============================================
// BACKWARD COMPATIBILITY ALIASES
// ============================================

// Goals
export { createGoal as addGoal } from "./features/goals"

// Habits  
export { createHabit as addHabit } from "./features/habits"

// Identity
export { createArea as addArea } from "./features/identity"
export { createValue as addValue } from "./features/identity"
export { createRole as addRole } from "./features/identity"

// Tasks
export { createTask as addTask } from "./features/tasks"

// ============================================
// MIGRATION GUIDE
// ============================================
//
// Старые пути → Новые пути:
//
// import { getGoals } from "@/lib/store/goals"
// → import { getGoals } from "@/lib/store/features/goals"
//
// import { getHabits } from "@/lib/store/habits"  
// → import { getHabits } from "@/lib/store/features/habits"
//
// Все функции доступны и через главный index.ts:
// import { getGoals, getHabits } from "@/lib/store"
