// ============================================
// GOALS HOOKS
// ============================================

"use client"

import { useOfflineFirst } from "@/hooks/core/use-offline-first"
import * as localStore from "@/lib/store"
import * as db from "@/lib/api/database"
import { addToQueue } from "@/lib/sync/offline-first"
import { setStore } from "@/lib/store/utils/storage"
import { useAuth } from "@/lib/auth/context"
import type { Goal } from "@/lib/types"

const GOALS_KEY = "goals"

export function useGoals() {
  const { isAuthenticated, isGuest } = useAuth()
  
  return useOfflineFirst<Goal[]>(GOALS_KEY, {
    storageKey: GOALS_KEY,
    getLocal: localStore.getGoals,
    getServer: isAuthenticated && !isGuest ? db.getGoals : undefined,
    setLocal: (data) => setStore(GOALS_KEY, data),
  })
}

export function useCreateGoal() {
  const { isAuthenticated, isGuest } = useAuth()
  
  return async (goal: Omit<Goal, "id" | "createdAt">) => {
    const newGoal = localStore.addGoal(goal)
    
    if (isAuthenticated && !isGuest) {
      addToQueue({ table: "goals", operation: "insert", recordId: newGoal.id, data: newGoal as unknown as Record<string, unknown> })
    }
    
    return newGoal
  }
}

export function useUpdateGoal() {
  const { isAuthenticated, isGuest } = useAuth()
  
  return async (id: string, updates: Partial<Goal>) => {
    localStore.updateGoal(id, updates)
    
    if (isAuthenticated && !isGuest) {
      const updated = { ...localStore.getGoals().find(g => g.id === id), ...updates, id }
      addToQueue({ table: "goals", operation: "update", recordId: updated.id as string, data: updated as unknown as Record<string, unknown> })
    }
  }
}

export function useDeleteGoal() {
  const { isAuthenticated, isGuest } = useAuth()
  
  return async (id: string) => {
    localStore.deleteGoal(id)
    
    if (isAuthenticated && !isGuest) {
      addToQueue({ table: "goals", operation: "delete", recordId: id })
    }
  }
}
