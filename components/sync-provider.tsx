// ============================================
// SYNC PROVIDER - Cloud synchronization
// ============================================

"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import {
  getSyncStatus,
  subscribeToSyncStatus,
  startAutoSync,
  stopAutoSync,
  loadFromCloud,
  forceSync as forceCloudSync,
  type SyncStatus
} from "@/lib/sync/cloud-sync"
import { useAuth } from "@/lib/auth"

interface SyncContextValue {
  syncState: SyncStatus
  forceSync: () => Promise<{ success: boolean; message: string }>
  loadFromCloud: () => Promise<boolean>
}

const SyncContext = createContext<SyncContextValue | undefined>(undefined)

export function SyncProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth()
  const [syncState, setSyncState] = useState<SyncStatus>(getSyncStatus())

  // Subscribe to sync state changes
  useEffect(() => {
    const unsubscribe = subscribeToSyncStatus(setSyncState)
    return () => { unsubscribe() }
  }, [])

  // Start auto-sync when authenticated
  useEffect(() => {
    console.log("[SyncProvider] Auth changed:", { isAuthenticated, isGuest: (user as any)?.isGuest })
    if (!isAuthenticated || (user as any)?.isGuest) {
      console.log("[SyncProvider] Sync disabled for guest/unauthenticated user")
      stopAutoSync()
      return
    }

    // Load data from cloud on auth
    loadFromCloud()

    // Start auto-sync
    startAutoSync()

    return () => stopAutoSync()
  }, [isAuthenticated, user])

  const forceSync = async () => {
    return forceCloudSync()
  }

  return (
    <SyncContext.Provider value={{ syncState, forceSync, loadFromCloud }}>
      {children}
    </SyncContext.Provider>
  )
}

export function useSync() {
  const context = useContext(SyncContext)
  if (context === undefined) {
    throw new Error("useSync must be used within a SyncProvider")
  }
  return context
}
