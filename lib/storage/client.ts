// ============================================
// CLIENT STORAGE UTILITIES
// For use in Client Components and hooks
// ============================================

'use client'

import type { 
  ServerState, 
  ClientData,
  Identity,
  UserStats,
  AppSettings
} from './types'
import { genId, now, today } from './types'
import { COOKIE_KEYS, IDB_KEYS, defaultIdentity, defaultStats, defaultSettings } from './types'
import { cacheGet, cacheSet } from '@/lib/store/idb'

// ============================================
// COOKIE UTILITIES (Client-side)
// ============================================

/**
 * Get cookie value by name (client-side)
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [key, value] = cookie.trim().split('=')
    if (key === name) {
      try {
        return decodeURIComponent(value)
      } catch {
        return value
      }
    }
  }
  return null
}

/**
 * Set cookie (client-side)
 */
export function setCookie(name: string, value: string, options?: { expires?: Date; path?: string }) {
  if (typeof document === 'undefined') return
  
  let cookieString = `${name}=${encodeURIComponent(value)}`
  
  if (options?.expires) {
    cookieString += `; expires=${options.expires.toUTCString()}`
  }
  
  cookieString += `; path=${options?.path ?? '/'}`
  cookieString += '; SameSite=Lax'
  
  if (window.location.protocol === 'https:') {
    cookieString += '; Secure'
  }
  
  document.cookie = cookieString
}

/**
 * Parse server state from cookies (client-side)
 */
export function getClientCookiesState(): ServerState {
  const parseJson = (value: string | null) => {
    if (!value) return null
    try {
      return JSON.parse(value)
    } catch {
      return null
    }
  }

  return {
    identity: parseJson(getCookie(COOKIE_KEYS.IDENTITY)),
    stats: parseJson(getCookie(COOKIE_KEYS.STATS)),
    settings: parseJson(getCookie(COOKIE_KEYS.SETTINGS)),
    lastSyncAt: parseJson(getCookie(COOKIE_KEYS.LAST_SYNC)),
    isAuthenticated: parseJson(getCookie(COOKIE_KEYS.AUTH)) ?? false,
  }
}

// ============================================
// HYDRATION FROM SERVER
// ============================================

/**
 * Hydrate client storage from server state
 * Call this once on app init (StorageProvider)
 */
export async function hydrateFromServer(serverState: ServerState): Promise<void> {
  // Only hydrate if server has data
  if (!serverState.identity && !serverState.stats) {
    return
  }

  // Check if client already has data
  const existingIdentity = cacheGet<Identity | null>(IDB_KEYS.IDENTITY, null)
  const existingStats = cacheGet<UserStats | null>(IDB_KEYS.STATS, null)

  // Only hydrate if client doesn't have data OR server data is newer
  if (serverState.identity && !existingIdentity) {
    // Merge server minimal identity with defaults
    const fullIdentity: Identity = {
      ...defaultIdentity,
      id: serverState.identity.id,
      name: serverState.identity.name,
      onboardingCompleted: serverState.identity.onboardingCompleted,
    }
    cacheSet(IDB_KEYS.IDENTITY, fullIdentity)
  }

  if (serverState.stats && !existingStats) {
    // Merge server minimal stats with defaults
    const fullStats: UserStats = {
      ...defaultStats,
      level: serverState.stats.level,
      xp: serverState.stats.xp,
      xpToNext: serverState.stats.xpToNext,
      coins: serverState.stats.coins,
    }
    cacheSet(IDB_KEYS.STATS, fullStats)
  }

  if (serverState.settings) {
    const existingSettings = cacheGet<AppSettings | null>(IDB_KEYS.SETTINGS, null)
    if (!existingSettings) {
      const fullSettings: AppSettings = {
        ...defaultSettings,
        theme: serverState.settings.theme,
      }
      cacheSet(IDB_KEYS.SETTINGS, fullSettings)
    }
  }

  if (serverState.lastSyncAt) {
    cacheSet(IDB_KEYS.LAST_SYNC, serverState.lastSyncAt)
  }
}

// ============================================
// SYNC WITH SERVER
// ============================================

import type { SyncOptions, SyncResult } from './types'

/**
 * Sync client data to server cookies
 * For critical data that needs SSR availability
 */
