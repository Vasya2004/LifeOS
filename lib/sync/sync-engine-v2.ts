// ============================================
// SYNC ENGINE V2 - Realtime + Conflict Resolution
// ============================================

import { createClient, SupabaseClient } from "@/lib/supabase/client"
import { RealtimeChannel } from "@supabase/supabase-js"
import { KEYS } from "@/lib/store/keys"
import { getStore, setStore } from "@/lib/store/utils/storage"
import type { StoreKey } from "@/lib/store/keys"
import { 
  VersionedEntity, 
  createVersionedEntity, 
  incrementVersion,
  resolveBatchConflicts,
  Conflict,
  ConflictResolution 
} from "./conflict-resolver"
import { createVersion } from "./versioning"

export type SyncStatus = "idle" | "syncing" | "error" | "offline" | "conflict"
export type SyncOperation = "create" | "update" | "delete"

export interface SyncQueueItem {
  id: string
  table: string
  operation: SyncOperation
  data: Record<string, unknown>
  timestamp: string
  retryCount: number
  version?: number
  vectorClock?: Record<string, number>
}

export interface SyncState {
  status: SyncStatus
  lastSync: string | null
  pendingCount: number
  error: string | null
  conflicts: Conflict<Record<string, unknown>>[]
}

export interface SyncOptions {
  enableRealtime?: boolean
  autoSync?: boolean
  syncInterval?: number // ms
  conflictStrategy?: ConflictResolution
}

const SYNC_QUEUE_KEY = "syncQueue_v2"
const LAST_SYNC_KEY = "lastSync_v2"
const MAX_RETRIES = 3
const DEFAULT_SYNC_INTERVAL = 5 * 60 * 1000 // 5 minutes

// Table to store key mapping
const TABLE_TO_KEY: Record<string, StoreKey> = {
  identities: KEYS.identity,
  core_values: KEYS.values,
  life_areas: KEYS.areas,
  roles: KEYS.roles,
  goals: KEYS.goals,
  milestones: KEYS.projects, // mapped
  projects: KEYS.projects,
  tasks: KEYS.tasks,
  habits: KEYS.habits,
  habit_entries: KEYS.habits, // nested
  daily_reviews: KEYS.dailyReviews,
  weekly_reviews: KEYS.weeklyReviews,
  journal_entries: KEYS.journal,
  user_stats: KEYS.stats,
  wishes: KEYS.wishes,
  achievements: KEYS.achievements,
  accounts: KEYS.accounts,
  transactions: KEYS.transactions,
  financial_goals: KEYS.financialGoals,
  budgets: KEYS.budgets,
  body_zones: KEYS.bodyZones,
  medical_documents: KEYS.medicalDocuments,
  health_metrics: KEYS.healthMetrics,
  health_profiles: KEYS.healthProfile,
  skills: KEYS.skills,
  skill_activities: KEYS.skillActivities,
  skill_certificates: KEYS.skillCertificates,
  skill_decay_logs: KEYS.skillDecayLogs,
}

// Tables that support realtime
const REALTIME_TABLES = [
  'tasks',
  'habits', 
  'goals',
  'projects',
  'user_stats',
  'transactions',
  'health_metrics',
  'skills',
]

class SyncEngineV2 {
  private supabase: SupabaseClient | null = null
  private channels: Map<string, RealtimeChannel> = new Map()
  private syncStateListeners: Set<(state: SyncState) => void> = new Set()
  private currentState: SyncState = {
    status: "idle",
    lastSync: null,
    pendingCount: 0,
    error: null,
    conflicts: [],
  }
  private options: SyncOptions = {
    enableRealtime: true,
    autoSync: true,
    syncInterval: DEFAULT_SYNC_INTERVAL,
    conflictStrategy: 'merge',
  }
  private syncIntervalId: NodeJS.Timeout | null = null
  private syncTimeout: NodeJS.Timeout | null = null
  private isInitialized = false

  // ============ Initialization ============

