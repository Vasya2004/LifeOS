// ============================================
// SWR INTEGRATION - Интеграция с SWR для реактивности
// ============================================

import { mutate } from "swr"
import { KEYS, StoreKey } from "./keys"

/**
 * Получить SWR ключ для хранилища
 */
export function getSwrKey(storeKey: StoreKey): string {
  return KEYS[storeKey]
}

/**
 * Обновить SWR кэш для ключа
 * @param key - ключ хранилища
 * @param data - новые данные (undefined для ревалидации)
 * @param shouldRevalidate - нужно ли перезагрузить с сервера
 */
export function mutateKey(
  key: StoreKey | string, 
  data?: unknown, 
  shouldRevalidate = false
) {
  const swrKey = typeof key === "string" && key in KEYS 
    ? KEYS[key as StoreKey] 
    : key
    
  mutate(swrKey, data, shouldRevalidate)
}

/**
 * Мутация нескольких ключей сразу
 */
export function mutateKeys(keys: StoreKey[], shouldRevalidate = false) {
  keys.forEach(key => mutateKey(key, undefined, shouldRevalidate))
}

/**
 * Оптимистичное обновление данных
 */
export function optimisticUpdate<T>(
  key: StoreKey,
  updater: (current: T) => T,
  fallback: T
) {
  const swrKey = KEYS[key]
  
  // Получаем текущее значение из SWR кэша
  mutate<T>(
    swrKey,
    (current) => updater(current ?? fallback),
    false // Не ревалидируем сразу
  )
}
