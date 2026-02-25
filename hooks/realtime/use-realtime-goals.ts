// ============================================
// REALTIME GOALS HOOK
// ============================================

"use client"

import { useEffect, useCallback } from "react"
import { useAuth } from "@/lib/auth/context"
import { subscribeToGoals, realtimeManager } from "@/lib/realtime/client"
import { mutate } from "swr"
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js"
import type { Goal } from "@/lib/types"

const GOALS_KEY = "goals"

export function useRealtimeGoals() {
  const { user, isAuthenticated } = useAuth()

  const handleChange = useCallback(
    (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
      console.log("[Realtime] Goals change:", payload.eventType, payload)

      // Revalidate goals cache
      mutate(GOALS_KEY)

      // Handle specific events
      if (payload.eventType === "INSERT") {
        // New goal created
        console.log("[Realtime] New goal created:", payload.new)
      } else if (payload.eventType === "UPDATE") {
        // Goal updated
        const newGoal = payload.new as unknown as Goal
        mutate([GOALS_KEY, newGoal.id], newGoal, false)
      } else if (payload.eventType === "DELETE") {
        // Goal deleted
        console.log("[Realtime] Goal deleted:", payload.old)
      }
    },
    []
  )

  useEffect(() => {
    if (!isAuthenticated || !user) return

    const channel = subscribeToGoals(user.id, handleChange)

    return () => {
      realtimeManager.unsubscribe(`user:${user.id}:goals`)
    }
  }, [isAuthenticated, user, handleChange])

  return {
    isSubscribed: isAuthenticated && !!user,
  }
}

export function useRealtimeGoal(goalId: string) {
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isAuthenticated || !user || !goalId) return

    const channelName = `realtime:goal:${goalId}`
    
    const channel = realtimeManager.subscribe(channelName, {
      table: "goals",
      event: "*",
      filter: `id=eq.${goalId}`,
      callback: (payload) => {
        if (payload.eventType === "UPDATE") {
          mutate([GOALS_KEY, goalId], payload.new, false)
        } else if (payload.eventType === "DELETE") {
          mutate([GOALS_KEY, goalId], null, false)
        }
      },
    })

    return () => {
      realtimeManager.unsubscribe(channelName)
    }
  }, [isAuthenticated, user, goalId])

  return {
    isSubscribed: isAuthenticated && !!user && !!goalId,
  }
}
