"use client"

import { useEffect } from "react"
import { useAuth } from "@/lib/auth/context"
import { exportAllData } from "@/lib/store/backup"

const BACKUP_INTERVAL_MS = 24 * 60 * 60 * 1000 // 24 hours
const LAST_BACKUP_KEY = "lifeos_last_backup"

export function useAutoBackup() {
  const { isAuthenticated, isGuest } = useAuth()

  useEffect(() => {
    if (!isAuthenticated || isGuest) return

    const lastBackup = Number(localStorage.getItem(LAST_BACKUP_KEY) ?? 0)
    const now = Date.now()

    if (now - lastBackup < BACKUP_INTERVAL_MS) return

    const run = async () => {
      try {
        const data = exportAllData()
        const res = await fetch("/api/backup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ version: data.version, data }),
        })
        if (res.ok) {
          localStorage.setItem(LAST_BACKUP_KEY, String(Date.now()))
        }
      } catch {
        // Silently fail — backup is best-effort
      }
    }

    run()
  }, [isAuthenticated, isGuest])
}