export async function syncWithServer(options: SyncOptions = {}): Promise<SyncResult> {
  const result: SyncResult = {
    success: true,
    syncedKeys: [],
    errors: [],
  }

  try {
    const identity = cacheGet<Identity | null>(IDB_KEYS.IDENTITY, null)
    const stats = cacheGet<UserStats | null>(IDB_KEYS.STATS, null)
    const settings = cacheGet<AppSettings | null>(IDB_KEYS.SETTINGS, null)
    const lastSync = cacheGet<string | null>(IDB_KEYS.LAST_SYNC, null)

    const keysToSync = options.keys ?? ['identity', 'stats', 'settings', 'lastSync']

    if (keysToSync.includes('identity') && identity) {
      const minimalIdentity = {
        id: identity.id,
        name: identity.name,
        onboardingCompleted: identity.onboardingCompleted,
      }
      setCookie(COOKIE_KEYS.IDENTITY, JSON.stringify(minimalIdentity))
      result.syncedKeys.push('identity')
    }

    if (keysToSync.includes('stats') && stats) {
      const minimalStats = {
        level: stats.level,
        xp: stats.xp,
        xpToNext: stats.xpToNext,
        coins: stats.coins,
      }
      setCookie(COOKIE_KEYS.STATS, JSON.stringify(minimalStats))
      result.syncedKeys.push('stats')
    }

    if (keysToSync.includes('settings') && settings) {
      const minimalSettings = {
        theme: settings.theme,
      }
      setCookie(COOKIE_KEYS.SETTINGS, JSON.stringify(minimalSettings))
      result.syncedKeys.push('settings')
    }

    if (keysToSync.includes('lastSync')) {
      const now = new Date().toISOString()
      setCookie(COOKIE_KEYS.LAST_SYNC, JSON.stringify(now))
      cacheSet(IDB_KEYS.LAST_SYNC, now)
      result.syncedKeys.push('lastSync')
    }

    return result
  } catch (error) {
    result.success = false
    result.errors.push(String(error))
    return result
  }
}

// ============================================
// CLIENT DATA ACCESS
// ============================================

/**
 * Get full client data from IndexedDB
 */
export function getClientData(): Partial<ClientData> {
  return {
    identity: cacheGet<Identity | null>(IDB_KEYS.IDENTITY, null),
    stats: cacheGet<UserStats | null>(IDB_KEYS.STATS, null),
    settings: cacheGet<AppSettings | null>(IDB_KEYS.SETTINGS, null),
    areas: cacheGet<LifeArea[]>(IDB_KEYS.AREAS, []),
    values: cacheGet<CoreValue[]>(IDB_KEYS.VALUES, []),
    roles: cacheGet<Role[]>(IDB_KEYS.ROLES, []),
    lastSyncAt: cacheGet<string | null>(IDB_KEYS.LAST_SYNC, null),
  }
}

// ============================================
// DEBOUNCED SYNC
// ============================================

const pendingSyncs = new Map<string, ReturnType<typeof setTimeout>>()

/**
 * Debounced sync to server cookies
 * Use for frequent updates (like XP gains)
 */
export function debouncedSync(key: string, delay: number = 1000) {
  // Clear existing timeout
  const existing = pendingSyncs.get(key)
  if (existing) {
    clearTimeout(existing)
  }

  // Set new timeout
  const timeout = setTimeout(() => {
    syncWithServer({ keys: [key] })
    pendingSyncs.delete(key)
  }, delay)

  pendingSyncs.set(key, timeout)
}

/**
 * Flush all pending syncs immediately
 * Call before page unload or important operations
 */
export function flushPendingSyncs(): Promise<SyncResult> {
  // Clear all pending timeouts
  pendingSyncs.forEach(timeout => clearTimeout(timeout))
  pendingSyncs.clear()

  // Sync everything
  return syncWithServer()
}

// ============================================
// HYDRATION STATE
// ============================================

const hydrationState = {
  isHydrated: false,
  serverState: null as ServerState | null,
}

/**
 * Set server state for hydration (call in layout)
 */
export function setHydrationState(state: ServerState) {
  hydrationState.serverState = state
}

/**
 * Get current hydration state
 */
export function getHydrationState() {
  return hydrationState
}

// ============================================
// WINDOW EVENT HANDLERS
// ============================================

/**
 * Setup automatic sync on important events
 * Call in StorageProvider or app init
 */
export function setupAutoSync() {
  if (typeof window === 'undefined') return

  // Sync before page unload
  window.addEventListener('beforeunload', () => {
    flushPendingSyncs()
  })

  // Sync when going offline/online
  window.addEventListener('online', () => {
    syncWithServer()
  })

  // Periodic sync (every 5 minutes)
  setInterval(() => {
    syncWithServer()
  }, 5 * 60 * 1000)
}