  async initialize(options?: Partial<SyncOptions>): Promise<void> {
    if (this.isInitialized) return

    this.options = { ...this.options, ...options }
    this.supabase = createClient()

    // Setup network listeners
    this.setupNetworkListeners()

    // Setup realtime if enabled
    if (this.options.enableRealtime) {
      await this.setupRealtimeSubscriptions()
    }

    // Setup auto sync
    if (this.options.autoSync) {
      this.startAutoSync()
    }

    // Initial sync
    await this.pullFromServer()

    this.isInitialized = true
  }

  destroy(): void {
    this.stopAutoSync()
    this.unsubscribeAll()
    this.channels.forEach(channel => channel.unsubscribe())
    this.channels.clear()
    this.isInitialized = false
  }

  // ============ State Management ============

  private updateState(updates: Partial<SyncState>) {
    this.currentState = { ...this.currentState, ...updates }
    this.syncStateListeners.forEach(listener => listener(this.currentState))
  }

  subscribe(listener: (state: SyncState) => void): () => void {
    this.syncStateListeners.add(listener)
    listener(this.currentState) // Initial call
    return () => this.syncStateListeners.delete(listener)
  }

  getState(): SyncState {
    return { ...this.currentState }
  }

  // ============ Realtime Subscriptions ============

  private async setupRealtimeSubscriptions(): Promise<void> {
    if (!this.supabase) return

    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) return

