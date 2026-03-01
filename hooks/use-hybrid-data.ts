// ============================================
// HYBRID DATA HOOK
// SSR-safe data access with hydration
// ============================================

'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import useSWR, { mutate as globalMutate } from 'swr'
import type { ServerState, HybridDataResult } from '@/lib/storage/types'
import { IDB_KEYS } from '@/lib/storage/types'
import { 
  hydrateFromServer, 
  syncWithServer, 
  debouncedSync,
  getClientCookiesState,
  setHydrationState,
  getHydrationState,
} from '@/lib/storage/client'
import { cacheGet, cacheSet } from '@/lib/store/idb'



// ============================================
// TYPES
// ============================================

interface UseHybridDataOptions<T> {
  /** SWR key for caching/revalidation */
  swrKey: string
  /** IndexedDB key for local storage */
  storageKey: string
  /** Default/fallback value */
  fallback: T
  /** Server state passed from layout (optional) */
  serverState?: ServerState
  /** Function to transform server state to client type */
  serverToClient?: (serverData: ServerState) => T | null
  /** Whether to enable auto-sync to server cookies */
  syncToServer?: boolean
  /** Debounce delay for server sync (ms) */
  syncDelay?: number
}

interface UseHybridDataReturn<T> extends HybridDataResult<T> {
  /** Update data (optimistic) */
  setData: (value: T | ((prev: T) => T)) => void
  /** Force sync to server cookies */
  syncNow: () => Promise<void>
  /** Refresh from storage */
  refresh: () => Promise<void>
}

// ============================================
// BASE HOOK
// ============================================

/**
 * SSR-safe data hook with server → client hydration
 * 
 * Usage:
 * ```tsx
 * // Server Component
 * const serverState = await getServerState()
 * return <ClientComponent serverState={serverState} />
 * 
 * // Client Component
 * const { data, isReady, setData } = useHybridData({
 *   swrKey: 'identity',
 *   storageKey: IDB_KEYS.IDENTITY,
 *   fallback: defaultIdentity,
 *   serverState,
 *   serverToClient: (s) => s.identity,
 * })
 * ```
 */
