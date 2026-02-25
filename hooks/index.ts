// ============================================
// HOOKS - Main Export
// ============================================
// 
// This module provides unified React hooks for data access.
// All hooks follow the offline-first pattern:
// 1. Try server if authenticated
// 2. Fall back to localStorage cache
// 3. Optimistic updates for mutations
//
// ============================================

// Core hooks
export { useOfflineFirst, useOfflineMutation } from "./core/use-offline-first"
export type { OfflineFirstOptions, MutationOptions, UseDataReturn } from "./core/types"

// Areas
export {
  useAreas,
  useCreateArea,
  useUpdateArea,
  useDeleteArea,
} from "./modules/use-areas"

// Goals
export {
  useGoals,
  useCreateGoal,
  useUpdateGoal,
  useDeleteGoal,
} from "./modules/use-goals"

// Tasks
export {
  useTasks,
  useTodaysTasks,
  useCreateTask,
  useCompleteTask,
  useUpdateTask,
  useDeleteTask,
} from "./modules/use-tasks"

// Habits
export {
  useHabits,
  useToggleHabit,
  useCreateHabit,
  useUpdateHabit,
  useDeleteHabit,
  useHabitEntries,
} from "./modules/use-habits"

// Skills
export {
  useSkills,
  useSkill,
  useCreateSkill,
  useUpdateSkill,
  useDeleteSkill,
  useAddSkillActivity,
  useSkillStats,
  useTopSkills,
  useRecentlyActiveSkills,
  useSkillsByCategory,
} from "./modules/use-skills"

// Stats & Gamification
export {
  useStats,
  useAddXp,
  useAddCoins,
  useSpendCoins,
  useUpdateStats,
  getLevelName,
} from "./modules/use-stats"

// Identity & Foundation
export {
  useIdentity,
  useUpdateIdentity,
  useValues,
  useCreateValue,
  useUpdateValue,
  useDeleteValue,
  useRoles,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
} from "./modules/use-identity"

// Finance
export {
  useAccounts,
  useCreateAccount,
  useUpdateAccount,
  useDeleteAccount,
  useTransactions,
  useCreateTransaction,
  useDeleteTransaction,
  useTransactionsByAccount,
  useFinancialGoals,
  useCreateFinancialGoal,
  useUpdateFinancialGoal,
  useDeleteFinancialGoal,
  useContributeToGoal,
  useBudgets,
  useCreateBudget,
  useUpdateBudget,
  useDeleteBudget,
  useFinancialStats,
  useExpensesByCategory,
} from "./modules/use-finance"

// Health
export {
  useBodyZones,
  useUpdateBodyZone,
  useBodyZonesStats,
  useMedicalDocuments,
  useCreateMedicalDocument,
  useUpdateMedicalDocument,
  useDeleteMedicalDocument,
  useHealthMetrics,
  useCreateHealthMetric,
  useDeleteHealthMetric,
  useHealthMetricsByType,
  useHealthProfile,
  useUpdateHealthProfile,
} from "./modules/use-health"

// Reflection
export {
  useDailyReviews,
  useDailyReview,
  useSaveDailyReview,
  useDeleteDailyReview,
  useWeeklyReviews,
  useWeeklyReview,
  useSaveWeeklyReview,
  useJournal,
  useCreateJournalEntry,
  useUpdateJournalEntry,
  useDeleteJournalEntry,
  useJournalEntriesByGoal,
} from "./modules/use-reflection"

// Wishes
export {
  useWishes,
  useCreateWish,
  useUpdateWish,
  useDeleteWish,
  useContributeToWish,
  usePurchaseWish,
  useWishesByStatus,
  useActiveWishes,
} from "./modules/use-wishes"

// Backup & Data Management
export {
  useDataExport,
  useStorageStats,
} from "./modules/use-backup"

// Achievements
export {
  useAchievements,
  useAchievementStats,
  useCreateAchievement,
  useUpdateAchievement,
  useDeleteAchievement,
  useToggleFavoriteAchievement,
} from "./modules/use-achievements"

// Quests
export * from "./modules/use-quests"

// Rewards
export * from "./modules/use-rewards"
