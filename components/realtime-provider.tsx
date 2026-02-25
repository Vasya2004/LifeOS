// ============================================
// REALTIME PROVIDER - Global subscriptions
// ============================================

"use client"

import { ReactNode } from "react"
import { useAuth } from "@/lib/auth/context"
import {
  useRealtimeGoals,
  useRealtimeTasks,
  useRealtimeHabits,
  useRealtimeSkills,
} from "@/hooks/realtime"

interface RealtimeProviderProps {
  children: ReactNode
  enabled?: boolean
}

function RealtimeSubscriptions() {
  useRealtimeGoals()
  useRealtimeTasks()
  useRealtimeHabits()
  useRealtimeSkills()

  return null
}

export function RealtimeProvider({ children, enabled = true }: RealtimeProviderProps) {
  const { isAuthenticated } = useAuth()

  return (
    <>
      {isAuthenticated && enabled && <RealtimeSubscriptions />}
      {children}
    </>
  )
}
