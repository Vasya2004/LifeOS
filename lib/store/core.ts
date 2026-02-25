// ============================================
// CORE STORAGE UTILITIES
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

export function mutateKey(key: string) {
  mutate(key)
}
