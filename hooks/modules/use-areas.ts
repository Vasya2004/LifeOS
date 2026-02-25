// ============================================
// AREAS HOOKS
// ============================================

"use client"

import { useOfflineFirst, useOfflineMutation } from "@/hooks/core/use-offline-first"
import * as localStore from "@/lib/store"
import * as db from "@/lib/api/database"
import { syncToServer } from "@/lib/sync/offline-first"
import { setStore } from "@/lib/store/utils/storage"
import { useAuth } from "@/lib/auth/context"
import type { LifeArea } from "@/lib/types"

const AREAS_KEY = "areas"

export function useAreas() {
  const { isAuthenticated } = useAuth()
  
  return useOfflineFirst<LifeArea[]>(AREAS_KEY, {
    storageKey: AREAS_KEY,
    getLocal: localStore.getAreas,
    getServer: isAuthenticated ? db.getAreas : undefined,
    setLocal: (data) => setStore(AREAS_KEY, data),
  })
}

export function useCreateArea() {
  const { isAuthenticated } = useAuth()
  
  return async (area: Omit<LifeArea, "id">) => {
    const newArea = localStore.addArea(area)
    
    if (isAuthenticated) {
      await syncToServer("insert", "areas", newArea, () => {})
    }
    
    return newArea
  }
}

export function useUpdateArea() {
  const { isAuthenticated } = useAuth()
  
  return async (id: string, updates: Partial<LifeArea>) => {
    localStore.updateArea(id, updates)
    
    if (isAuthenticated) {
      const updated = { ...localStore.getAreas().find(a => a.id === id), ...updates, id }
      await syncToServer("update", "areas", updated, () => {})
    }
  }
}

export function useDeleteArea() {
  const { isAuthenticated } = useAuth()
  
  return async (id: string) => {
    localStore.deleteArea(id)
    
    if (isAuthenticated) {
      await syncToServer("delete", "areas", id, () => {})
    }
  }
}