    for (const table of REALTIME_TABLES) {
      const channel = this.supabase
        .channel(`sync-${table}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: table,
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => this.handleRealtimeChange(table, payload)
        )
        .subscribe()

      this.channels.set(table, channel)
    }
  }

  private async handleRealtimeChange(
    table: string, 
    payload: {
      eventType: 'INSERT' | 'UPDATE' | 'DELETE'
      new: Record<string, unknown>
      old: Record<string, unknown>
    }
  ): Promise<void> {
    const storeKey = TABLE_TO_KEY[table]
    if (!storeKey) return

    const localData = getStore<VersionedEntity<Record<string, unknown>>[]>(storeKey, [])
    const localMap = new Map(localData.map(item => [item.id, item]))

    switch (payload.eventType) {
      case 'INSERT':
      case 'UPDATE':
        const serverEntity = payload.new as VersionedEntity<Record<string, unknown>>
        const localEntity = localMap.get(serverEntity.id)

        if (!localEntity) {
          // New entity from server - add it
          localMap.set(serverEntity.id, serverEntity)
        } else {
          // Compare versions
          const serverVersion = serverEntity._version || 0
          const localVersion = localEntity._version || 0

          if (serverVersion > localVersion) {
            // Server has newer version
            localMap.set(serverEntity.id, serverEntity)
          }
          // If local is newer, keep it (will be synced on next push)
        }
        break

      case 'DELETE':
        const deletedId = payload.old.id as string
        localMap.delete(deletedId)
        break
    }

    // Save updated data
    setStore(storeKey, Array.from(localMap.values()))
    
    // Notify listeners
    this.syncStateListeners.forEach(listener => listener(this.currentState))
  }

  private unsubscribeAll(): void {
    this.syncStateListeners.clear()
  }

  // ============ Queue Management ============

  private getQueue(): SyncQueueItem[] {
    return getStore<SyncQueueItem[]>(SYNC_QUEUE_KEY, [])
  }

  private setQueue(queue: SyncQueueItem[]) {
    setStore(SYNC_QUEUE_KEY, queue)
    this.updateState({ pendingCount: queue.length })
  }

  enqueue(table: string, operation: SyncOperation, data: Record<string, unknown>): void {
    const queue = this.getQueue()
    const existingIndex = queue.findIndex(
      item => item.table === table && item.data.id === data.id
    )

    // Add versioning metadata
    const versionedData = {
      ...data,
      _version: (data._version as number || 0) + 1,
      _modifiedAt: new Date().toISOString(),
    }

    if (existingIndex >= 0) {
      const existing = queue[existingIndex]
      
      // If existing is "create" and new is "delete", remove from queue
      if (existing.operation === "create" && operation === "delete") {
        queue.splice(existingIndex, 1)
        this.setQueue(queue)
        return
      }
      
      // Merge operations
      queue[existingIndex] = {
        ...existing,
        operation: existing.operation === "create" ? "create" : operation,
        data: { ...existing.data, ...versionedData },
        timestamp: new Date().toISOString(),
      }
    } else {
      queue.push({
        id: crypto.randomUUID(),
        table,
        operation,
        data: versionedData,
        timestamp: new Date().toISOString(),
        retryCount: 0,
      })
    }

    this.setQueue(queue)
    this.triggerSync()
  }

  // ============ Sync Logic ============

  async sync(): Promise<boolean> {
    if (!this.supabase) return false

    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) {
      this.updateState({ status: "error", error: "Not authenticated" })
      return false
    }

    const queue = this.getQueue()
    if (queue.length === 0 && this.currentState.conflicts.length === 0) {
      this.updateState({ status: "idle" })
      return true
    }

    this.updateState({ status: "syncing", error: null })

    // First, resolve any pending conflicts
    if (this.currentState.conflicts.length > 0) {
      this.updateState({ status: "conflict" })
      return false
    }

    const processed: string[] = []
    const failed: SyncQueueItem[] = []

    for (const item of queue) {
      try {
        const success = await this.processSyncItem(item, user.id)
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

    // Update queue
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

  private async processSyncItem(item: SyncQueueItem, userId: string): Promise<boolean> {
    if (!this.supabase) return false

    const { table, operation, data } = item

    // Add user_id to data
    const dataWithUser = { ...data, user_id: userId }

    switch (operation) {
      case "create":
        const { error: createError } = await this.supabase
          .from(table)
          .insert(dataWithUser)
        return !createError

      case "update":
        const { error: updateError } = await this.supabase
          .from(table)
          .update(dataWithUser)
          .eq("id", data.id)
          .eq("user_id", userId)
        return !updateError

      case "delete":
        const { error: deleteError } = await this.supabase
          .from(table)
          .delete()
          .eq("id", data.id)
          .eq("user_id", userId)
        return !deleteError

      default:
        return false
    }
  }

  private triggerSync() {
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout)
    }
    this.syncTimeout = setTimeout(() => this.sync(), 1000)
  }

  // ============ Pull Sync (Server to Local) ============

  async pullFromServer(): Promise<boolean> {
    if (!this.supabase) return false

    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) return false

    this.updateState({ status: "syncing" })

    try {
      const tables = Object.keys(TABLE_TO_KEY)
      const lastSync = getStore<string | null>(LAST_SYNC_KEY, null)
      const conflicts: Conflict<Record<string, unknown>>[] = []

      for (const table of tables) {
        const storeKey = TABLE_TO_KEY[table]
        if (!storeKey) continue

        let query = this.supabase
          .from(table)
          .select("*")
          .eq("user_id", user.id)

        if (lastSync) {
          query = query.gt("updated_at", lastSync)
        }

        const { data: serverData, error } = await query

        if (error) {
          console.warn(`Sync: skipping table "${table}" — ${error.message || error.code || JSON.stringify(error)}`)
          continue
        }

        if (serverData && serverData.length > 0) {
          // Convert to versioned entities
          const serverEntities = serverData.map(item => 
            this.toVersionedEntity(item)
          )

          // Get local data
          const localData = getStore<VersionedEntity<Record<string, unknown>>[]>(storeKey, [])

          // Resolve conflicts
          const result = resolveBatchConflicts(
            localData,
            serverEntities,
            this.options.conflictStrategy || 'merge'
          )

          // Save resolved data
          setStore(storeKey, result.resolved)

          // Track conflicts for manual resolution
          if (result.conflicts.length > 0) {
            conflicts.push(...result.conflicts)
          }
        }
      }

      const newLastSync = new Date().toISOString()
      setStore(LAST_SYNC_KEY, newLastSync)

      if (conflicts.length > 0) {
        this.updateState({ 
          status: "conflict", 
          lastSync: newLastSync,
          conflicts 
        })
      } else {
        this.updateState({ status: "idle", lastSync: newLastSync, conflicts: [] })
      }

      return true
    } catch (error) {
      console.error("Pull sync error:", error)
      this.updateState({ 
        status: "error", 
        error: "Failed to sync from server" 
      })
      return false
    }
  }

  private toVersionedEntity<T extends Record<string, unknown>>(data: T): VersionedEntity<T> {
    // Strip server-side metadata fields so they don't pollute .data
    const { _version, _device_id, _vector_clock, updated_at, created_at, user_id, ...cleanData } = data
    return {
      id: data.id as string,
      data: cleanData as T,
      _version: (data._version as number) || 1,
      _modifiedAt: (data.updated_at as string) || new Date().toISOString(),
      _deviceId: (data._device_id as string) || 'unknown',
      _vectorClock: (data._vector_clock as Record<string, number>) || {},
    }
  }

  // ============ Conflict Resolution ============

  async resolveConflicts(resolutions: Map<string, ConflictResolution>): Promise<void> {
    const resolvedConflicts: Conflict<Record<string, unknown>>[] = []

    for (const conflict of this.currentState.conflicts) {
      const resolution = resolutions.get(conflict.entityId)
      if (!resolution) continue

      // Apply resolution
      const storeKey = TABLE_TO_KEY[conflict.local.data.table as string]
      if (!storeKey) continue

      const localData = getStore<VersionedEntity<Record<string, unknown>>[]>(storeKey, [])
      const localMap = new Map(localData.map(item => [item.id, item]))

      let resolvedEntity: VersionedEntity<Record<string, unknown>>

      switch (resolution) {
        case 'local-wins':
          resolvedEntity = incrementVersion(conflict.local)
          break
        case 'remote-wins':
          resolvedEntity = conflict.remote
          break
        case 'merge':
          // Already merged by resolveBatchConflicts, use local
          resolvedEntity = incrementVersion(conflict.local)
          break
        default:
          continue
      }

      localMap.set(conflict.entityId, resolvedEntity)
      setStore(storeKey, Array.from(localMap.values()))

      // Queue for sync
      this.enqueue(
        conflict.local.data.table as string,
        'update',
        resolvedEntity.data
      )

      resolvedConflicts.push(conflict)
    }

    // Remove resolved conflicts
    const remainingConflicts = this.currentState.conflicts.filter(
      c => !resolvedConflicts.some(rc => rc.entityId === c.entityId)
    )

    this.updateState({ 
      conflicts: remainingConflicts,
      status: remainingConflicts.length > 0 ? 'conflict' : 'idle'
    })

    // Trigger sync
    if (resolvedConflicts.length > 0) {
      this.sync()
    }
  }

  // ============ Auto Sync ============

  startAutoSync(): void {
    if (this.syncIntervalId) return

    this.syncIntervalId = setInterval(() => {
      if (this.currentState.pendingCount > 0 && navigator.onLine) {
        this.sync()
      }
    }, this.options.syncInterval || DEFAULT_SYNC_INTERVAL)
  }

  stopAutoSync(): void {
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId)
      this.syncIntervalId = null
    }
  }

  // ============ Network Status ============

  private setupNetworkListeners() {
    if (typeof window === "undefined") return

    window.addEventListener("online", () => {
      this.updateState({ status: "idle" })
      this.sync()
    })

    window.addEventListener("offline", () => {
      this.updateState({ status: "offline" })
    })

    if (!navigator.onLine) {
      this.updateState({ status: "offline" })
    }
  }

  // ============ Utility Methods ============

  async forceSync(): Promise<boolean> {
    await this.pullFromServer()
    return this.sync()
  }

  clearQueue(): void {
    this.setQueue([])
  }

  getQueueItems(): SyncQueueItem[] {
    return this.getQueue()
  }
}

// Singleton instance
export const syncEngineV2 = new SyncEngineV2()

// Helper functions
export function useSyncEngine() {
  return syncEngineV2
}

export function initializeSync(options?: Partial<SyncOptions>): Promise<void> {
  return syncEngineV2.initialize(options)
}

export function destroySync(): void {
  syncEngineV2.destroy()
}
