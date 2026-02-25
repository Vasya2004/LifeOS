// ============================================
// REALTIME TASKS HOOK
// ============================================

"use client"

import { useEffect, useCallback } from "react"
import { useAuth } from "@/lib/auth/context"
import { subscribeToTasks, realtimeManager } from "@/lib/realtime/client"
import { mutate } from "swr"
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js"
import type { Task } from "@/lib/types"

const TASKS_KEY = "tasks"

export function useRealtimeTasks() {
  const { user, isAuthenticated } = useAuth()

  const handleChange = useCallback(
    (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
      console.log("[Realtime] Tasks change:", payload.eventType)

      // Revalidate tasks cache
      mutate(TASKS_KEY)

      // Also revalidate today's tasks
      mutate("todays-tasks")

      if (payload.eventType === "UPDATE") {
        const newTask = payload.new as unknown as Task
        mutate([TASKS_KEY, newTask.id], newTask, false)
        
        // If task was completed, revalidate stats
        if (newTask.status === "completed") {
          mutate("stats")
        }
      }
    },
    []
  )

  useEffect(() => {
    if (!isAuthenticated || !user) return

    subscribeToTasks(user.id, handleChange)

    return () => {
      realtimeManager.unsubscribe(`user:${user.id}:tasks`)
    }
  }, [isAuthenticated, user, handleChange])

  return {
    isSubscribed: isAuthenticated && !!user,
  }
}
