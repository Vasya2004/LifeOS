// ============================================
// SYNC HOOKS - React hooks for sync state
// ============================================

"use client"

import { useEffect, useState, useCallback } from "react"
import { syncEngine } from "./sync-engine"
import type { SyncState } from "./sync-engine"

export function useSyncState() {
  const [state, setState] = useState<SyncState>(syncEngine.getState())

  useEffect(() => {
    return syncEngine.subscribe(setState)
  }, [])

  const sync = useCallback(() => syncEngine.sync(), [])
  const pull = useCallback(() => syncEngine.pullFromServer(), [])

  return {
    ...state,
    sync,
    pull,
    isOnline: state.status !== "offline",
    hasPendingChanges: state.pendingCount > 0,
  }
}

export function useSyncIndicator() {
  const { status, pendingCount, hasPendingChanges, error } = useSyncState()

  let indicator: { color: string; text: string; icon: string } = {
    color: "gray",
    text: "Синхронизировано",
    icon: "check",
  }

  switch (status) {
    case "syncing":
      indicator = { color: "blue", text: "Синхронизация...", icon: "sync" }
      break
    case "error":
      indicator = { 
        color: "red", 
        text: error || "Ошибка синхронизации", 
        icon: "error" 
      }
      break
    case "offline":
      indicator = { 
        color: "orange", 
        text: hasPendingChanges 
          ? `Офлайн (${pendingCount} ожидают)` 
          : "Офлайн режим", 
        icon: "offline" 
      }
      break
    default:
      if (hasPendingChanges) {
        indicator = { 
          color: "yellow", 
          text: `${pendingCount} изменений ожидают`, 
          icon: "pending" 
        }
      }
  }

  return indicator
}
