// ============================================
// LAZY STORE MODULE - Main Export
// ============================================
//
// This module provides code-splitting and lazy loading for heavy store modules.
// Critical modules (identity, stats, tasks) are loaded synchronously.
// Heavy modules (finance, health, skills) are loaded on-demand via dynamic imports.
//
// Usage:
//   // Direct async imports
//   import { getAccounts, addTransaction } from "@/lib/store/lazy/finance"
//   const accounts = await getAccounts()
//
//   // Or use the registry for more control
//   import { StoreRegistry } from "@/lib/store/lazy/registry"
//   const finance = await StoreRegistry.finance()
//   const accounts = finance.getAccounts()
//
//   // Preload heavy modules in background
//   import { preloadHeavyModules } from "@/lib/store/lazy"
//   preloadHeavyModules() // Loads finance, health, skills in background
//
// ============================================

// ============================================
// Registry - Core lazy loading manager
// ============================================

export {
  StoreRegistry,
  getFinanceModule,
  getHealthModule,
  getSkillsModule,
  preloadHeavyModules,
  preloadCriticalModules,
  type LoadingState,
} from "./registry"

// ============================================
// Lazy Finance Module
// ============================================

export {
  // Accounts
  getAccounts,
  getAccountById,
  addAccount,
  updateAccount,
  deleteAccount,
  // Transactions
  getTransactions,
  getTransactionById,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionsByAccount,
  getTransactionsByDateRange,
  // Financial Goals
  getFinancialGoals,
  getFinancialGoalById,
  addFinancialGoal,
  updateFinancialGoal,
  deleteFinancialGoal,
  contributeToGoal,
  // Budgets
  getBudgets,
  addBudget,
  updateBudget,
  deleteBudget,
  // Statistics
  getFinancialStats,
  getExpensesByCategory,
  // Loading State
  getLoadingState as getFinanceLoadingState,
} from "./finance"

// ============================================
// Lazy Health Module
// ============================================

export {
  // Body Zones
  getBodyZones,
  getBodyZoneById,
  updateBodyZone,
  getBodyZonesStats,
  // Medical Documents
  getMedicalDocuments,
  getMedicalDocumentById,
  addMedicalDocument,
  updateMedicalDocument,
  deleteMedicalDocument,
  // Health Metrics
  getHealthMetrics,
  getHealthMetricById,
  addHealthMetric,
  updateHealthMetric,
  deleteHealthMetric,
  getHealthMetricsByType,
  getHealthMetricsByDate,
  getLatestHealthMetric,
  // Health Profile
  getHealthProfile,
  updateHealthProfile,
  addMedication,
  removeMedication,
  // Loading State
  getLoadingState as getHealthLoadingState,
} from "./health"

// ============================================
// Lazy Skills Module
// ============================================

export {
  // Skills CRUD
  getSkills,
  getSkillById,
  addSkill,
  updateSkill,
  deleteSkill,
  // Skill Activities & XP
  addSkillActivity,
  getSkillActivities,
  getSkillCertificates,
  // Skill Decay System
  checkSkillDecay,
  getDecayLogs,
  // Skill Statistics
  getSkillStats,
  getSkillsByCategory,
  getTopSkills,
  getRecentlyActiveSkills,
  getSkillsNeedingAttention,
  // Loading State
  getLoadingState as getSkillsLoadingState,
} from "./skills"
