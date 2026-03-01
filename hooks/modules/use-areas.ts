// ============================================
// AREAS HOOKS
// ============================================

"use client"

import { useOfflineFirst, useOfflineMutation } from "@/hooks/core/use-offline-first"
import * as localStore from "@/lib/store"
import * as db from "@/lib/api/database"
import { addToQueue } from "@/lib/sync/offline-first"
import { setStore } from "@/lib/store/utils/storage"
import { useAuth } from "@/lib/auth/context"
import type { LifeArea } from "@/lib/types"

const AREAS_KEY = "areas"

export function useAreas() {
  const { isAuthenticated, isGuest } = useAuth()
  
  return useOfflineFirst<LifeArea[]>(AREAS_KEY, {
    storageKey: AREAS_KEY,
    getLocal: localStore.getAreas,
    getServer: isAuthenticated && !isGuest ? db.getAreas : undefined,
    setLocal: (data) => setStore(AREAS_KEY, data),
  })
}

export function useCreateArea() {
  const { isAuthenticated, isGuest } = useAuth()
  
  return async (area: Omit<LifeArea, "id">) => {
    const newArea = localStore.addArea(area)
    
    if (isAuthenticated && !isGuest) {
      addToQueue({ table: "areas", operation: "insert", recordId: newArea.id, data: newArea as unknown as Record<string, unknown> })
    }
    
    return newArea
  }
}

export function useUpdateArea() {
  const { isAuthenticated, isGuest } = useAuth()
  
  return async (id: string, updates: Partial<LifeArea>) => {
    localStore.updateArea(id, updates)
    
    if (isAuthenticated && !isGuest) {
      const updated = { ...localStore.getAreas().find(a => a.id === id), ...updates, id }
      addToQueue({ table: "areas", operation: "update", recordId: updated.id as string, data: updated as unknown as Record<string, unknown> })
    }
  }
}

export function useDeleteArea() {
  const { isAuthenticated, isGuest } = useAuth()
  
  return async (id: string) => {
    localStore.deleteArea(id)
    
    if (isAuthenticated && !isGuest) {
      addToQueue({ table: "areas", operation: "delete", recordId: id })
    }
  }
}
