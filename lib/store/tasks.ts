// ============================================
// TASKS
// ============================================

import type { Task } from "@/lib/types"
import { getStore, setStore, KEYS, mutateKey, genId, now, today } from "./core"
import { addXp, checkAndUpdateStreak, updateStats, getStats } from "./gamification"
import { PRIORITY_XP } from "./defaults"
import { addToQueue } from "@/lib/sync/offline-first"

export function getTasks(): Task[] {
  return getStore(KEYS.tasks, [])
}

export function addTask(task: Omit<Task, "id">) {
  const tasks = getTasks()
  const newTask: Task = { ...task, id: genId() }
  const updatedTasks = [...tasks, newTask]
  setStore(KEYS.tasks, updatedTasks)
  mutateKey(KEYS.tasks, updatedTasks)
  addToQueue({ table: "tasks", operation: "insert", recordId: newTask.id, data: newTask as Record<string, unknown> })
  return newTask
}

export function getTaskById(id: string): Task | undefined {
  return getTasks().find(t => t.id === id)
}

export function completeTask(id: string) {
  const tasks = getTasks()
  const task = tasks.find(t => t.id === id)
  if (!task || task.status === "completed") return
  
  const completedTask: Task = { 
    ...task, 
    status: "completed", 
    completedAt: now(),
    actualDuration: task.duration
  }
  
  const updatedAfterComplete = tasks.map(t => t.id === id ? completedTask : t)
  setStore(KEYS.tasks, updatedAfterComplete)
  mutateKey(KEYS.tasks, updatedAfterComplete)
  addToQueue({ table: "tasks", operation: "update", recordId: id, data: completedTask as Record<string, unknown> })

  // Rewards
  const xp = PRIORITY_XP[task.priority]
  addXp(xp, "task_completed")
  
  // Update task stats
  const stats = getStats()
  updateStats({ totalTasksCompleted: stats.totalTasksCompleted + 1 })
  
  // Check streak
  checkAndUpdateStreak()
}

export function updateTask(id: string, updates: Partial<Task>) {
  const tasks = getTasks()
  const updatedTask = tasks.find(t => t.id === id)
  const updatedTasks = tasks.map(t => t.id === id ? { ...t, ...updates } : t)
  setStore(KEYS.tasks, updatedTasks)
  mutateKey(KEYS.tasks, updatedTasks)
  if (updatedTask) {
    addToQueue({ table: "tasks", operation: "update", recordId: id, data: { ...updatedTask, ...updates } as Record<string, unknown> })
  }
}

export function deleteTask(id: string) {
  const tasks = getTasks()
  const updatedTasks = tasks.filter(t => t.id !== id)
  setStore(KEYS.tasks, updatedTasks)
  mutateKey(KEYS.tasks, updatedTasks)
  addToQueue({ table: "tasks", operation: "delete", recordId: id })
}

export function getTodaysTasks(): Task[] {
  return getTasks().filter(t => t.scheduledDate === today())
}

export function getTasksByDate(date: string): Task[] {
  return getTasks().filter(t => t.scheduledDate === date)
}

export function getTasksByProject(projectId: string): Task[] {
  return getTasks().filter(t => t.projectId === projectId)
}

export function getCompletedTasks(): Task[] {
  return getTasks().filter(t => t.status === "completed")
}

export function getPendingTasks(): Task[] {
  return getTasks().filter(t => t.status !== "completed" && t.status !== "cancelled")
}
