// ============================================
// REALTIME HABITS HOOK
// ============================================

"use client"

import { useEffect, useCallback } from "react"
import { useAuth } from "@/lib/auth/context"
import { subscribeToHabits, realtimeManager } from "@/lib/realtime/client"
import { mutate } from "swr"
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js"
import type { Habit } from "@/lib/types"

const HABITS_KEY = "habits"

export function useRealtimeHabits() {
  const { user, isAuthenticated } = useAuth()

  const handleChange = useCallback(
    (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
      console.log("[Realtime] Habits change:", payload.eventType)

      // Revalidate habits cache
      mutate(HABITS_KEY)

      if (payload.eventType === "UPDATE") {
        const newHabit = payload.new as unknown as Habit
        mutate([HABITS_KEY, newHabit.id], newHabit, false)
        
        // Revalidate stats if streak changed
        if (newHabit.streak > 0) {
          mutate("stats")
        }
      }
    },
    []
  )

  useEffect(() => {
    if (!isAuthenticated || !user) return

    subscribeToHabits(user.id, handleChange)

    return () => {
      realtimeManager.unsubscribe(`user:${user.id}:habits`)
    }
  }, [isAuthenticated, user, handleChange])

  return {
    isSubscribed: isAuthenticated && !!user,
  }
}
