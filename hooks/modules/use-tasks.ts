// ============================================
// TASKS HOOKS
// ============================================

"use client"

import { useOfflineFirst } from "@/hooks/core/use-offline-first"
import * as localStore from "@/lib/store"
import * as db from "@/lib/api/database"
import { syncToServer } from "@/lib/sync/offline-first"
import { setStore } from "@/lib/store/utils/storage"
import { useAuth } from "@/lib/auth/context"
import type { Task } from "@/lib/types"
import { mutate } from "swr"

const TASKS_KEY = "tasks"

export function useTasks() {
  const { isAuthenticated } = useAuth()
  
  return useOfflineFirst<Task[]>(TASKS_KEY, {
    storageKey: TASKS_KEY,
    getLocal: localStore.getTasks,
    getServer: isAuthenticated ? db.getTasks : undefined,
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
      await syncToServer("insert", "tasks", newTask, () => {})
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
        await syncToServer("update", "tasks", updated, () => {})
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
      await syncToServer("update", "tasks", updated, () => {})
    }
  }
}

export function useDeleteTask() {
  const { isAuthenticated } = useAuth()
  
  return async (id: string) => {
    localStore.deleteTask(id)
    
    if (isAuthenticated) {
      await syncToServer("delete", "tasks", id, () => {})
    }
  }
}
