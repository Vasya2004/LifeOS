// ============================================
// STORAGE HOOKS - SWR-based data fetching
// ============================================

import useSWR from "swr"
import type { 
  LearningSource, 
  Insight, 
  StorageContact, 
  StorageResource 
} from "@/lib/types/storage"
import {
  getStorageFolders,
  getLearningSources,
  getInsights,
  getStorageContacts,
  getStorageResources,
  getStorageStats,
} from "@/lib/store/modules/storage"

// ============================================
// FOLDERS
// ============================================
export function useStorageFolders() {
  return useSWR("storageFolders", getStorageFolders, { revalidateOnFocus: false })
}

// ============================================
// LEARNING SOURCES
// ============================================
export function useLearningSources() {
  return useSWR("learningSources", getLearningSources, { revalidateOnFocus: false })
}

export function useSourcesByStatus(status: string) {
  const { data: sources, ...rest } = useLearningSources()
  const filtered = sources?.filter((s: LearningSource) => s.status === status) || []
  return { data: filtered, ...rest }
}

export function useActiveSources() {
  const { data: sources, ...rest } = useLearningSources()
  const active = sources?.filter((s: LearningSource) => s.status === 'in_progress') || []
  return { data: active, ...rest }
}

// ============================================
// INSIGHTS
// ============================================
export function useInsights() {
  return useSWR("insights", getInsights, { revalidateOnFocus: false })
}

export function useInsightsByStatus(status: string) {
  const { data: insights, ...rest } = useInsights()
  const filtered = insights?.filter((i: Insight) => i.status === status) || []
  return { data: filtered, ...rest }
}

export function useInsightsByPriority(priority: string) {
  const { data: insights, ...rest } = useInsights()
  const filtered = insights?.filter((i: Insight) => i.priority === priority) || []
  return { data: filtered, ...rest }
}

export function usePendingInsights() {
  const { data: insights, ...rest } = useInsights()
  const pending = insights?.filter((i: Insight) => i.status === 'pending') || []
  return { data: pending, ...rest }
}

export function useInActionInsights() {
  const { data: insights, ...rest } = useInsights()
  const inAction = insights?.filter((i: Insight) => i.status === 'in_action') || []
  return { data: inAction, ...rest }
}

// ============================================
// CONTACTS
// ============================================
export function useStorageContacts() {
  return useSWR("storageContacts", getStorageContacts, { revalidateOnFocus: false })
}

export function useContactsByCategory(category: string) {
  const { data: contacts, ...rest } = useStorageContacts()
  const filtered = contacts?.filter((c: StorageContact) => c.category === category) || []
  return { data: filtered, ...rest }
}

export function useFollowUpContacts() {
  const { data: contacts, ...rest } = useStorageContacts()
  const today = new Date().toISOString().split('T')[0]
  const followUp = contacts?.filter((c: StorageContact) => {
    if (!c.nextFollowupDate) return false
    return c.nextFollowupDate <= today
  }) || []
  return { data: followUp, ...rest }
}

// ============================================
// RESOURCES
// ============================================
export function useStorageResources() {
  return useSWR("storageResources", getStorageResources, { revalidateOnFocus: false })
}

export function useResourcesByType(type: string) {
  const { data: resources, ...rest } = useStorageResources()
  const filtered = resources?.filter((r: StorageResource) => r.type === type) || []
  return { data: filtered, ...rest }
}

// ============================================
// STATS
// ============================================
export function useStorageStats() {
  return useSWR("storageStats", getStorageStats, { revalidateOnFocus: false })
}
