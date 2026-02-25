// ============================================
// STORE MODULE - Main Export
// ============================================
// 
// This module has been refactored from a single 1277-line file
// into a modular architecture organized by domain.
//
// Structure:
// - core.ts: Storage utilities, KEYS, mutateKey
// - defaults.ts: Default values and game constants
// - gamification.ts: XP, coins, levels, streaks
// - identity.ts: Identity, values, areas, roles
// - goals.ts: Goals and projects
// - tasks.ts: Tasks management
// - habits.ts: Habits and streaks
// - reflection.ts: Daily reviews and journal
// - wishes.ts: Wishlist system
// - finance.ts: Accounts, transactions, budgets
// - health.ts: Body zones, metrics, documents
// - skills.ts: RPG skill system
// - backup.ts: Export/import functionality
//
// ============================================

// Core utilities
export { 
  STORAGE_PREFIX,
  getStore, 
  setStore, 
  KEYS, 
  mutateKey, 
  genId, 
  now, 
  today 
} from "./core"

// Default values
export { 
  defaultIdentity, 
  defaultStats, 
  defaultSettings,
  DIFFICULTY_XP,
  DIFFICULTY_COINS,
  PRIORITY_XP
} from "./defaults"

// Gamification
export {
  getStats,
  updateStats,
  addXp,
  addCoins,
  spendCoins,
  checkAndUpdateStreak,
  getLevelName,
} from "./gamification"

// Identity & Foundation
export {
  getIdentity,
  updateIdentity,
  getValues,
  addValue,
  updateValue,
  deleteValue,
  getAreas,
  addArea,
  updateArea,
  deleteArea,
  getRoles,
  addRole,
  updateRole,
  deleteRole,
} from "./identity"

// Goals & Projects
export {
  getGoals,
  addGoal,
  updateGoal,
  deleteGoal,
  getProjects,
  addProject,
  updateProject,
  deleteProject,
  completeProject,
} from "./goals"

// Tasks
export {
  getTasks,
  getTaskById,
  addTask,
  completeTask,
  updateTask,
  deleteTask,
  getTodaysTasks,
  getTasksByDate,
  getTasksByProject,
  getCompletedTasks,
  getPendingTasks,
} from "./tasks"

// Habits
export {
  getHabits,
  getHabitById,
  addHabit,
  toggleHabitEntry,
  updateHabit,
  deleteHabit,
  calculateStreak,
  getHabitsByArea,
  getHabitsForDate,
} from "./habits"

// Reflection
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
} from "./reflection"

// Wishes
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
} from "./wishes"

// Finance
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
} from "./finance"

// Health
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
} from "./health"

// Skills
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
} from "./skills"

// Backup
export {
  exportAllData,
  importAllData,
  clearAllData,
  downloadBackup,
  loadBackupFromFile,
} from "./backup"
