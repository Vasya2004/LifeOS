// ============================================
// HOOKS CORE TYPES
// ============================================

import type { SWRConfiguration } from "swr"

export interface OfflineFirstOptions<T> extends SWRConfiguration {
  /** Key for localStorage cache */
  storageKey: string
  /** Function to get data from local storage */
  getLocal: () => T
  /** Function to save data to local storage */
  setLocal?: (data: T) => void
  /** Function to fetch data from server (optional) */
  getServer?: () => Promise<T>
  /** Function to sync data to server (optional) */
  syncServer?: (operation: 'insert' | 'update' | 'delete', data: unknown) => Promise<void>
  /** Whether user is authenticated */
  isAuthenticated?: boolean
}

export type MutationOptions<T> = {
  /** Optimistic local update function */
  localUpdate: () => T | void
  /** Server sync function (optional) */
  serverSync?: () => Promise<void>
  /** Keys to revalidate after mutation */
  revalidateKeys?: string[]
}

export interface UseDataReturn<T> {
  data: T | undefined
  isLoading: boolean
  error: Error | null
  mutate: () => void
}
