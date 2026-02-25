// ============================================
// BACKUP & DATA MANAGEMENT HOOKS
// ============================================

"use client"

import { useCallback } from "react"
import * as localStore from "@/lib/store"
import { safeImportData } from "@/lib/store/migrations"

export function useDataExport() {
  const exportData = useCallback(() => {
    const data = localStore.exportAllData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `lifeos-backup-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [])

  const importData = useCallback(async (file: File): Promise<{ success: boolean; error?: string }> => {
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      
      // Validate with migration system
      const result = safeImportData(data)
      
      if (result.success && result.result) {
        const importResult = localStore.importAllData(result.result)
        return importResult
      }
      
      return { success: false, error: result.errors.join(", ") }
    } catch (e) {
      return { success: false, error: "Failed to parse backup file" }
    }
  }, [])

  const clearData = useCallback(() => {
    if (confirm("Are you sure you want to delete all data? This cannot be undone.")) {
      localStore.clearAllData()
      return true
    }
    return false
  }, [])

  return {
    exportData,
    importData,
    clearData,
  }
}

export function useStorageStats() {
  return useCallback(() => {
    if (typeof window === "undefined") return null
    
    let totalSize = 0
    let itemCount = 0
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith("lifeos_")) {
        const value = localStorage.getItem(key) || ""
        totalSize += value.length * 2 // UTF-16 = 2 bytes per char
        itemCount++
      }
    }
    
    return {
      itemCount,
      totalSize: Math.round(totalSize / 1024 * 10) / 10, // KB
      totalSizeBytes: totalSize,
    }
  }, [])
}
