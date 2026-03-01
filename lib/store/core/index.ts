// ============================================
// CORE MODULE - Низкоуровневые операции с хранилищем
// ============================================

// Storage operations
export {
  getStore,
  setStore,
  removeStore,
  hasStore,
  getStoreKeys,
  clearStore,
  STORAGE_PREFIX,
} from "./storage"

// Keys
export { KEYS, isValidKey } from "./keys"
export type { StoreKey } from "./keys"

// Utilities
export {
  genId,
  now,
  today,
  yesterday,
  addDays,
  daysBetween,
  formatDate,
  isToday,
  isYesterday,
} from "./utils"

// SWR integration
export { mutateKey, mutateKeys, optimisticUpdate, getSwrKey } from "./swr"
