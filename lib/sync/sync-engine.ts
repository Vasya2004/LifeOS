// ============================================
// SYNC ENGINE - Offline-first synchronization
// ============================================

import { createClient } from "@/lib/supabase/client"
import { KEYS } from "@/lib/store/keys"
import { getStore, setStore } from "@/lib/store/utils/storage"
import type { StoreKey } from "@/lib/store/keys"

export type SyncStatus = "idle" | "syncing" | "error" | "offline"
export type SyncOperation = "create" | "update" | "delete"

export interface SyncQueueItem {
  id: string
  table: string
  operation: SyncOperation
  data: Record<string, unknown>
  timestamp: string
  retryCount: number
}

export interface SyncState {
  status: SyncStatus
  lastSync: string | null
  pendingCount: number
  error: string | null
}

const SYNC_QUEUE_KEY = "syncQueue"
const LAST_SYNC_KEY = "lastSync"
const MAX_RETRIES = 3

class SyncEngine {
  private syncStateListeners: ((state: SyncState) => void)[] = []
  private currentState: SyncState = {
    status: "idle",
    lastSync: null,
    pendingCount: 0,
    error: null,
  }

  // ============ State Management ============

  private updateState(updates: Partial<SyncState>) {
    this.currentState = { ...this.currentState, ...updates }
    this.syncStateListeners.forEach(listener => listener(this.currentState))
  }

  subscribe(listener: (state: SyncState) => void): () => void {
    this.syncStateListeners.push(listener)
    listener(this.currentState) // Initial call
    return () => {
      this.syncStateListeners = this.syncStateListeners.filter(l => l !== listener)
    }
  }

  getState(): SyncState {
    return this.currentState
  }

  // ============ Queue Management ============

  private getQueue(): SyncQueueItem[] {
    return getStore<SyncQueueItem[]>(SYNC_QUEUE_KEY, [])
  }

  private setQueue(queue: SyncQueueItem[]) {
    setStore(SYNC_QUEUE_KEY, queue)
    this.updateState({ pendingCount: queue.length })
  }

  enqueue(table: string, operation: SyncOperation, data: Record<string, unknown>) {
    const queue = this.getQueue()
    const existingIndex = queue.findIndex(
      item => item.table === table && item.data.id === data.id
    )

    // If updating an item that's already in queue, merge operations
    if (existingIndex >= 0) {
      const existing = queue[existingIndex]
      
      // If existing is "create" and new is "delete", remove from queue entirely
      if (existing.operation === "create" && operation === "delete") {
        queue.splice(existingIndex, 1)
        this.setQueue(queue)
        return
      }
      
      // Otherwise update the existing item
      queue[existingIndex] = {
        ...existing,
        operation: existing.operation === "create" ? "create" : operation,
        data: { ...existing.data, ...data },
        timestamp: new Date().toISOString(),
      }
    } else {
      queue.push({
        id: crypto.randomUUID(),
        table,
        operation,
        data,
        timestamp: new Date().toISOString(),
        retryCount: 0,
      })
    }

    this.setQueue(queue)
    this.triggerSync()
  }

  // ============ Sync Logic ============

