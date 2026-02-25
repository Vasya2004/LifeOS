// ============================================
// OFFLINE-FIRST SYNC ENGINE
// ============================================

import { createClient } from "@/lib/supabase/client"
import { getStore, setStore } from "@/lib/store/utils/storage"
import type { DatabaseError } from "@/lib/api/database"

const supabase = createClient()
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
// SYNC QUEUE MANAGEMENT
// ============================================

export function getSyncQueue(): SyncOperation[] {
  return getStore<SyncOperation[]>(SYNC_QUEUE_KEY, [])
}

export function addToQueue(operation: Omit<SyncOperation, "id" | "timestamp" | "retryCount">): void {
  const queue = getSyncQueue()
  const newOperation: SyncOperation = {
    ...operation,
    id: generateId(),
    timestamp: Date.now(),
    retryCount: 0,
  }

  // Remove duplicate operations for same record
  const filtered = queue.filter(op => !(op.table === operation.table && op.recordId === operation.recordId))
  filtered.push(newOperation)

  setStore(SYNC_QUEUE_KEY, filtered)
  triggerSyncStateChange()
}

export function removeFromQueue(operationId: string): void {
  const queue = getSyncQueue()
  setStore(SYNC_QUEUE_KEY, queue.filter(op => op.id !== operationId))
  triggerSyncStateChange()
}

export function updateQueueItem(operationId: string, updates: Partial<SyncOperation>): void {
  const queue = getSyncQueue()
  setStore(SYNC_QUEUE_KEY, queue.map(op =>
    op.id === operationId ? { ...op, ...updates } : op
  ))
  triggerSyncStateChange()
}

export function clearQueue(): void {
  setStore(SYNC_QUEUE_KEY, [])
  triggerSyncStateChange()
}

// ============================================
// SYNC STATE
// ============================================

const syncListeners: Set<(state: SyncState) => void> = new Set()

export function getSyncState(): SyncState {
  return {
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    isSyncing: getStore("lifeos_is_syncing", false),
    lastSync: getStore<number | null>(LAST_SYNC_KEY, null),
    pendingCount: getSyncQueue().length,
    error: getStore<string | null>("lifeos_sync_error", null),
  }
}

export function subscribeToSyncState(callback: (state: SyncState) => void): () => void {
  syncListeners.add(callback)
  callback(getSyncState())

  return () => syncListeners.delete(callback)
}

function triggerSyncStateChange(): void {
  const state = getSyncState()
  syncListeners.forEach(cb => cb(state))
}

function setIsSyncing(value: boolean): void {
  setStore("lifeos_is_syncing", value)
  triggerSyncStateChange()
}

function setLastSync(timestamp: number): void {
  setStore(LAST_SYNC_KEY, timestamp)
  triggerSyncStateChange()
}

function setSyncError(error: string | null): void {
  setStore("lifeos_sync_error", error)
  triggerSyncStateChange()
}

// ============================================
// NETWORK STATUS
// ============================================

export function initNetworkListeners(): () => void {
  if (typeof window === "undefined") return () => { }

  const handleOnline = () => {
    triggerSyncStateChange()
    // Auto-sync when coming back online
    setTimeout(() => processSyncQueue(), 1000)
  }

  const handleOffline = () => {
    triggerSyncStateChange()
  }

  window.addEventListener("online", handleOnline)
  window.addEventListener("offline", handleOffline)

  return () => {
    window.removeEventListener("online", handleOnline)
    window.removeEventListener("offline", handleOffline)
  }
}

// ============================================
// SYNC PROCESSOR
// ============================================

const MAX_RETRIES = 3
const RETRY_DELAY = 5000

export async function processSyncQueue(): Promise<{ success: boolean; errors: string[] }> {
  const queue = getSyncQueue()

  if (queue.length === 0) {
    return { success: true, errors: [] }
  }

  if (!navigator.onLine) {
    return { success: false, errors: ["Device is offline"] }
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, errors: ["Not authenticated"] }
  }

  setIsSyncing(true)
  setSyncError(null)

  const errors: string[] = []

  // Process operations in order
  for (const operation of [...queue]) {
    try {
      await processOperation(operation, user.id)
      removeFromQueue(operation.id)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"

      if (operation.retryCount >= MAX_RETRIES) {
        // Move to dead letter queue or log
        console.error(`Sync failed after ${MAX_RETRIES} retries:`, {
          operationId: operation.id,
          table: operation.table,
          recordId: operation.recordId,
          errorMessage,
          errorDetails: error && typeof error === 'object' ? {
            code: (error as any).code,
            message: (error as any).message,
            details: (error as any).details,
            hint: (error as any).hint,
          } : error
        })
        removeFromQueue(operation.id)
        errors.push(`${operation.table}/${operation.recordId}: ${errorMessage}`)
      } else {
        updateQueueItem(operation.id, {
          retryCount: operation.retryCount + 1,
          error: errorMessage,
        })
      }
    }
  }

  setIsSyncing(false)
  setLastSync(Date.now())

  if (errors.length > 0) {
    setSyncError(`${errors.length} items failed to sync`)
  }

  return { success: errors.length === 0, errors }
}

