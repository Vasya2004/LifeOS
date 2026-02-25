// ============================================
// CLOUD SYNC - Supabase Integration
// ============================================

import { getStore, setStore } from "@/lib/store/utils/storage"
import { getCurrentUserId } from "@/lib/auth/user-id"
import { exportAllData, importAllData } from "@/lib/store/legacy"
import { CURRENT_DATA_VERSION } from "@/lib/store/migrations"
import { toast } from "sonner"

const SYNC_INTERVAL = 5 * 60 * 1000 // 5 minutes
const LAST_SYNC_KEY = "last_sync_timestamp"

// ============================================
// Sync Status
// ============================================

export interface SyncStatus {
  isOnline: boolean
  isSyncing: boolean
  lastSync: string | null
  pendingChanges: boolean
  pendingCount: number
  error: string | null
}

let currentStatus: SyncStatus = {
  isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
  isSyncing: false,
  lastSync: null,
  pendingChanges: false,
  pendingCount: 0,
  error: null,
}

const statusListeners: Set<(status: SyncStatus) => void> = new Set()

export function getSyncStatus(): SyncStatus {
  return { ...currentStatus }
}

export function subscribeToSyncStatus(callback: (status: SyncStatus) => void) {
  statusListeners.add(callback)
  return () => statusListeners.delete(callback)
}

function updateStatus(updates: Partial<SyncStatus>) {
  currentStatus = { ...currentStatus, ...updates }
  statusListeners.forEach(cb => cb(currentStatus))
}

// ============================================
// Network Status
// ============================================

if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    updateStatus({ isOnline: true })
    toast.success("Подключение восстановлено")
    // Auto-sync when back online
    syncToCloud()
  })

  window.addEventListener("offline", () => {
    updateStatus({ isOnline: false, error: "Нет подключения" })
    toast.warning("Нет подключения к интернету")
  })
}

// ============================================
// Load from Cloud
// ============================================

export async function loadFromCloud(): Promise<boolean> {
  const userId = getCurrentUserId()
  const isGuestModeLocal = typeof window !== "undefined" && localStorage.getItem("lifeos_guest_mode") === "true"
  const isGuest = userId === "guest-user-id" || userId === "anonymous" || userId.includes("guest") || isGuestModeLocal

  if (isGuest) {
    console.log("[CloudSync] Skipping cloud load — no authenticated user")
    return true
  }

  try {
    updateStatus({ isSyncing: true, error: null })

    const response = await fetch("/api/sync")
    if (!response.ok) {
      // 401 = не авторизован, 500/503 = сервис недоступен — тихо пропускаем
      if (response.status === 401 || response.status === 500 || response.status === 503) {
        updateStatus({ isSyncing: false })
        return false
      }
      throw new Error(`HTTP ${response.status}`)
    }

    const { data, version } = await response.json()

    if (data && Object.keys(data).length > 0) {
      // Merge cloud data with local data (cloud wins for conflicts)
      const result = importAllData(data)

      if (result.success) {
        setStore(LAST_SYNC_KEY, new Date().toISOString())
        updateStatus({
          isSyncing: false,
          lastSync: new Date().toISOString(),
          pendingChanges: false
        })
        return true
      } else {
        throw new Error(result.error || "Failed to import data")
      }
    }

    updateStatus({ isSyncing: false })
    return true
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error"
    console.error("[CloudSync] Load failed:", errorMsg)
    updateStatus({ isSyncing: false, error: errorMsg })
    return false
  }
}

// ============================================
// Save to Cloud
// ============================================

export async function syncToCloud(): Promise<boolean> {
  const userId = getCurrentUserId()
  const isGuestModeLocal = typeof window !== "undefined" && localStorage.getItem("lifeos_guest_mode") === "true"
  const isGuest = userId === "guest-user-id" || userId === "anonymous" || userId.includes("guest") || isGuestModeLocal

  if (isGuest) {
    console.log("[CloudSync] Skipping cloud save — no authenticated user")
    return true
  }
  if (!currentStatus.isOnline) {
    updateStatus({ pendingChanges: true })
    return false
  }

  if (currentStatus.isSyncing) return false

  try {
    updateStatus({ isSyncing: true, error: null })

    const data = exportAllData()

    const response = await fetch("/api/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data,
        version: CURRENT_DATA_VERSION,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP ${response.status}`)
    }

    setStore(LAST_SYNC_KEY, new Date().toISOString())
    updateStatus({
      isSyncing: false,
      lastSync: new Date().toISOString(),
      pendingChanges: false
    })

    return true
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error"
    console.error("[CloudSync] Save failed:", errorMsg)
    updateStatus({
      isSyncing: false,
      error: errorMsg,
      pendingChanges: true
    })
    return false
  }
}

// ============================================
// Auto Sync
// ============================================

let autoSyncInterval: NodeJS.Timeout | null = null

export function startAutoSync() {
  if (autoSyncInterval) return

  // Initial sync
  loadFromCloud()

  // Periodic sync
  autoSyncInterval = setInterval(() => {
    if (currentStatus.pendingChanges && currentStatus.isOnline) {
      syncToCloud()
    }
  }, SYNC_INTERVAL)
}

export function stopAutoSync() {
  if (autoSyncInterval) {
    clearInterval(autoSyncInterval)
    autoSyncInterval = null
  }
}

// ============================================
// Mark Pending Changes
// ============================================

export function markPendingChanges() {
  updateStatus({ pendingChanges: true })
}

// ============================================
// Clear Cloud Data
// ============================================

export async function clearCloudData(): Promise<boolean> {
  try {
    const response = await fetch("/api/sync", {
      method: "DELETE",
    })

    return response.ok
  } catch (error) {
    console.error("[CloudSync] Clear failed:", error)
    return false
  }
}

// ============================================
// Last Sync Time
// ============================================

export function getLastSyncTime(): string | null {
  return getStore<string | null>(LAST_SYNC_KEY, null)
}

// ============================================
// Force Sync (manual)
// ============================================

export async function forceSync(): Promise<{ success: boolean; message: string }> {
  updateStatus({ pendingChanges: true })

  const success = await syncToCloud()

  if (success) {
    return { success: true, message: "Данные синхронизированы" }
  } else {
    return {
      success: false,
      message: currentStatus.error || "Ошибка синхронизации"
    }
  }
}
