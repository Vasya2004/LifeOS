// ============================================
// SYNC SYSTEM - Cloud synchronization with Supabase
// ============================================

import { createClient } from "@/lib/supabase/client"
import type { 
  Identity, CoreValue, LifeArea, Role,
  Goal, Project, Task, Habit,
  UserStats, Wish, JournalEntry,
  Account, Transaction, FinancialGoal, Budget,
  BodyZone, MedicalDocument, HealthMetricEntry, HealthProfile,
  Skill
} from "./types"

const SYNC_VERSION = "1.0"

interface SyncState {
  lastSyncAt: string | null
  pendingChanges: boolean
  syncVersion: string
}

function getSyncState(): SyncState {
  if (typeof window === "undefined") return { lastSyncAt: null, pendingChanges: false, syncVersion: SYNC_VERSION }
  const stored = localStorage.getItem("lifeos_sync_state")
  return stored ? JSON.parse(stored) : { lastSyncAt: null, pendingChanges: false, syncVersion: SYNC_VERSION }
}

function setSyncState(state: SyncState) {
  if (typeof window === "undefined") return
  localStorage.setItem("lifeos_sync_state", JSON.stringify(state))
}

export function markPendingChanges() {
  const state = getSyncState()
  state.pendingChanges = true
  setSyncState(state)
}

export function getLastSyncAt(): string | null {
  return getSyncState().lastSyncAt
}

export function hasPendingChanges(): boolean {
  return getSyncState().pendingChanges
}

// ============================================
// SUPABASE SYNC
// ============================================

export async function syncAllData(): Promise<{ success: boolean; error?: string; syncedAt?: string }> {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "Not authenticated" }
  }

  try {
    // Get all local data
    const localData = {
      identity: getLocalData<Identity>("identity"),
      values: getLocalData<CoreValue[]>("values"),
      areas: getLocalData<LifeArea[]>("areas"),
      roles: getLocalData<Role[]>("roles"),
      goals: getLocalData<Goal[]>("goals"),
      projects: getLocalData<Project[]>("projects"),
      tasks: getLocalData<Task[]>("tasks"),
      habits: getLocalData<Habit[]>("habits"),
      stats: getLocalData<UserStats>("stats"),
      wishes: getLocalData<Wish[]>("wishes"),
      journal: getLocalData<JournalEntry[]>("journal"),
      accounts: getLocalData<Account[]>("accounts"),
      transactions: getLocalData<Transaction[]>("transactions"),
      financialGoals: getLocalData<FinancialGoal[]>("financialGoals"),
      budgets: getLocalData<Budget[]>("budgets"),
      bodyZones: getLocalData<BodyZone[]>("bodyZones"),
      medicalDocuments: getLocalData<MedicalDocument[]>("medicalDocuments"),
      healthMetrics: getLocalData<HealthMetricEntry[]>("healthMetrics"),
      healthProfile: getLocalData<HealthProfile>("healthProfile"),
      skills: getLocalData<Skill[]>("skills"),
    }

    // Sync to Supabase
    const { error } = await supabase
      .from("user_data")
      .upsert({
        user_id: user.id,
        data: localData,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "user_id",
      })

    if (error) throw error

    // Update sync state
    const now = new Date().toISOString()
    setSyncState({
      lastSyncAt: now,
      pendingChanges: false,
      syncVersion: SYNC_VERSION,
    })

    return { success: true, syncedAt: now }
  } catch (error) {
    console.error("Sync error:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }
  }
}

export async function fetchCloudData(): Promise<{ success: boolean; error?: string; data?: any }> {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "Not authenticated" }
  }

  try {
    const { data, error } = await supabase
      .from("user_data")
      .select("data")
      .eq("user_id", user.id)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        // No data found
        return { success: true, data: null }
      }
      throw error
    }

    return { success: true, data: data?.data }
  } catch (error) {
    console.error("Fetch error:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }
  }
}

export async function mergeCloudData(): Promise<{ success: boolean; error?: string }> {
  const { success, data, error } = await fetchCloudData()
  
  if (!success) return { success: false, error }
  if (!data) return { success: true } // No cloud data yet

  // Merge cloud data with local data (cloud wins for conflicts)
  Object.entries(data).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      setLocalData(key, value)
    }
  })

  return { success: true }
}

function getLocalData<T>(key: string): T | null {
  if (typeof window === "undefined") return null
  const stored = localStorage.getItem(`lifeos_${key}`)
  return stored ? JSON.parse(stored) : null
}

function setLocalData<T>(key: string, value: T) {
  if (typeof window === "undefined") return
  localStorage.setItem(`lifeos_${key}`, JSON.stringify(value))
}

// ============================================
// AUTO SYNC
// ============================================

let syncInterval: NodeJS.Timeout | null = null

export function startAutoSync(intervalMinutes: number = 5) {
  if (syncInterval) clearInterval(syncInterval)
  
  syncInterval = setInterval(async () => {
    if (hasPendingChanges() && navigator.onLine) {
      await syncAllData()
    }
  }, intervalMinutes * 60 * 1000)
}

export function stopAutoSync() {
  if (syncInterval) {
    clearInterval(syncInterval)
    syncInterval = null
  }
}

// ============================================
// OFFLINE QUEUE
// ============================================

interface QueuedChange {
  id: string
  table: string
  operation: "insert" | "update" | "delete"
  data: any
  timestamp: string
}

export function queueChange(table: string, operation: "insert" | "update" | "delete", data: any) {
  const queue = getOfflineQueue()
  queue.push({
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    table,
    operation,
    data,
    timestamp: new Date().toISOString(),
  })
  setOfflineQueue(queue)
  markPendingChanges()
}

function getOfflineQueue(): QueuedChange[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem("lifeos_sync_queue")
  return stored ? JSON.parse(stored) : []
}

function setOfflineQueue(queue: QueuedChange[]) {
  if (typeof window === "undefined") return
  localStorage.setItem("lifeos_sync_queue", JSON.stringify(queue))
}

export async function processOfflineQueue(): Promise<{ success: boolean; processed: number; error?: string }> {
  const queue = getOfflineQueue()
  if (queue.length === 0) return { success: true, processed: 0 }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, processed: 0, error: "Not authenticated" }
  }

  let processed = 0
  const remaining: QueuedChange[] = []

  for (const change of queue) {
    try {
      // Apply changes to Supabase
      // This is simplified - in production you'd handle each table specifically
      processed++
    } catch (error) {
      remaining.push(change)
    }
  }

  setOfflineQueue(remaining)
  
  if (remaining.length === 0) {
    markPendingChanges()
  }

  return { success: remaining.length === 0, processed }
}