// ============================================
// FIELD CONVERSION (camelCase → snake_case)
// ============================================

function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, m => "_" + m.toLowerCase())
}

// Special field name overrides that don't follow simple camelCase→snake_case
const FIELD_OVERRIDES: Record<string, Record<string, string>> = {
  tasks: { project_id: "goal_id" },        // Task.projectId → tasks.goal_id
  transactions: { date: "transaction_date" },
}

// Fields that should not be sent to the database
const IGNORED_FIELDS: Record<string, string[]> = {
  goals: ["relatedRoles"],
  habits: ["entries"],
  skills: ["activities", "certificates", "decayLogs", "userId"],
  roles: ["areaId"], // In case we add roles table later
}

function convertToDbFormat(
  table: string,
  data: Record<string, unknown>,
  userId: string
): Record<string, unknown> {
  const overrides = FIELD_OVERRIDES[table] || {}
  const result: Record<string, unknown> = { user_id: userId }

  for (const [key, value] of Object.entries(data)) {
    if (key === "id") {
      result["id"] = value
      continue
    }

    // Skip ignored fields and external userId to avoid collision
    if (key === "userId" || IGNORED_FIELDS[table]?.includes(key)) {
      continue
    }

    const snakeKey = camelToSnake(key)
    result[overrides[snakeKey] ?? snakeKey] = value
  }

  return result
}

async function processOperation(operation: SyncOperation, userId: string): Promise<void> {
  const { table, operation: opType, recordId, data } = operation

  // Map table names
  const tableName = mapTableName(table)

  switch (opType) {
    case "insert":
      if (!data) throw new Error("No data for insert")
      const dbInsertData = convertToDbFormat(table, data, userId)
      const { error: insertError } = await supabase
        .from(tableName)
        .insert(dbInsertData)
      if (insertError) throw insertError
      break

    case "update":
      if (!data) throw new Error("No data for update")
      const dbUpdateData = convertToDbFormat(table, data, userId)
      const { error: updateError } = await supabase
        .from(tableName)
        .update(dbUpdateData)
        .eq("id", recordId)
        .eq("user_id", userId)
      if (updateError) throw updateError
      break

    case "delete":
      const { error: deleteError } = await supabase
        .from(tableName)
        .delete()
        .eq("id", recordId)
        .eq("user_id", userId)
      if (deleteError) throw deleteError
      break
  }
}

function mapTableName(table: string): string {
  const mapping: Record<string, string> = {
    areas: "life_areas",
    values: "core_values",
    goals: "goals",
    tasks: "tasks",
    habits: "habits",
    skills: "skills",
    accounts: "accounts",
    transactions: "transactions",
    stats: "user_stats",
  }
  return mapping[table] || table
}

// ============================================
// HYBRID DATA ACCESS (Offline-first wrapper)
// ============================================

export async function syncFromServer<T>(
  table: string,
  localGetter: () => T[],
  localSetter: (items: T[]) => void,
  serverGetter: () => Promise<T[]>
): Promise<T[]> {
  // Always return local data first
  const localData = localGetter()

  // Then try to sync from server if online
  if (navigator.onLine) {
    try {
      const serverData = await serverGetter()
      localSetter(serverData)
      setLastSync(Date.now())
      return serverData
    } catch (error) {
      console.warn("Failed to sync from server, using local data:", error)
      return localData
    }
  }

  return localData
}

export async function syncToServer<T extends { id: string }>(
  operation: "insert" | "update" | "delete",
  table: string,
  record: T | string,
  localUpdater: () => void
): Promise<void> {
  // Update local state immediately (optimistic update)
  localUpdater()

  // Queue for server sync
  const recordId = typeof record === "string" ? record : record.id
  const data = typeof record === "string" ? undefined : record as Record<string, unknown>

  addToQueue({
    table,
    operation,
    recordId,
    data,
  })

  // Try immediate sync if online
  if (navigator.onLine) {
    processSyncQueue().catch(console.error)
  }
}

// ============================================
// UTILS
// ============================================

function generateId(): string {
  try {
    if (typeof window !== "undefined" && window.crypto?.randomUUID) {
      return window.crypto.randomUUID()
    }
  } catch (e) {
    // Ignore and use fallback
  }

  // Robust UUID v4 fallback
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// Auto-sync interval
let syncInterval: NodeJS.Timeout | null = null

export function startAutoSync(intervalMs: number = 30000): () => void {
  if (syncInterval) clearInterval(syncInterval)

  syncInterval = setInterval(() => {
    if (navigator.onLine && getSyncQueue().length > 0) {
      processSyncQueue()
    }
  }, intervalMs)

  return () => {
    if (syncInterval) {
      clearInterval(syncInterval)
      syncInterval = null
    }
  }
}

// Manual sync trigger
export async function forceSync(): Promise<{ success: boolean; message: string }> {
  if (!navigator.onLine) {
    return { success: false, message: "Device is offline" }
  }

  const { errors } = await processSyncQueue()

  if (errors.length === 0) {
    return { success: true, message: "Sync completed successfully" }
  } else {
    return { success: false, message: `Sync completed with ${errors.length} errors` }
  }
}
