// ============================================
// CORE STORAGE - Низкоуровневые операции с хранилищем
// Единый бэкенд: IndexedDB (idb) или localStorage при fallback.
// ============================================

import {
  cacheGet,
  cacheSet,
  cacheRemove,
  cacheClear,
  getCacheKeys,
  cacheHas,
} from "@/lib/store/idb"

export const STORAGE_PREFIX = "lifeos_"

/**
 * Получить данные из хранилища
 */
export function getStore<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  return cacheGet(key, fallback)
}

/**
 * Сохранить данные в хранилище
 */
export function setStore<T>(key: string, value: T) {
  if (typeof window === "undefined") return
  cacheSet(key, value)
}

/**
 * Удалить данные из хранилища
 */
export function removeStore(key: string) {
  if (typeof window === "undefined") return
  cacheRemove(key)
}

/**
 * Проверить существование ключа
 */
export function hasStore(key: string): boolean {
  if (typeof window === "undefined") return false
  return cacheHas(key)
}

/**
 * Получить все ключи (без префикса)
 */
export function getStoreKeys(): string[] {
  if (typeof window === "undefined") return []
  return getCacheKeys()
}

/**
 * Очистить всё хранилище приложения
 */
export function clearStore() {
  if (typeof window === "undefined") return
  cacheClear()
}
