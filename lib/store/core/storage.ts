// ============================================
// CORE STORAGE - Низкоуровневые операции с хранилищем
// ============================================

import { cacheGet, cacheSet } from "@/lib/store/idb"

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
  localStorage.removeItem(STORAGE_PREFIX + key)
}

/**
 * Проверить существование ключа
 */
export function hasStore(key: string): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem(STORAGE_PREFIX + key) !== null
}

/**
 * Получить все ключи с префиксом
 */
export function getStoreKeys(): string[] {
  if (typeof window === "undefined") return []
  return Object.keys(localStorage)
    .filter(k => k.startsWith(STORAGE_PREFIX))
    .map(k => k.replace(STORAGE_PREFIX, ""))
}

/**
 * Очистить всё хранилище приложения
 */
export function clearStore() {
  if (typeof window === "undefined") return
  getStoreKeys().forEach(key => removeStore(key))
}
