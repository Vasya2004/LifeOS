// ============================================
// OFFLINE-FIRST BASE HOOK
// ============================================
// Unified hook for offline-first data access
// Falls back to localStorage when offline or server fails

"use client"

import useSWR, { mutate as globalMutate } from "swr"
import { useAuth } from "@/lib/auth/context"
import { setStore } from "@/lib/store/utils/storage"
import type { OfflineFirstOptions, MutationOptions } from "./types"

/**
 * Base hook for offline-first data fetching
 * Priority: Server (if auth) > Local cache > Default value
 */
export function useOfflineFirst<T>(
  swrKey: string,
  options: OfflineFirstOptions<T>
) {
  const { isAuthenticated } = useAuth()
  const { 
    storageKey, 
    getLocal, 
    setLocal, 
    getServer,
    ...swrConfig 
  } = options

  const { data, error, isLoading, mutate } = useSWR(
    swrKey,
    async (): Promise<T> => {
      // Try server first if authenticated and server fetcher provided
      if (isAuthenticated && getServer) {
        try {
          const serverData = await getServer()
          // Update local cache
          if (setLocal) {
            setLocal(serverData)
          } else {
            setStore(storageKey, serverData)
          }
          return serverData
        } catch {
          // Fall through to local
        }
      }
      // Return local data
      return getLocal()
    },
    {
      revalidateOnFocus: false,
      ...swrConfig,
    }
  )

  return {
    data,
    isLoading,
    error,
    mutate,
  }
}

/**
 * Create a mutation function with optimistic updates
 */
export function useOfflineMutation<T>(options: MutationOptions<T>) {
  const { localUpdate, serverSync, revalidateKeys = [] } = options

  return async (): Promise<void> => {
    // Optimistic local update
    localUpdate()

    // Server sync if provided
    if (serverSync) {
      try {
        await serverSync()
      } catch (error) {
        console.error("Server sync failed:", error)
        // Could trigger retry queue here
      }
    }

    // Revalidate all related keys
    revalidateKeys.forEach(key => globalMutate(key))
  }
}

/**
 * Utility to create a standard query hook
 */
export function createQueryHook<T>(
  swrKey: string,
  options: Omit<OfflineFirstOptions<T>, 'isAuthenticated'>
) {
  return function useQuery() {
    return useOfflineFirst<T>(swrKey, options)
  }
}

/**
 * Utility to create a mutation hook
 */
export function createMutationHook<T>(
  mutationFn: (data: T) => Promise<void>,
  revalidateKeys: string[] = []
) {
  return function useMutation() {
    return async (data: T) => {
      await mutationFn(data)
      revalidateKeys.forEach(key => globalMutate(key))
    }
  }
}
