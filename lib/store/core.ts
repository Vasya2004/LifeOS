// ============================================
// CORE STORAGE UTILITIES (Legacy - для обратной совместимости)
// ============================================
// 
// Этот файл оставлен для обратной совместимости.
// Новый код должен импортировать из "@/lib/store/core" (директория)
// 
// ============================================

import { mutate } from "swr"
import { cacheGet, cacheSet } from "./idb"

export const STORAGE_PREFIX = "lifeos_"

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
  localStorage.removeItem(STORAGE_PREFIX + key)
}

export function hasStore(key: string): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem(STORAGE_PREFIX + key) !== null
}

export function getStoreKeys(): string[] {
  if (typeof window === "undefined") return []
  return Object.keys(localStorage)
    .filter(k => k.startsWith(STORAGE_PREFIX))
    .map(k => k.replace(STORAGE_PREFIX, ""))
}

export function clearStore() {
  if (typeof window === "undefined") return
  getStoreKeys().forEach(key => removeStore(key))
}

export function genId(): string {
  try {
    if (typeof window !== "undefined" && window.crypto?.randomUUID) {
      return window.crypto.randomUUID()
    }
  } catch (e) {
    // Ignore and use fallback
  }

  // Robust UUID v4 fallback
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function now(): string {
  return new Date().toISOString()
}

export function today(): string {
  return new Date().toISOString().split("T")[0]
}

export function yesterday(): string {
  const date = new Date()
  date.setDate(date.getDate() - 1)
  return date.toISOString().split("T")[0]
}

export function addDays(date: string, days: number): string {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d.toISOString().split("T")[0]
}

export function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  return Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24))
}

export function formatDate(date: string): string {
  const d = new Date(date)
  return d.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export function isToday(date: string): boolean {
  return date === today()
}

export function isYesterday(date: string): boolean {
  return date === yesterday()
}

// ============================================
// SWR KEYS
// ============================================

export const KEYS = {
  identity: "identity",
  values: "values",
  areas: "areas",
  roles: "roles",
  goals: "goals",
  projects: "projects",
  tasks: "tasks",
  habits: "habits",
  challenges: "challenges",
  dailyReviews: "dailyReviews",
  weeklyReviews: "weeklyReviews",
  journal: "journal",
  stats: "stats",
  wishes: "wishes",
  achievements: "achievements",
  accounts: "accounts",
  transactions: "transactions",
  financialGoals: "financialGoals",
  budgets: "budgets",
  settings: "settings",
  bodyZones: "bodyZones",
  medicalDocuments: "medicalDocuments",
  healthMetrics: "healthMetrics",
  healthProfile: "healthProfile",
  skills: "skills",
  skillActivities: "skillActivities",
  skillCertificates: "skillCertificates",
  skillDecayLogs: "skillDecayLogs",
} as const

export type StoreKey = keyof typeof KEYS

export function isValidKey(key: string): key is StoreKey {
  return key in KEYS
}

export function mutateKey(key: string, data?: unknown, shouldRevalidate = false) {
  if (data !== undefined) {
    // Optimistic update: update SWR cache directly, no server re-fetch
    mutate(key, data, shouldRevalidate)
  } else {
    mutate(key)
  }
}

export function mutateKeys(keys: StoreKey[], shouldRevalidate = false) {
  keys.forEach(key => mutateKey(key, undefined, shouldRevalidate))
}

export function optimisticUpdate<T>(
  key: StoreKey,
  updater: (current: T) => T,
  fallback: T
) {
  mutate<T>(
    KEYS[key],
    (current) => updater(current ?? fallback),
    false
  )
}

export function getSwrKey(storeKey: StoreKey): string {
  return KEYS[storeKey]
}
