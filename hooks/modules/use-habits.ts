// ============================================
// HABITS HOOKS
// ============================================

"use client"

import { useOfflineFirst } from "@/hooks/core/use-offline-first"
import * as localStore from "@/lib/store"
import * as db from "@/lib/api/database"
import { setStore } from "@/lib/store/utils/storage"
import { useAuth } from "@/lib/auth/context"
import { mutate } from "swr"
import type { Habit } from "@/lib/types"

const HABITS_KEY = "habits"

export function useHabits() {
  const { isAuthenticated } = useAuth()
  
  return useOfflineFirst<Habit[]>(HABITS_KEY, {
    storageKey: HABITS_KEY,
    getLocal: localStore.getHabits,
    getServer: isAuthenticated ? db.getHabits : undefined,
    setLocal: (data) => setStore(HABITS_KEY, data),
  })
}

export function useToggleHabit() {
  const { isAuthenticated } = useAuth()
  
  return async (habitId: string, date: string, completed: boolean) => {
    localStore.toggleHabitEntry(habitId, date, completed)
    
    if (isAuthenticated) {
      await db.toggleHabitEntry(habitId, date, completed).catch(() => {})
    }
    
    // Revalidate stats
    mutate("stats")
  }
}

export function useCreateHabit() {
  return async (habit: Omit<Habit, "id" | "streak" | "bestStreak" | "totalCompletions" | "entries">) => {
    return localStore.addHabit(habit)
  }
}

export function useUpdateHabit() {
  return async (id: string, updates: Partial<Habit>) => {
    localStore.updateHabit(id, updates)
  }
}

export function useDeleteHabit() {
  return async (id: string) => {
    localStore.deleteHabit(id)
  }
}

export function useHabitEntries(habitId?: string) {
  const { data: habits } = useHabits()
  
  if (!habitId) return { data: [] }
  
  const habit = habits?.find(h => h.id === habitId)
  return { data: habit?.entries || [] }
}