export function useHybridData<T>(options: UseHybridDataOptions<T>): UseHybridDataReturn<T> {
  const {
    swrKey,
    storageKey,
    fallback,
    serverState: propServerState,
    serverToClient,
    syncToServer = true,
    syncDelay = 1000,
  } = options

  // Track if component is mounted
  const isMounted = useRef(false)
  
  // Hydration state (component level)
  const [isHydrating, setIsHydrating] = useState(false)
  const [hydrationError, setHydrationError] = useState<Error | null>(null)
  
  // Server state from props or global
  const hydrationState = getHydrationState()
  const serverState = propServerState ?? hydrationState.serverState
  
  // Initial server data (from SSR)
  const initialServerData = serverState && serverToClient 
    ? serverToClient(serverState) 
    : null

  // SWR for data fetching and caching
  const { data, error, isLoading, mutate } = useSWR<T>(
    swrKey,
    async () => {
      // Try to get from IndexedDB first
      const localData = cacheGet<T>(storageKey, fallback)
      return localData
    },
    {
      fallbackData: initialServerData ?? fallback,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  // Hydration effect - runs once
  useEffect(() => {
    if (isMounted.current) return
    isMounted.current = true

    // If we have server state and haven't hydrated yet
    const hydrationState = getHydrationState()
    if (serverState && !hydrationState.isHydrated) {
      setIsHydrating(true)
      
      hydrateFromServer(serverState)
        .then(() => {
          getHydrationState().isHydrated = true
          // Revalidate SWR to get hydrated data
          return mutate()
        })
        .catch((err) => {
          setHydrationError(err instanceof Error ? err : new Error(String(err)))
        })
        .finally(() => {
          setIsHydrating(false)
        })
    } else {
      // Already hydrated or no server state
      getHydrationState().isHydrated = true
    }
  }, [serverState, mutate])

  // Update function with optimistic updates
  const setData = useCallback((value: T | ((prev: T) => T)) => {
    const newValue = typeof value === 'function' 
      ? (value as (prev: T) => T)(data ?? fallback)
      : value

    // Optimistic update to SWR
    mutate(newValue, false)
    
    // Persist to IndexedDB
    cacheSet(storageKey, newValue)
    
    // Sync to server cookies (debounced)
    if (syncToServer) {
      debouncedSync(storageKey, syncDelay)
    }
  }, [data, fallback, mutate, storageKey, syncToServer, syncDelay])

  // Force immediate sync
  const syncNow = useCallback(async () => {
    await syncWithServer({ keys: [storageKey] })
  }, [storageKey])

  // Refresh from storage
  const refresh = useCallback(async () => {
    await mutate()
  }, [mutate])

  return {
    serverData: initialServerData,
    clientData: data ?? null,
    isLoading,
    isHydrating,
    isReady: getHydrationState().isHydrated && !isHydrating,
    error: error ?? hydrationError,
    setData,
    syncNow,
    refresh,
  }
}

// ============================================
// SPECIFIC HOOKS
// ============================================

import type { Identity, UserStats, AppSettings, LifeArea, CoreValue, Role } from '@/lib/types'
import { defaultIdentity, defaultStats, defaultSettings } from '@/lib/storage/types'

/**
 * Hook for identity (SSR-safe)
 */
export function useHybridIdentity(serverState?: ServerState) {
  return useHybridData<Identity>({
    swrKey: 'identity',
    storageKey: IDB_KEYS.IDENTITY,
    fallback: defaultIdentity,
    serverState,
    serverToClient: (s) => {
      if (!s.identity) return null
      return {
        ...defaultIdentity,
        id: s.identity.id,
        name: s.identity.name,
        onboardingCompleted: s.identity.onboardingCompleted,
      }
    },
  })
}

/**
 * Hook for stats (SSR-safe)
 */
export function useHybridStats(serverState?: ServerState) {
  return useHybridData<UserStats>({
    swrKey: 'stats',
    storageKey: IDB_KEYS.STATS,
    fallback: defaultStats,
    serverState,
    serverToClient: (s) => {
      if (!s.stats) return null
      return {
        ...defaultStats,
        level: s.stats.level,
        xp: s.stats.xp,
        xpToNext: s.stats.xpToNext,
        coins: s.stats.coins,
      }
    },
  })
}

/**
 * Hook for settings (SSR-safe)
 */
export function useHybridSettings(serverState?: ServerState) {
  return useHybridData<AppSettings>({
    swrKey: 'settings',
    storageKey: IDB_KEYS.SETTINGS,
    fallback: defaultSettings,
    serverState,
    serverToClient: (s) => {
      if (!s.settings) return null
      return {
        ...defaultSettings,
        theme: s.settings.theme,
      }
    },
  })
}

/**
 * Hook for areas (client-only, no SSR)
 */
export function useHybridAreas() {
  return useHybridData<LifeArea[]>({
    swrKey: 'areas',
    storageKey: IDB_KEYS.AREAS,
    fallback: [],
    syncToServer: false, // Too large for cookies
  })
}

/**
 * Hook for values (client-only)
 */
export function useHybridValues() {
  return useHybridData<CoreValue[]>({
    swrKey: 'values',
    storageKey: IDB_KEYS.VALUES,
    fallback: [],
    syncToServer: false,
  })
}

/**
 * Hook for roles (client-only)
 */
export function useHybridRoles() {
  return useHybridData<Role[]>({
    swrKey: 'roles',
    storageKey: IDB_KEYS.ROLES,
    fallback: [],
    syncToServer: false,
  })
}

/**
 * Check if hydration is complete
 */
export function useIsHydrated() {
  const [isHydrated, setIsHydrated] = useState(() => getHydrationState().isHydrated)

  useEffect(() => {
    if (getHydrationState().isHydrated) {
      setIsHydrated(true)
      return
    }

    // Poll for hydration completion
    const interval = setInterval(() => {
      if (getHydrationState().isHydrated) {
        setIsHydrated(true)
        clearInterval(interval)
      }
    }, 100)

    return () => clearInterval(interval)
  }, [])

  return isHydrated
}

// ============================================
// RE-EXPORTS
// ============================================

export type { ServerState, HybridDataResult } from '@/lib/storage/types'
export { IDB_KEYS, COOKIE_KEYS } from '@/lib/storage/types'
