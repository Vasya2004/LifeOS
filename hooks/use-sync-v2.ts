// ============================================
// USE SYNC V2 HOOK
// ============================================

import { useEffect, useState, useCallback, useRef } from "react"
import { syncEngineV2, SyncState, SyncOptions } from "@/lib/sync/sync-engine-v2"
import { Conflict, ConflictResolution } from "@/lib/sync/conflict-resolver"

interface UseSyncOptions extends SyncOptions {
  onConflict?: (conflicts: Conflict<Record<string, unknown>>[]) => void
  onError?: (error: string) => void
  onSync?: () => void
}

export function useSyncV2(options: UseSyncOptions = {}) {
  const [state, setState] = useState<SyncState>(syncEngineV2.getState())
  const [isInitialized, setIsInitialized] = useState(false)
  const optionsRef = useRef(options)

  // Initialize sync engine
  useEffect(() => {
    let isMounted = true

    const init = async () => {
      await syncEngineV2.initialize(optionsRef.current)
      if (isMounted) {
        setIsInitialized(true)
      }
    }

    init()

    return () => {
      isMounted = false
      syncEngineV2.destroy()
    }
  }, [])

  // Subscribe to state changes
  useEffect(() => {
    if (!isInitialized) return

    const unsubscribe = syncEngineV2.subscribe((newState) => {
      setState(newState)

      // Callbacks
      if (newState.conflicts.length > 0 && optionsRef.current.onConflict) {
        optionsRef.current.onConflict(newState.conflicts)
      }
      if (newState.error && optionsRef.current.onError) {
        optionsRef.current.onError(newState.error)
      }
      if (newState.status === 'idle' && newState.lastSync && optionsRef.current.onSync) {
        optionsRef.current.onSync()
      }
    })

    return unsubscribe
  }, [isInitialized])

  // Actions
  const sync = useCallback(async () => {
    return syncEngineV2.sync()
  }, [])

  const pull = useCallback(async () => {
    return syncEngineV2.pullFromServer()
  }, [])

  const forceSync = useCallback(async () => {
    return syncEngineV2.forceSync()
  }, [])

  const resolveConflicts = useCallback(async (
    resolutions: Map<string, ConflictResolution>
  ) => {
    return syncEngineV2.resolveConflicts(resolutions)
  }, [])

  const clearQueue = useCallback(() => {
    syncEngineV2.clearQueue()
  }, [])

  const enqueue = useCallback((
    table: string,
    operation: 'create' | 'update' | 'delete',
    data: Record<string, unknown>
  ) => {
    syncEngineV2.enqueue(table, operation, data)
  }, [])

  return {
    // State
    status: state.status,
    lastSync: state.lastSync,
    pendingCount: state.pendingCount,
    error: state.error,
    conflicts: state.conflicts,
    isInitialized,
    isOnline: state.status !== 'offline',
    isSyncing: state.status === 'syncing',
    hasConflicts: state.conflicts.length > 0,

    // Actions
    sync,
    pull,
    forceSync,
    resolveConflicts,
    clearQueue,
    enqueue,
  }
}

// Hook for sync status only (lightweight)
export function useSyncStatus() {
  const [status, setStatus] = useState(syncEngineV2.getState().status)

  useEffect(() => {
    const unsubscribe = syncEngineV2.subscribe((state) => {
      setStatus(state.status)
    })
    return unsubscribe
  }, [])

  return status
}

// Hook for pending changes count
export function usePendingChanges() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const unsubscribe = syncEngineV2.subscribe((state) => {
      setCount(state.pendingCount)
    })
    return unsubscribe
  }, [])

  return count
}
