"use client"

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react"
import { syncEngineV2, SyncOptions } from "@/lib/sync/sync-engine-v2"
import { Conflict, ConflictResolution } from "@/lib/sync/conflict-resolver"
import { ConflictDialog } from "./conflict-dialog"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth/context"

interface SyncContextValue {
  status: string
  lastSync: string | null
  pendingCount: number
  error: string | null
  isOnline: boolean
  isSyncing: boolean
  sync: () => Promise<boolean>
  pull: () => Promise<boolean>
  forceSync: () => Promise<boolean>
}

const SyncContext = createContext<SyncContextValue | null>(null)

interface SyncProviderV2Props {
  children: ReactNode
  options?: SyncOptions
}

export function SyncProviderV2({ children, options }: SyncProviderV2Props) {
  const { isAuthenticated, user } = useAuth()
  const [isInitialized, setIsInitialized] = useState(false)
  const [status, setStatus] = useState(syncEngineV2.getState().status)
  const offlineToastShownRef = useRef(false)
  const [lastSync, setLastSync] = useState<string | null>(null)
  const [pendingCount, setPendingCount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [conflicts, setConflicts] = useState<Conflict<Record<string, unknown>>[]>([])
  const [showConflictDialog, setShowConflictDialog] = useState(false)

  // Initialize sync engine when authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setIsInitialized(false)
      return
    }

    let isMounted = true

    const init = async () => {
      try {
        await syncEngineV2.initialize({
          enableRealtime: true,
          autoSync: true,
          conflictStrategy: 'merge',
          ...options,
        })
        
        if (isMounted) {
          setIsInitialized(true)
          
          // Load data from server on login
          toast.loading("Загрузка данных...", { id: "sync-load" })
          const success = await syncEngineV2.pullFromServer()
          if (success) {
            toast.success("Данные загружены", { id: "sync-load" })
          } else {
            toast.dismiss("sync-load")
          }
        }
      } catch (error) {
        console.error("Failed to initialize sync:", error)
        toast.error("Ошибка настройки синхронизации")
        toast.dismiss("sync-load")
      }
    }

    init()

    return () => {
      isMounted = false
      syncEngineV2.destroy()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id])

  // Subscribe to state changes
  useEffect(() => {
    if (!isInitialized) return

    const unsubscribe = syncEngineV2.subscribe((state) => {
      setStatus(state.status)
      setLastSync(state.lastSync)
      setPendingCount(state.pendingCount)
      setError(state.error)
      setConflicts(state.conflicts)

      // Show conflict dialog
      if (state.conflicts.length > 0 && !showConflictDialog) {
        setShowConflictDialog(true)
      }

      // Show offline toast only once per session
      if (state.status === 'offline' && !offlineToastShownRef.current) {
        offlineToastShownRef.current = true
        toast.warning("Нет подключения к интернету", {
          description: "Изменения будут синхронизированы позже",
        })
      } else if (state.status !== 'offline') {
        offlineToastShownRef.current = false
      }
    })

    return unsubscribe
  }, [isInitialized, showConflictDialog])

  const sync = async () => {
    const result = await syncEngineV2.sync()
    if (result) {
      toast.success("Данные синхронизированы")
    }
    return result
  }

  const pull = async () => {
    return syncEngineV2.pullFromServer()
  }

  const forceSync = async () => {
    const result = await syncEngineV2.forceSync()
    if (result) {
      toast.success("Синхронизация выполнена")
    } else {
      toast.error("Ошибка синхронизации")
    }
    return result
  }

  const handleResolveConflicts = async (
    resolutions: Map<string, ConflictResolution>
  ) => {
    await syncEngineV2.resolveConflicts(resolutions)
    setShowConflictDialog(false)
    toast.success("Конфликты разрешены")
  }

  const handleResolveAll = (strategy: ConflictResolution) => {
    const resolutions = new Map<string, ConflictResolution>()
    conflicts.forEach(c => resolutions.set(c.entityId, strategy))
    handleResolveConflicts(resolutions)
  }

  const value: SyncContextValue = {
    status,
    lastSync,
    pendingCount,
    error,
    isOnline: status !== 'offline',
    isSyncing: status === 'syncing',
    sync,
    pull,
    forceSync,
  }

  return (
    <SyncContext.Provider value={value}>
      {children}
      
      {/* Conflict Resolution Dialog */}
      {conflicts.length > 0 && (
        <ConflictDialog
          conflicts={conflicts}
          open={showConflictDialog}
          onOpenChange={setShowConflictDialog}
          onResolve={handleResolveConflicts}
          onResolveAll={handleResolveAll}
        />
      )}
    </SyncContext.Provider>
  )
}

export function useSync() {
  const context = useContext(SyncContext)
  if (!context) {
    throw new Error("useSync must be used within SyncProviderV2")
  }
  return context
}
