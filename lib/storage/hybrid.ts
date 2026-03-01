// ============================================
// HYBRID STORAGE - Unified API
// Server: cookies for minimal data
// Client: IndexedDB for full data
// ============================================

import type { 
  ServerState, 
  HybridDataResult,
  Identity,
  UserStats,
  AppSettings,
  LifeArea,
  CoreValue,
  Role
} from './types'

// Server imports (only work in server components)
import {
  getServerState as getServerStateImpl,
  setServerIdentity,
  setServerStats,
  setServerSettings,
  setServerAuth,
  setServerLastSync,
  clearServerCookies,
  toServerIdentity,
  toServerStats,
  toServerSettings,
} from './server'

// Client imports (only work in client components)
import {
  getClientCookiesState,
  hydrateFromServer,
  syncWithServer,
  debouncedSync,
  flushPendingSyncs,
  getClientData,
  setCookie,
  setupAutoSync,
} from './client'

import { cacheGet, cacheSet } from '@/lib/store/idb'
import { IDB_KEYS, defaultIdentity, defaultStats, defaultSettings } from './types'

// ============================================
// SERVER EXPORTS
// ============================================

export {
  // Server state
  getServerStateImpl as getServerState,
  
  // Server setters (Server Actions)
  setServerIdentity,
  setServerStats,
  setServerSettings,
  setServerAuth,
  setServerLastSync,
  clearServerCookies,
  
  // Converters
  toServerIdentity,
  toServerStats,
  toServerSettings,
}

// ============================================
// CLIENT EXPORTS
// ============================================

export {
  // Client state from cookies
  getClientCookiesState,
  
  // Hydration
  hydrateFromServer,
  
  // Sync
  syncWithServer,
  debouncedSync,
  flushPendingSyncs,
  
  // Data access
  getClientData,
  
  // Utilities
  setCookie,
  setupAutoSync,
}

// ============================================
// HYBRID DATA ACCESSORS
// ============================================

/**
 * Universal getter - works on both server and client
 * On server: reads from cookies
 * On client: reads from IndexedDB
 */
export async function getHybridData<T>(
  key: string,
  serverGetter: () => Promise<T | null>,
  clientFallback: T
): Promise<T> {
  // Server-side
  if (typeof window === 'undefined') {
    return serverGetter() ?? clientFallback
  }
  
  // Client-side
  return cacheGet<T>(key, clientFallback)
}

/**
 * Universal setter - works on both server and client
 * On server: sets cookie immediately
 * On client: sets IndexedDB + debounced cookie sync
 */
export async function setHybridData<T>(
  key: string,
  value: T,
  options?: { immediateSync?: boolean }
): Promise<void> {
  // Always set to IndexedDB (works in both environments)
  cacheSet(key, value)
  
  // Client: sync to cookies for SSR
  if (typeof window !== 'undefined') {
    if (options?.immediateSync) {
      await syncWithServer({ keys: [key] })
    } else {
      debouncedSync(key)
    }
  }
}

// ============================================
// SPECIFIC DATA ACCESSORS
// ============================================

/**
 * Get identity (hybrid)
 */
export async function getHybridIdentity(serverState: ServerState): Promise<Identity> {
  // Server or initial render
  if (typeof window === 'undefined') {
    if (serverState.identity) {
      return {
        ...defaultIdentity,
        id: serverState.identity.id,
        name: serverState.identity.name,
        onboardingCompleted: serverState.identity.onboardingCompleted,
      }
    }
    return defaultIdentity
  }
  
  // Client
  return cacheGet<Identity>(IDB_KEYS.IDENTITY, defaultIdentity)
}

/**
 * Get stats (hybrid)
 */
export async function getHybridStats(serverState: ServerState): Promise<UserStats> {
  // Server or initial render
  if (typeof window === 'undefined') {
    if (serverState.stats) {
      return {
        ...defaultStats,
        level: serverState.stats.level,
        xp: serverState.stats.xp,
        xpToNext: serverState.stats.xpToNext,
        coins: serverState.stats.coins,
      }
    }
    return defaultStats
  }
  
  // Client
  return cacheGet<UserStats>(IDB_KEYS.STATS, defaultStats)
}

/**
 * Get settings (hybrid)
 */
export async function getHybridSettings(serverState: ServerState): Promise<AppSettings> {
  // Server or initial render
  if (typeof window === 'undefined') {
    if (serverState.settings) {
      return {
        ...defaultSettings,
        theme: serverState.settings.theme,
      }
    }
    return defaultSettings
  }
  
  // Client
  return cacheGet<AppSettings>(IDB_KEYS.SETTINGS, defaultSettings)
}

/**
 * Get areas (client only - too large for cookies)
 */
export function getHybridAreas(): LifeArea[] {
  return cacheGet<LifeArea[]>(IDB_KEYS.AREAS, [])
}

/**
 * Get values (client only)
 */
export function getHybridValues(): CoreValue[] {
  return cacheGet<CoreValue[]>(IDB_KEYS.VALUES, [])
}

/**
 * Get roles (client only)
 */
export function getHybridRoles(): Role[] {
  return cacheGet<Role[]>(IDB_KEYS.ROLES, [])
}

// ============================================
// INITIAL STATE BUILDER
// ============================================

/**
 * Build initial state for client hydration
 * Call this in root layout and pass to providers
 */
export async function buildInitialState(): Promise<ServerState> {
  // Server: read from cookies
  if (typeof window === 'undefined') {
    return getServerStateImpl()
  }
  
  // Client: read from cookies (set during SSR)
  return getClientCookiesState()
}

// ============================================
// TYPES RE-EXPORT
// ============================================

export type {
  ServerState,
  ClientData,
  HybridDataResult,
  SyncOptions,
  SyncResult,
} from './types'

export { COOKIE_KEYS, IDB_KEYS, SSR_FALLBACKS } from './types'
