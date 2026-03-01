// ============================================
// TASKS HOOKS
// ============================================

"use client"

import { useOfflineFirst } from "@/hooks/core/use-offline-first"
import * as localStore from "@/lib/store"
import * as db from "@/lib/api/database"
import { addToQueue } from "@/lib/sync/offline-first"
import { setStore } from "@/lib/store/utils/storage"
import { useAuth } from "@/lib/auth/context"
import type { Task } from "@/lib/types"
import { mutate } from "swr"

const TASKS_KEY = "tasks"

export function useTasks() {
  const { isAuthenticated, isGuest } = useAuth()
  
  return useOfflineFirst<Task[]>(TASKS_KEY, {
    storageKey: TASKS_KEY,
    getLocal: localStore.getTasks,
    getServer: isAuthenticated && !isGuest ? db.getTasks : undefined,
    setLocal: (data) => setStore(TASKS_KEY, data),
  })
}

export function useTodaysTasks() {
  const { data: tasks } = useTasks()
  const today = new Date().toISOString().split("T")[0]
  
  return tasks?.filter(t => t.scheduledDate === today) || []
}

export function useCreateTask() {
  const { isAuthenticated } = useAuth()
  
  return async (task: Omit<Task, "id">) => {
    const newTask = localStore.addTask(task)
    
    if (isAuthenticated) {
      addToQueue({ table: "tasks", operation: "insert", recordId: newTask.id, data: newTask as unknown as Record<string, unknown> })
    }
    
    return newTask
  }
}

export function useCompleteTask() {
  const { isAuthenticated } = useAuth()
  
  return async (id: string) => {
    localStore.completeTask(id)
    
    if (isAuthenticated) {
      const updated = localStore.getTasks().find(t => t.id === id)
      if (updated) {
        addToQueue({ table: "tasks", operation: "update", recordId: updated.id as string, data: updated as unknown as Record<string, unknown> })
      }
    }
    
    // Revalidate stats
    mutate("stats")
  }
}

export function useUpdateTask() {
  const { isAuthenticated } = useAuth()
  
  return async (id: string, updates: Partial<Task>) => {
    localStore.updateTask(id, updates)
    
    if (isAuthenticated) {
      const updated = { ...localStore.getTasks().find(t => t.id === id), ...updates, id }
      addToQueue({ table: "tasks", operation: "update", recordId: updated.id as string, data: updated as unknown as Record<string, unknown> })
    }
  }
}

export function useDeleteTask() {
  const { isAuthenticated } = useAuth()
  
  return async (id: string) => {
    localStore.deleteTask(id)
    
    if (isAuthenticated) {
      addToQueue({ table: "tasks", operation: "delete", recordId: id })
    }
  }
}
