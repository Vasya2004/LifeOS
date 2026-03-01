// ============================================
// HABITS HOOKS
// ============================================

"use client"

import { useOfflineFirst } from "@/hooks/core/use-offline-first"
import * as localStore from "@/lib/store"
import * as db from "@/lib/api/database"
import { addToQueue } from "@/lib/sync/offline-first"
import { setStore } from "@/lib/store/utils/storage"
import { useAuth } from "@/lib/auth/context"
import { mutate } from "swr"
import type { Habit } from "@/lib/types"

const HABITS_KEY = "habits"

export function useHabits() {
  const { isAuthenticated, isGuest } = useAuth()

  return useOfflineFirst<Habit[]>(HABITS_KEY, {
    storageKey: HABITS_KEY,
    getLocal: localStore.getHabits,
    getServer: isAuthenticated && !isGuest ? db.getHabits : undefined,
    setLocal: (data) => setStore(HABITS_KEY, data),
  })
}

export function useToggleHabit() {
  const { isAuthenticated, isGuest } = useAuth()

  return async (habitId: string, date: string, completed: boolean) => {
    localStore.toggleHabitEntry(habitId, date, completed)

    if (isAuthenticated && !isGuest) {
      await db.toggleHabitEntry(habitId, date, completed).catch(() => {})
    }

    // Revalidate stats
    mutate("stats")
  }
}

export function useCreateHabit() {
  const { isAuthenticated, isGuest } = useAuth()

  return async (habit: Omit<Habit, "id" | "streak" | "bestStreak" | "totalCompletions" | "entries">) => {
    const newHabit = localStore.addHabit(habit)

    if (isAuthenticated && !isGuest) {
      addToQueue({ table: "habits", operation: "insert", recordId: newHabit.id, data: newHabit as unknown as Record<string, unknown> })
    }

    return newHabit
  }
}

export function useUpdateHabit() {
  const { isAuthenticated, isGuest } = useAuth()

  return async (id: string, updates: Partial<Habit>) => {
    localStore.updateHabit(id, updates)

    if (isAuthenticated && !isGuest) {
      const updated = { ...localStore.getHabits().find(h => h.id === id), ...updates, id }
      addToQueue({ table: "habits", operation: "update", recordId: updated.id as string, data: updated as unknown as Record<string, unknown> })
    }
  }
}

export function useDeleteHabit() {
  const { isAuthenticated, isGuest } = useAuth()

  return async (id: string) => {
    localStore.deleteHabit(id)

    if (isAuthenticated && !isGuest) {
      addToQueue({ table: "habits", operation: "delete", recordId: id })
    }
  }
}

export function useHabitEntries(habitId?: string) {
  const { data: habits } = useHabits()

  if (!habitId) return { data: [] }

  const habit = habits?.find(h => h.id === habitId)
  return { data: habit?.entries || [] }
}
