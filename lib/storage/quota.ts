// ============================================
// STORAGE QUOTA MANAGEMENT
// ============================================

import { toast } from "sonner"
import { cacheGet, cacheSet, getCacheKeys } from "../store/idb"

export interface StorageQuota {
  usage: number
  quota: number
  percentage: number
  remaining: number
}

// ============================================
// Check Storage Quota
// ============================================

export async function checkStorageQuota(): Promise<StorageQuota | null> {
  if (typeof navigator === 'undefined' || !navigator.storage) {
    return null
  }

  try {
    const estimate = await navigator.storage.estimate()
    
    if (estimate.usage !== undefined && estimate.quota !== undefined) {
      return {
        usage: estimate.usage,
        quota: estimate.quota,
        percentage: (estimate.usage / estimate.quota) * 100,
        remaining: estimate.quota - estimate.usage,
      }
    }
  } catch (error) {
    console.error('[Storage] Failed to estimate quota:', error)
  }

  return null
}

// ============================================
// Check if Storage is Almost Full
// ============================================

export async function isStorageAlmostFull(threshold: number = 90): Promise<boolean> {
  const quota = await checkStorageQuota()
  return quota !== null && quota.percentage >= threshold
}

// ============================================
// Get Storage Warning Level
// ============================================

export async function getStorageWarning(): Promise<{ level: 'none' | 'warning' | 'critical'; message?: string }> {
  const quota = await checkStorageQuota()
  
  if (!quota) return { level: 'none' }
  
  if (quota.percentage >= 95) {
    return {
      level: 'critical',
      message: `Хранилище заполнено на ${quota.percentage.toFixed(1)}%. Немедленно удалите ненужные данные!`
    }
  }
  
  if (quota.percentage >= 80) {
    return {
      level: 'warning',
      message: `Хранилище заполнено на ${quota.percentage.toFixed(1)}%. Рекомендуется очистка.`
    }
  }
  
  return { level: 'none' }
}

// ============================================
// Safe Storage Set with Quota Check
// ============================================

export function safeSetStore(key: string, value: any): { success: boolean; error?: string } {
  try {
    const serialized = JSON.stringify(value)
    const size = new Blob([serialized]).size

    // Check if item is too large (> 10MB per item — IDB limit is much higher than LS)
    if (size > 10 * 1024 * 1024) {
      return {
        success: false,
        error: `Данные слишком большие (${(size / 1024 / 1024).toFixed(2)} MB). Максимум 10 MB.`
      }
    }

    cacheSet(key, value)
    return { success: true }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Unknown error' }
  }
}

// ============================================
// Show Storage Warning Toast
// ============================================

let lastWarningTime = 0
const WARNING_COOLDOWN = 5 * 60 * 1000 // 5 minutes

export async function showStorageWarningIfNeeded() {
  const warning = await getStorageWarning()
  const now = Date.now()
  
  if (warning.level !== 'none' && now - lastWarningTime > WARNING_COOLDOWN) {
    lastWarningTime = now
    
    if (warning.level === 'critical') {
      toast.error(warning.message, {
        duration: 10000,
        action: {
          label: 'Очистить',
          onClick: () => {
            window.location.href = '/settings'
          }
        }
      })
    } else {
      toast.warning(warning.message, {
        duration: 5000,
      })
    }
  }
}

// ============================================
// Estimate Data Size
// ============================================

export function estimateDataSize(data: any): { bytes: number; formatted: string } {
  const serialized = JSON.stringify(data)
  const bytes = new Blob([serialized]).size
  
  let formatted: string
  if (bytes < 1024) {
    formatted = `${bytes} B`
  } else if (bytes < 1024 * 1024) {
    formatted = `${(bytes / 1024).toFixed(1)} KB`
  } else {
    formatted = `${(bytes / 1024 / 1024).toFixed(2)} MB`
  }
  
  return { bytes, formatted }
}

// ============================================
// Cleanup Old Data
// ============================================

export function cleanupOldData() {
  const keys = getCacheKeys()
  const removed: string[] = []

  keys.forEach(key => {
    try {
      const data = cacheGet<any>(key, null)
      if (data === null) return

      // Remove old completed tasks (older than 1 year)
      if (key === 'tasks' && Array.isArray(data)) {
        const oneYearAgo = new Date()
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

        const filtered = data.filter((item: any) => {
          if (item.status === 'completed' && item.completedAt) {
            return new Date(item.completedAt) > oneYearAgo
          }
          return true
        })

        if (filtered.length < data.length) {
          cacheSet(key, filtered)
          removed.push(`${key}: ${data.length - filtered.length} old tasks`)
        }
      }

      // Remove old health metrics (keep last 1000)
      if (key === 'healthMetrics' && Array.isArray(data) && data.length > 1000) {
        const sorted = [...data].sort((a: any, b: any) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )
        const trimmed = sorted.slice(0, 1000)
        cacheSet(key, trimmed)
        removed.push(`${key}: ${data.length - 1000} old metrics`)
      }

    } catch (e) {
      console.error(`[Cleanup] Error processing ${key}:`, e)
    }
  })

  return removed
}
