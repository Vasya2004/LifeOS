// ============================================
// TASKS HOOKS - React hooks
// ============================================

import { useCallback, useMemo } from "react"
import useSWR from "swr"
import { KEYS } from "@/lib/store/core"
import { getTasks } from "./store"
import { filterTasks, sortTasks, getTodaysTasks, getActiveTasks, getTasksStats } from "./queries"
import type { TaskFilters, TaskSort, TaskGroupBy } from "./types"

const SWR_KEY = KEYS.tasks

/**
 * Базовый hook для всех задач
 */
export function useTasks() {
  const { data: tasks, mutate, error } = useSWR(SWR_KEY, getTasks)

  const refresh = useCallback(() => {
    mutate()
  }, [mutate])

  return {
    tasks: tasks ?? [],
    refresh,
    isLoading: !tasks && !error,
    error,
  }
}

/**
 * Hook для фильтрации и сортировки задач
 */
export function useFilteredTasks(
  filters: TaskFilters = {},
  sort: TaskSort = { by: "date", order: "asc" }
) {
  const { tasks, ...rest } = useTasks()

  const filtered = useMemo(() => {
    let result = tasks
    
    // Apply filters
    if (Object.keys(filters).length > 0) {
      result = filterTasks(result, filters)
    }
    
    // Apply sorting
    result = sortTasks(result, sort)
    
    return result
  }, [tasks, filters, sort])

  return {
    tasks: filtered,
    ...rest,
  }
}

/**
 * Hook для задач на сегодня
 */
export function useTodaysTasks() {
  const { data: tasks, mutate } = useSWR(`${SWR_KEY}:today`, getTodaysTasks, {
    refreshInterval: 60000, // Обновление каждую минуту
  })

  const stats = useMemo(() => {
    const list = tasks ?? []
    const total = list.length
    const completed = list.filter(t => t.status === "completed").length
    return {
      total,
      completed,
      remaining: total - completed,
      progress: total > 0 ? Math.round((completed / total) * 100) : 0,
    }
  }, [tasks])

  return {
    tasks: tasks ?? [],
    stats,
    refresh: mutate,
  }
}

/**
 * Hook для активных задач
 */
export function useActiveTasks() {
  const { data: tasks, mutate } = useSWR(`${SWR_KEY}:active`, getActiveTasks)

  return {
    tasks: tasks ?? [],
    count: tasks?.length ?? 0,
    refresh: mutate,
  }
}

/**
 * Hook для статистики задач
 */
export function useTasksStats() {
  const { data: stats, mutate } = useSWR(`${SWR_KEY}:stats`, getTasksStats, {
    refreshInterval: 30000,
  })

  return {
    stats: stats ?? {
      total: 0,
      completed: 0,
      pending: 0,
      overdue: 0,
      byPriority: { critical: 0, high: 0, medium: 0, low: 0 },
      byStatus: { todo: 0, in_progress: 0, completed: 0, cancelled: 0 },
    },
    refresh: mutate,
  }
}

/**
 * Hook для работы с конкретной задачей
 */
export function useTask(taskId: string | null) {
  const { tasks, refresh } = useTasks()

  const task = useMemo(() => {
    if (!taskId) return null
    return tasks.find(t => t.id === taskId) ?? null
  }, [tasks, taskId])

  return {
    task,
    exists: !!task,
    refresh,
  }
}

/**
 * Полный hook для управления задачами
 */
export function useTaskManager() {
  const tasksData = useTasks()
  const todaysData = useTodaysTasks()
  const statsData = useTasksStats()

  return {
    all: tasksData,
    today: todaysData,
    stats: statsData,
  }
}
