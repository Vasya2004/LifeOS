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
      const localData = getLocal()

      // Try server if authenticated and server fetcher provided
      if (isAuthenticated && getServer) {
        try {
          const serverData = await getServer()

          // For arrays: merge server items into local, keeping local versions
          // (local is always up-to-date; server may be stale if sync queue hasn't run)
          let merged: T
          if (Array.isArray(serverData) && Array.isArray(localData)) {
            const localMap = new Map(
              (localData as { id: string }[]).map((item) => [item.id, item])
            )
            // Add server items that don't exist locally (e.g. from another device)
            const extra = (serverData as { id: string }[]).filter(
              (item) => !localMap.has(item.id)
            )
            merged = (extra.length > 0 ? [...localData, ...extra] : localData) as T
          } else if (localData === null || localData === undefined) {
            // For single objects: use server only if local is empty
            merged = serverData
          } else {
            // Local exists — keep it
            merged = localData
          }

          if (setLocal) {
            setLocal(merged)
          } else {
            setStore(storageKey, merged)
          }
          return merged
        } catch {
          // Fall through to local
        }
      }
      // Return local data
      return localData
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
