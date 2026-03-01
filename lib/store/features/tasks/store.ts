// ============================================
// TASKS STORE - CRUD операции
// ============================================

import type { Task } from "@/lib/types"
import { getStore, setStore, KEYS, mutateKey, genId, now } from "@/lib/store/core"
import type { TaskOperationResult } from "./types"

const STORAGE_KEY = KEYS.tasks

// ============================================
// READ
// ============================================

/**
 * Получить все задачи
 */
export function getTasks(): Task[] {
  return getStore(STORAGE_KEY, [])
}

/**
 * Получить задачу по ID
 */
export function getTaskById(id: string): Task | undefined {
  return getTasks().find(t => t.id === id)
}

// ============================================
// CREATE
// ============================================

/**
 * Создать новую задачу
 * @returns Созданная задача
 */
export function createTask(task: Omit<Task, "id" | "createdAt">): Task {
  const tasks = getTasks()
  const newTask: Task = {
    ...task,
    id: genId(),
    createdAt: now(),
  }
  
  const updated = [...tasks, newTask]
  setStore(STORAGE_KEY, updated)
  mutateKey(STORAGE_KEY, updated)
  
  return newTask
}

/**
 * @deprecated Используйте createTask
 */
export function addTask(task: Omit<Task, "id" | "createdAt">): Task {
  return createTask(task)
}

// ============================================
// UPDATE
// ============================================

/**
 * Обновить задачу
 */
export function updateTask(id: string, updates: Partial<Task>): Task | undefined {
  const tasks = getTasks()
  const task = tasks.find(t => t.id === id)
  
  if (!task) return undefined
  
  const updatedTask = { ...task, ...updates }
  const updatedTasks = tasks.map(t => t.id === id ? updatedTask : t)
  
  setStore(STORAGE_KEY, updatedTasks)
  mutateKey(STORAGE_KEY, updatedTasks)
  
  return updatedTask
}

/**
 * Отметить задачу выполненной
 */
export function completeTask(id: string): Task | undefined {
  const task = getTaskById(id)
  if (!task || task.status === "completed") return undefined
  
  return updateTask(id, {
    status: "completed",
    completedAt: now(),
    actualDuration: task.duration,
  })
}

/**
 * Отменить выполнение задачи
 */
export function uncompleteTask(id: string): Task | undefined {
  return updateTask(id, {
    status: "todo",
    completedAt: undefined,
    actualDuration: undefined,
  })
}

// ============================================
// DELETE
// ============================================

/**
 * Удалить задачу
 */
export function deleteTask(id: string): Task | undefined {
  const tasks = getTasks()
  const task = tasks.find(t => t.id === id)
  
  if (!task) return undefined
  
  const updated = tasks.filter(t => t.id !== id)
  setStore(STORAGE_KEY, updated)
  mutateKey(STORAGE_KEY, updated)
  
  return task
}

// ============================================
// BATCH OPERATIONS
// ============================================

/**
 * Удалить несколько задач
 */
export function deleteTasks(ids: string[]): number {
  const tasks = getTasks()
  const updated = tasks.filter(t => !ids.includes(t.id))
  const deletedCount = tasks.length - updated.length
  
  if (deletedCount > 0) {
    setStore(STORAGE_KEY, updated)
    mutateKey(STORAGE_KEY, updated)
  }
  
  return deletedCount
}

/**
 * Обновить несколько задач
 */
export function updateTasks(ids: string[], updates: Partial<Task>): number {
  const tasks = getTasks()
  let updatedCount = 0
  
  const updated = tasks.map(t => {
    if (ids.includes(t.id)) {
      updatedCount++
      return { ...t, ...updates }
    }
    return t
  })
  
  if (updatedCount > 0) {
    setStore(STORAGE_KEY, updated)
    mutateKey(STORAGE_KEY, updated)
  }
  
  return updatedCount
}
