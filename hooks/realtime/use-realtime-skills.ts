// ============================================
// REALTIME SKILLS HOOK
// ============================================

"use client"

import { useEffect, useCallback } from "react"
import { useAuth } from "@/lib/auth/context"
import { subscribeToSkills, realtimeManager } from "@/lib/realtime/client"
import { mutate } from "swr"
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js"
import type { Skill } from "@/lib/types"

const SKILLS_KEY = "skills"

export function useRealtimeSkills() {
  const { user, isAuthenticated } = useAuth()

  const handleChange = useCallback(
    (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
      console.log("[Realtime] Skills change:", payload.eventType)

      // Revalidate skills cache
      mutate(SKILLS_KEY)

      if (payload.eventType === "UPDATE") {
        const newSkill = payload.new as unknown as Skill
        mutate([SKILLS_KEY, newSkill.id], newSkill, false)
        
        // Show notification on level up
        const oldSkill = payload.old as unknown as Skill | undefined
        if (newSkill.currentLevel > (oldSkill?.currentLevel || 0)) {
          console.log(`[Realtime] Level up! ${newSkill.name} is now level ${newSkill.currentLevel}`)
        }
      }
    },
    []
  )

  useEffect(() => {
    if (!isAuthenticated || !user) return

    subscribeToSkills(user.id, handleChange)

    return () => {
      realtimeManager.unsubscribe(`user:${user.id}:skills`)
    }
  }, [isAuthenticated, user, handleChange])

  return {
    isSubscribed: isAuthenticated && !!user,
  }
}
