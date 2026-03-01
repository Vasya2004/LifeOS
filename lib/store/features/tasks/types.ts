// ============================================
// TASKS TYPES - Локальные типы модуля
// ============================================

import type { Task } from "@/lib/types"

// Типы статуса и приоритета из Task интерфейса
export type TaskStatus = Task["status"]
export type TaskPriority = Task["priority"]

/** Фильтры для задач */
export interface TaskFilters {
  status?: TaskStatus | TaskStatus[]
  priority?: TaskPriority | TaskPriority[]
  dateFrom?: string
  dateTo?: string
  projectId?: string
  search?: string
  energyType?: string
}

/** Сортировка задач */
export type TaskSortBy = "date" | "priority" | "energy" | "created"
export type TaskSortOrder = "asc" | "desc"

export interface TaskSort {
  by: TaskSortBy
  order: TaskSortOrder
}

/** Результат операции с задачей */
export interface TaskOperationResult {
  success: boolean
  task?: Task
  error?: string
}

/** Статистика по задачам */
export interface TasksStats {
  total: number
  completed: number
  pending: number
  overdue: number
  byPriority: Record<TaskPriority, number>
  byStatus: Record<TaskStatus, number>
}

/** Группировка задач */
export type TaskGroupBy = "date" | "priority" | "project" | "status"

export interface GroupedTasks {
  key: string
  label: string
  tasks: Task[]
}