  async sync(): Promise<boolean> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      this.updateState({ status: "error", error: "Not authenticated" })
      return false
    }

    const queue = this.getQueue()
    if (queue.length === 0) {
      this.updateState({ status: "idle" })
      return true
    }

    this.updateState({ status: "syncing", error: null })

    const processed: string[] = []
    const failed: SyncQueueItem[] = []

    for (const item of queue) {
      try {
        const success = await this.processSyncItem(supabase, item, user.id)
        if (success) {
          processed.push(item.id)
        } else {
          failed.push({ ...item, retryCount: item.retryCount + 1 })
        }
      } catch (error) {
        console.error(`Sync error for ${item.table}:`, error)
        if (item.retryCount < MAX_RETRIES) {
          failed.push({ ...item, retryCount: item.retryCount + 1 })
        }
      }
    }

    // Update queue with failed items that haven't exceeded max retries
    const newQueue = failed.filter(item => item.retryCount < MAX_RETRIES)
    this.setQueue(newQueue)

    // Update last sync timestamp
    if (processed.length > 0) {
      const lastSync = new Date().toISOString()
      setStore(LAST_SYNC_KEY, lastSync)
      this.updateState({ lastSync })
    }

    // Update status
    if (newQueue.length > 0) {
      this.updateState({ 
        status: "error", 
        error: `${newQueue.length} items failed to sync` 
      })
      return false
    }

    this.updateState({ status: "idle" })
    return true
  }

  private async processSyncItem(
    supabase: ReturnType<typeof createClient>,
    item: SyncQueueItem,
    userId: string
  ): Promise<boolean> {
    const { table, operation, data } = item

    switch (operation) {
      case "create":
        const { error: createError } = await supabase
          .from(table)
          .insert({ ...data, user_id: userId })
        return !createError

      case "update":
        const { error: updateError } = await supabase
          .from(table)
          .update(data)
          .eq("id", data.id)
          .eq("user_id", userId)
        return !updateError

      case "delete":
        const { error: deleteError } = await supabase
          .from(table)
          .delete()
          .eq("id", data.id)
          .eq("user_id", userId)
        return !deleteError

      default:
        return false
    }
  }

  private syncTimeout: NodeJS.Timeout | null = null

  private triggerSync() {
    // Debounce sync
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout)
    }
    this.syncTimeout = setTimeout(() => this.sync(), 1000)
  }

  // ============ Full Sync (Pull) ============

  async pullFromServer(): Promise<boolean> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return false

    this.updateState({ status: "syncing" })

    try {
      const tables = [
        "goals", "tasks", "habits", "projects", 
        "accounts", "transactions", "financial_goals",
        "skills", "health_metrics"
      ]

      const lastSync = getStore<string | null>(LAST_SYNC_KEY, null)

      for (const table of tables) {
        let query = supabase
          .from(table)
          .select("*")
          .eq("user_id", user.id)

        if (lastSync) {
          query = query.gt("updated_at", lastSync)
        }

        const { data, error } = await query

        if (error) throw error

        if (data && data.length > 0) {
          // Merge with local data
          this.mergeLocalData(table, data)
        }
      }

      const newLastSync = new Date().toISOString()
      setStore(LAST_SYNC_KEY, newLastSync)
      this.updateState({ status: "idle", lastSync: newLastSync })

      return true
    } catch (error) {
      console.error("Pull sync error:", error)
      this.updateState({ status: "error", error: "Failed to sync from server" })
      return false
    }
  }

  private mergeLocalData(table: string, serverData: Record<string, unknown>[]) {
    const storeKey = this.tableToStoreKey(table)
    if (!storeKey) return

    const localData = getStore<Record<string, unknown>[]>(storeKey, [])
    const localMap = new Map(localData.map(item => [item.id as string, item]))

    for (const serverItem of serverData) {
      const localItem = localMap.get(serverItem.id as string)
      
      if (!localItem) {
        // New item from server
        localMap.set(serverItem.id as string, serverItem)
      } else {
        // Compare timestamps and take newer
        const serverTime = new Date(serverItem.updated_at as string).getTime()
        const localTime = new Date(localItem.updated_at as string || 0).getTime()
        
        if (serverTime > localTime) {
          localMap.set(serverItem.id as string, serverItem)
        }
      }
    }

    setStore(storeKey, Array.from(localMap.values()))
  }

  private tableToStoreKey(table: string): StoreKey | null {
    const mapping: Record<string, StoreKey> = {
      goals: KEYS.goals,
      tasks: KEYS.tasks,
      habits: KEYS.habits,
      projects: KEYS.projects,
      accounts: KEYS.accounts,
      transactions: KEYS.transactions,
      financial_goals: KEYS.financialGoals,
      skills: KEYS.skills,
      health_metrics: KEYS.healthMetrics,
    }
    return mapping[table] || null
  }

  // ============ Network Status ============

  setupNetworkListeners() {
    if (typeof window === "undefined") return

    window.addEventListener("online", () => {
      this.updateState({ status: "idle" })
      this.sync()
    })

    window.addEventListener("offline", () => {
      this.updateState({ status: "offline" })
    })

    // Check initial state
    if (!navigator.onLine) {
      this.updateState({ status: "offline" })
    }
  }
}

// Singleton instance
export const syncEngine = new SyncEngine()
