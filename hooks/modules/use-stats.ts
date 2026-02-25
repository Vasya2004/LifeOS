// ============================================
// STATS HOOKS
// ============================================

"use client"

import { useOfflineFirst } from "@/hooks/core/use-offline-first"
import * as localStore from "@/lib/store"
import * as db from "@/lib/api/database"
import { setStore } from "@/lib/store/utils/storage"
import { useAuth } from "@/lib/auth/context"
import type { UserStats } from "@/lib/types"

const STATS_KEY = "stats"

export function useStats() {
  const { isAuthenticated } = useAuth()
  
  return useOfflineFirst<UserStats>(STATS_KEY, {
    storageKey: STATS_KEY,
    getLocal: localStore.getStats,
    getServer: isAuthenticated 
      ? async () => {
          const stats = await db.getUserStats()
          return stats || localStore.getStats()
        }
      : undefined,
    setLocal: (data) => setStore(STATS_KEY, data),
  })
}

export function useAddXp() {
  return async (amount: number, reason?: string) => {
    localStore.addXp(amount, reason)
  }
}

export function useAddCoins() {
  return async (amount: number) => {
    localStore.addCoins(amount)
  }
}

export function useSpendCoins() {
  return async (amount: number): Promise<boolean> => {
    return localStore.spendCoins(amount)
  }
}

export function useUpdateStats() {
  return async (updates: Partial<UserStats>) => {
    localStore.updateStats(updates)
  }
}

// Re-export level name helper
export { getLevelName } from "@/lib/store"
