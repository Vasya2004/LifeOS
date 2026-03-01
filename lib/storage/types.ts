// ============================================
// HYBRID STORAGE TYPES
// ============================================

import type { 
  Identity, 
  UserStats, 
  AppSettings, 
  LifeArea, 
  CoreValue, 
  Role 
} from "../types"

// ============================================
// UTILITIES (duplicated to avoid core.ts dependency)
// ============================================

export function genId(): string {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID()
    }
  } catch {
    // Fallback
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function now(): string {
  return new Date().toISOString()
}

export function today(): string {
  return new Date().toISOString().split('T')[0]
}

// ============================================
// COOKIE STORAGE (Server + Client)
// Only small, essential data (< 4KB)
// ============================================

export interface ServerState {
  /** User identity (minimal) */
  identity: Pick<Identity, 'id' | 'name' | 'onboardingCompleted'> | null
  /** Current level and XP for UI */
  stats: Pick<UserStats, 'level' | 'xp' | 'xpToNext' | 'coins'> | null
  /** Theme and basic preferences */
  settings: Pick<AppSettings, 'theme'> | null
  /** Timestamp of last sync */
  lastSyncAt: string | null
  /** Whether user is authenticated */
  isAuthenticated: boolean
}

export interface CookieData {
  identity?: string
  stats?: string
  settings?: string
  lastSyncAt?: string
  isAuthenticated?: string
}

// ============================================
// INDEXEDDB STORAGE (Client only)
// Large data, full objects
// ============================================

export interface ClientData {
  identity: Identity | null
  stats: UserStats | null
  settings: AppSettings | null
  areas: LifeArea[]
  values: CoreValue[]
  roles: Role[]
  lastSyncAt: string | null
}

// ============================================
// HYBRID DATA RESPONSE
// ============================================

export interface HybridDataResult<T> {
  /** Data from server (initial SSR) */
  serverData: T | null
  /** Data from client storage */
  clientData: T | null
  /** Whether data is currently loading */
  isLoading: boolean
  /** Whether data is being hydrated from client */
  isHydrating: boolean
  /** Whether hydration is complete */
  isReady: boolean
  /** Error if any */
  error: Error | null
}

// ============================================
// SYNC STATE
// ============================================

export interface SyncState {
  status: 'idle' | 'syncing' | 'error' | 'offline'
  lastSyncAt: string | null
  pendingChanges: number
  error: string | null
}

// ============================================
// SYNC OPTIONS
// ============================================

export interface SyncOptions {
  /** Keys to sync (empty = all) */
  keys?: string[]
  /** Whether to force sync even if no changes */
  force?: boolean
}

export interface SyncResult {
  success: boolean
  syncedKeys: string[]
  errors: string[]
}

// ============================================
// STORAGE KEYS
// ============================================

export const COOKIE_KEYS = {
  IDENTITY: 'lifeos_identity',
  STATS: 'lifeos_stats',
  SETTINGS: 'lifeos_settings',
  LAST_SYNC: 'lifeos_last_sync',
  AUTH: 'lifeos_auth',
} as const

export const IDB_KEYS = {
  IDENTITY: 'identity',
  STATS: 'stats',
  SETTINGS: 'settings',
  AREAS: 'areas',
  VALUES: 'values',
  ROLES: 'roles',
  LAST_SYNC: 'lastSyncAt',
} as const

// ============================================
// SSR FALLBACKS
// ============================================

export const SSR_FALLBACKS = {
  identity: null,
  stats: null,
  settings: { theme: 'dark' as const },
  lastSyncAt: null,
  isAuthenticated: false,
} as const

// ============================================
// DEFAULT VALUES
// ============================================

export const defaultIdentity: Identity = {
  id: genId(),
  name: "Игрок 1",
  vision: "",
  mission: "",
  onboardingCompleted: false,
  createdAt: now(),
  updatedAt: now(),
}

export const defaultStats: UserStats = {
  level: 1,
  xp: 0,
  xpToNext: 1000,
  coins: 0,
  totalCoinsEarned: 0,
  totalCoinsSpent: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: today(),
  totalTasksCompleted: 0,
  totalGoalsAchieved: 0,
  totalProjectsCompleted: 0,
  totalHabitCompletions: 0,
  totalDeepWorkHours: 0,
  totalFocusSessions: 0,
  avgDailyTasks: 0,
}

export const defaultSettings: AppSettings = {
  theme: "dark",
  soundEnabled: true,
  notificationsEnabled: false,
  weekStartsOn: 1,
  defaultWorkingHours: { start: "09:00", end: "18:00" },
}
