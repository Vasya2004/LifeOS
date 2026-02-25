// ============================================
// STORAGE UTILS - Базовые операции с хранилищем
// ============================================

import { cacheGet, cacheSet, cacheRemove, cacheClear, getCacheKeys } from "../idb"

export function getStore<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  return cacheGet(key, fallback)
}

export function setStore<T>(key: string, value: T) {
  if (typeof window === "undefined") return
  cacheSet(key, value)
}

export function removeStore(key: string) {
  if (typeof window === "undefined") return
  cacheRemove(key)
}

export function clearAllStores() {
  if (typeof window === "undefined") return
  cacheClear()
}

export function getAllStoreKeys(): string[] {
  if (typeof window === "undefined") return []
  return getCacheKeys()
}
