// ============================================
// GOALS HOOKS
// ============================================

"use client"

import { useOfflineFirst } from "@/hooks/core/use-offline-first"
import * as localStore from "@/lib/store"
import * as db from "@/lib/api/database"
import { syncToServer } from "@/lib/sync/offline-first"
import { setStore } from "@/lib/store/utils/storage"
import { useAuth } from "@/lib/auth/context"
import type { Goal } from "@/lib/types"

const GOALS_KEY = "goals"

export function useGoals() {
  const { isAuthenticated } = useAuth()
  
  return useOfflineFirst<Goal[]>(GOALS_KEY, {
    storageKey: GOALS_KEY,
    getLocal: localStore.getGoals,
    getServer: isAuthenticated ? db.getGoals : undefined,
    setLocal: (data) => setStore(GOALS_KEY, data),
  })
}

export function useCreateGoal() {
  const { isAuthenticated } = useAuth()
  
  return async (goal: Omit<Goal, "id" | "createdAt">) => {
    const newGoal = localStore.addGoal(goal)
    
    if (isAuthenticated) {
      await syncToServer("insert", "goals", newGoal, () => {})
    }
    
    return newGoal
  }
}

export function useUpdateGoal() {
  const { isAuthenticated } = useAuth()
  
  return async (id: string, updates: Partial<Goal>) => {
    localStore.updateGoal(id, updates)
    
    if (isAuthenticated) {
      const updated = { ...localStore.getGoals().find(g => g.id === id), ...updates, id }
      await syncToServer("update", "goals", updated, () => {})
    }
  }
}

export function useDeleteGoal() {
  const { isAuthenticated } = useAuth()
  
  return async (id: string) => {
    localStore.deleteGoal(id)
    
    if (isAuthenticated) {
      await syncToServer("delete", "goals", id, () => {})
    }
  }
}
