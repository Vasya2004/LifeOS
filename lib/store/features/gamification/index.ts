// ============================================
// GAMIFICATION FEATURE MODULE
// 
// Публичный API модуля геймификации
// ============================================

// Types
export type {
  CoinsOperationResult,
  ActionRewards,
  LevelConfig,
  GamificationEvent,
  GamificationState,
} from "./types"

// Config & Constants
export {
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
} from "./config"

// Store (CRUD)
export {
  getStats,
  getGamificationState,
  updateStats,
  setStats,
  resetStats,
} from "./store"

// Logic (Business rules)
export {
  addXp,
  addCoins,
  spendCoins,
  checkAndUpdateStreak,
  isActiveToday,
  getStreakGracePeriod,
  calculateStreakBonus,
} from "./logic"

// Hooks (React)
export {
  useStats,
  useXp,
  useCoins,
  useStreak,
  useGamification,
} from "./hooks"
