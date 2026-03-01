// ============================================
// SERVER STORAGE UTILITIES
// For use in Server Components and API routes
// ============================================

import { cookies } from 'next/headers'
import type { 
  ServerState, 
  CookieData,
  Identity, 
  UserStats, 
  AppSettings 
} from './types'
import { COOKIE_KEYS, SSR_FALLBACKS } from './types'

// ============================================
// COOKIE OPTIONS
// ============================================

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24 * 365, // 1 year
  path: '/',
}

// ============================================
// SERIALIZATION
// ============================================

/**
 * Serialize data for cookie storage (compress if needed)
 */
export function serializeStoreData<T>(data: T): string {
  try {
    return JSON.stringify(data)
  } catch {
    return ''
  }
}

/**
 * Parse data from cookie string
 */
export function parseStoreData<T>(data: string | undefined, fallback: T): T {
  if (!data) return fallback
  try {
    return JSON.parse(data) as T
  } catch {
    return fallback
  }
}

// ============================================
// COOKIE PARSING (Server-side)
// ============================================

/**
 * Parse all store cookies from request
 * Use this in Server Components
 */
export async function parseStoreCookies(): Promise<ServerState> {
  try {
    const cookieStore = await cookies()
    
    const identityCookie = cookieStore.get(COOKIE_KEYS.IDENTITY)?.value
    const statsCookie = cookieStore.get(COOKIE_KEYS.STATS)?.value
    const settingsCookie = cookieStore.get(COOKIE_KEYS.SETTINGS)?.value
    const lastSyncCookie = cookieStore.get(COOKIE_KEYS.LAST_SYNC)?.value
    const authCookie = cookieStore.get(COOKIE_KEYS.AUTH)?.value

    return {
      identity: parseStoreData(identityCookie, SSR_FALLBACKS.identity),
      stats: parseStoreData(statsCookie, SSR_FALLBACKS.stats),
      settings: parseStoreData(settingsCookie, SSR_FALLBACKS.settings),
      lastSyncAt: parseStoreData(lastSyncCookie, SSR_FALLBACKS.lastSyncAt),
      isAuthenticated: parseStoreData(authCookie, SSR_FALLBACKS.isAuthenticated),
    }
  } catch {
    // Fallback for when cookies() is not available
    return {
      identity: SSR_FALLBACKS.identity,
      stats: SSR_FALLBACKS.stats,
      settings: SSR_FALLBACKS.settings,
      lastSyncAt: SSR_FALLBACKS.lastSyncAt,
      isAuthenticated: SSR_FALLBACKS.isAuthenticated,
    }
  }
}

/**
 * Get minimal identity from cookies (for layout/header)
 */
export async function getServerIdentity(): Promise<ServerState['identity']> {
  const state = await parseStoreCookies()
  return state.identity
}

/**
 * Get theme from cookies (for SSR theme)
 */
export async function getServerTheme(): Promise<'dark' | 'light' | 'system'> {
  const state = await parseStoreCookies()
  return state.settings?.theme ?? 'dark'
}

// ============================================
// COOKIE SETTING (Server Actions)
// ============================================

/**
 * Set identity cookie (Server Action)
 */
export async function setServerIdentity(identity: ServerState['identity']) {
  try {
    const cookieStore = await cookies()
    cookieStore.set(COOKIE_KEYS.IDENTITY, serializeStoreData(identity), COOKIE_OPTIONS)
    return { success: true }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

/**
 * Set stats cookie (Server Action)
 */
export async function setServerStats(stats: ServerState['stats']) {
  try {
    const cookieStore = await cookies()
    cookieStore.set(COOKIE_KEYS.STATS, serializeStoreData(stats), COOKIE_OPTIONS)
    return { success: true }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

/**
 * Set settings cookie (Server Action)
 */
export async function setServerSettings(settings: ServerState['settings']) {
  try {
    const cookieStore = await cookies()
    cookieStore.set(COOKIE_KEYS.SETTINGS, serializeStoreData(settings), COOKIE_OPTIONS)
    return { success: true }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

/**
 * Set authentication state cookie (Server Action)
 */
export async function setServerAuth(isAuthenticated: boolean) {
  try {
    const cookieStore = await cookies()
    cookieStore.set(COOKIE_KEYS.AUTH, serializeStoreData(isAuthenticated), COOKIE_OPTIONS)
    return { success: true }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

/**
 * Set last sync timestamp (Server Action)
 */
export async function setServerLastSync(timestamp: string) {
  try {
    const cookieStore = await cookies()
    cookieStore.set(COOKIE_KEYS.LAST_SYNC, serializeStoreData(timestamp), COOKIE_OPTIONS)
    return { success: true }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

/**
 * Clear all store cookies (logout/reset)
 */
export async function clearServerCookies() {
  try {
    const cookieStore = await cookies()
    Object.values(COOKIE_KEYS).forEach(key => {
      cookieStore.delete(key)
    })
    return { success: true }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

// ============================================
// SSR STATE BUILDER
// ============================================

/**
 * Build complete server state for initial page load
 * Use this in root layout to pass state to client
 */
export async function getServerState(): Promise<ServerState> {
  return parseStoreCookies()
}

/**
 * Convert full data to minimal server-safe format
 */
export function toServerIdentity(identity: Identity | null): ServerState['identity'] {
  if (!identity) return null
  return {
    id: identity.id,
    name: identity.name,
    onboardingCompleted: identity.onboardingCompleted,
  }
}

export function toServerStats(stats: UserStats | null): ServerState['stats'] {
  if (!stats) return null
  return {
    level: stats.level,
    xp: stats.xp,
    xpToNext: stats.xpToNext,
    coins: stats.coins,
  }
}

export function toServerSettings(settings: AppSettings | null): ServerState['settings'] {
  if (!settings) return null
  return {
    theme: settings.theme,
  }
}
