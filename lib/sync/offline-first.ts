// ============================================
// OFFLINE-FIRST SYNC ENGINE - Bridge to V2
// ============================================

import { syncEngineV2 } from "./sync-engine-v2"
import { getStore, setStore } from "@/lib/store/utils/storage"

const SYNC_QUEUE_KEY = "lifeos_sync_queue"
const LAST_SYNC_KEY = "lifeos_last_sync"

// ============================================
// TYPES
// ============================================

export interface SyncOperation {
  id: string
  table: string
  operation: "insert" | "update" | "delete"
  recordId: string
  data?: Record<string, unknown>
  timestamp: number
  retryCount: number
  error?: string
}

export interface SyncState {
  isOnline: boolean
  isSyncing: boolean
  lastSync: number | null
  pendingCount: number
  error: string | null
}

// ============================================
// SYNC QUEUE MANAGEMENT (Legacy API → V2)
// ============================================

export function getSyncQueue(): SyncOperation[] {
  // Return queue from V2 engine
  const items = syncEngineV2.getQueueItems()
  return items.map(item => ({
    id: item.id,
    table: item.table,
    operation: item.operation === 'create' ? 'insert' : item.operation,
    recordId: item.data.id as string,
    data: item.data,
    timestamp: new Date(item.timestamp).getTime(),
    retryCount: item.retryCount,
  }))
}

export function addToQueue(operation: Omit<SyncOperation, "id" | "timestamp" | "retryCount">): void {
  // Map legacy operation to V2 engine
  const table = operation.table
  const op = operation.operation === 'insert' ? 'create' : operation.operation
  const data = operation.data || { id: operation.recordId }
  
  syncEngineV2.enqueue(table, op as any, data)
}

export function removeFromQueue(operationId: string): void {
  // V2 manages its own queue
  const queue = syncEngineV2.getQueueItems()
  const newQueue = queue.filter(op => op.id !== operationId)
  // Note: V2 doesn't expose direct queue modification
  // This is handled internally
}

export function updateQueueItem(operationId: string, updates: Partial<SyncOperation>): void {
  // V2 manages its own queue
}

export function clearQueue(): void {
  syncEngineV2.clearQueue()
}

// ============================================
// SYNC STATE
// ============================================

let currentState: SyncState = {
  isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
  isSyncing: false,
  lastSync: null,
  pendingCount: 0,
  error: null,
}

const listeners = new Set<(state: SyncState) => void>()

export function getSyncState(): SyncState {
  const v2State = syncEngineV2.getState()
  return {
    isOnline: v2State.status !== 'offline',
    isSyncing: v2State.status === 'syncing',
    lastSync: v2State.lastSync ? new Date(v2State.lastSync).getTime() : null,
    pendingCount: v2State.pendingCount,
    error: v2State.error,
  }
}

export function subscribeToSyncState(callback: (state: SyncState) => void) {
  listeners.add(callback)
  
  // Also subscribe to V2 engine
  const unsubscribe = syncEngineV2.subscribe((state) => {
    const legacyState: SyncState = {
      isOnline: state.status !== 'offline',
      isSyncing: state.status === 'syncing',
      lastSync: state.lastSync ? new Date(state.lastSync).getTime() : null,
      pendingCount: state.pendingCount,
      error: state.error,
    }
    callback(legacyState)
  })
  
  return () => {
    listeners.delete(callback)
    unsubscribe()
  }
}

function triggerSyncStateChange() {
  const state = getSyncState()
  listeners.forEach(cb => cb(state))
}

// ============================================
// SYNC EXECUTION
// ============================================

export async function processSyncQueue(): Promise<{ success: boolean; errors: string[] }> {
  const success = await syncEngineV2.sync()
  return {
    success,
    errors: syncEngineV2.getState().error ? [syncEngineV2.getState().error!] : [],
  }
}

export async function forceSync(): Promise<boolean> {
  return syncEngineV2.forceSync()
}

// ============================================
// LAST SYNC TIME
// ============================================

export function getLastSyncTime(): number | null {
  const state = syncEngineV2.getState()
  return state.lastSync ? new Date(state.lastSync).getTime() : null
}

export function setLastSyncTime(timestamp: number): void {
  // Managed by V2 engine
}

// ============================================
// INITIALIZATION
// ============================================

export function initializeSync(): void {
  // V2 engine is initialized by SyncProviderV2
  // This function is kept for backward compatibility
}

// ============================================
// HELPERS
// ============================================

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// ============================================
// NETWORK STATUS
// ============================================

if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    triggerSyncStateChange()
  })

  window.addEventListener("offline", () => {
    triggerSyncStateChange()
  })
}

// ============================================
// LEGACY COMPATIBILITY
// ============================================

export async function syncPendingChanges(): Promise<boolean> {
  return syncEngineV2.sync()
}

export function hasPendingChanges(): boolean {
  return syncEngineV2.getState().pendingCount > 0
}
