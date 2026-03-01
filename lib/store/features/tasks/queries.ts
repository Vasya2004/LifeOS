// ============================================
// TASKS QUERIES - Фильтрация и поиск
// ============================================

import type { Task } from "@/lib/types"
import { today, isToday, isYesterday, addDays } from "@/lib/store/core"
import { getTasks } from "./store"
import type { TaskFilters, TaskSort, TaskGroupBy, GroupedTasks, TasksStats } from "./types"

// ============================================
// DATE-BASED QUERIES
// ============================================

/**
 * Получить задачи на сегодня
 */
export function getTodaysTasks(): Task[] {
  return getTasks().filter(t => t.scheduledDate === today())
}

/**
 * Получить задачи на конкретную дату
 */
export function getTasksByDate(date: string): Task[] {
  return getTasks().filter(t => t.scheduledDate === date)
}

/**
 * Получить задачи на завтра
 */
export function getTomorrowsTasks(): Task[] {
  return getTasksByDate(addDays(today(), 1))
}

/**
 * Получить задачи на текущую неделю
 */
export function getThisWeekTasks(): Task[] {
  const todayStr = today()
  const weekEnd = addDays(todayStr, 7)
  return getTasks().filter(
    t => t.scheduledDate >= todayStr && t.scheduledDate <= weekEnd
  )
}

/**
 * Получить просроченные задачи
 */
export function getOverdueTasks(): Task[] {
  const todayStr = today()
  return getTasks().filter(
    t => t.scheduledDate < todayStr && t.status !== "completed"
  )
}

/**
 * Получить предстоящие задачи
 */
export function getUpcomingTasks(days: number = 7): Task[] {
  const todayStr = today()
  const endDate = addDays(todayStr, days)
  return getTasks().filter(
    t => t.scheduledDate >= todayStr && t.scheduledDate <= endDate
  )
}

// ============================================
// STATUS-BASED QUERIES
// ============================================

/**
 * Получить выполненные задачи
 */
export function getCompletedTasks(): Task[] {
  return getTasks().filter(t => t.status === "completed")
}

/**
 * Получить активные задачи (не выполненные и не отмененные)
 */
export function getActiveTasks(): Task[] {
  return getTasks().filter(t => t.status !== "completed" && t.status !== "cancelled")
}

/**
 * Получить задачи в работе
 */
export function getInProgressTasks(): Task[] {
  return getTasks().filter(t => t.status === "in_progress")
}

/**
 * Получить отмененные задачи
 */
export function getCancelledTasks(): Task[] {
  return getTasks().filter(t => t.status === "cancelled")
}

// ============================================
// PROJECT & AREA QUERIES
// ============================================

/**
 * Получить задачи по проекту
 */
export function getTasksByProject(projectId: string): Task[] {
  return getTasks().filter(t => t.projectId === projectId)
}

// ============================================
// FILTERING
// ============================================

const PRIORITY_ORDER: Record<string, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
}

/**
 * Применить фильтры к задачам
 */
export function filterTasks(tasks: Task[], filters: TaskFilters): Task[] {
  return tasks.filter(task => {
    // Status filter
    if (filters.status) {
      const statuses = Array.isArray(filters.status) ? filters.status : [filters.status]
      if (!statuses.includes(task.status)) return false
    }
    
    // Priority filter
    if (filters.priority) {
      const priorities = Array.isArray(filters.priority) ? filters.priority : [filters.priority]
      if (!priorities.includes(task.priority)) return false
    }
    
    // Date range filter
    if (filters.dateFrom && task.scheduledDate < filters.dateFrom) return false
    if (filters.dateTo && task.scheduledDate > filters.dateTo) return false
    
    // Project filter
    if (filters.projectId && task.projectId !== filters.projectId) return false
    
    // Energy type filter
    if (filters.energyType && task.energyType !== filters.energyType) return false
    
    // Search filter
    if (filters.search) {
      const search = filters.search.toLowerCase()
      const matchesTitle = task.title.toLowerCase().includes(search)
      const matchesDesc = task.description?.toLowerCase().includes(search)
      if (!matchesTitle && !matchesDesc) return false
    }
    
    return true
  })
}

/**
 * Сортировать задачи
 */
export function sortTasks(tasks: Task[], sort: TaskSort): Task[] {
  const sorted = [...tasks]
  const multiplier = sort.order === "desc" ? -1 : 1
  
  return sorted.sort((a, b) => {
    switch (sort.by) {
      case "date":
        return multiplier * a.scheduledDate.localeCompare(b.scheduledDate)
      case "priority":
        return multiplier * (PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
      case "energy":
        return multiplier * (a.duration || 0) - (b.duration || 0)
      case "created":
      default:
        return multiplier * (a.createdAt || "").localeCompare(b.createdAt || "")
    }
  })
}

// ============================================
// GROUPING
// ============================================

/**
 * Сгруппировать задачи
 */
export function groupTasks(tasks: Task[], groupBy: TaskGroupBy): GroupedTasks[] {
  const groups = new Map<string, Task[]>()
  
  tasks.forEach(task => {
    let key: string
    let label: string
    
    switch (groupBy) {
      case "date":
        key = task.scheduledDate
        label = formatDateLabel(task.scheduledDate)
        break
      case "priority":
        key = task.priority
        label = getPriorityLabel(task.priority)
        break
      case "status":
        key = task.status
        label = getStatusLabel(task.status)
        break
      case "project":
        key = task.projectId || "no-project"
        label = task.projectId || "Без проекта"
        break
      default:
        key = "all"
        label = "Все задачи"
    }
    
    if (!groups.has(key)) {
      groups.set(key, [])
    }
    groups.get(key)!.push(task)
  })
  
  return Array.from(groups.entries())
    .map(([key, tasks]) => ({ key, label: groups.get(key)?.[0] ? formatDateLabel(key) : key, tasks }))
    .sort((a, b) => a.key.localeCompare(b.key))
}

function formatDateLabel(date: string): string {
  if (isToday(date)) return "Сегодня"
  if (isYesterday(date)) return "Вчера"
  return date
}

function getPriorityLabel(priority: string): string {
  const labels: Record<string, string> = {
    critical: "🔥 Критичный",
    high: "⚡ Высокий",
    medium: "📋 Средний",
    low: "📎 Низкий",
  }
  return labels[priority] || priority
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    todo: "📝 К выполнению",
    in_progress: "🔄 В работе",
    completed: "✅ Выполнено",
    cancelled: "❌ Отменено",
  }
  return labels[status] || status
}

// ============================================
// STATISTICS
// ============================================

/**
 * Получить статистику по задачам
 */
export function getTasksStats(): TasksStats {
  const tasks = getTasks()
  const completed = tasks.filter(t => t.status === "completed").length
  const overdue = getOverdueTasks().length
  
  const byPriority = {
    critical: tasks.filter(t => t.priority === "critical").length,
    high: tasks.filter(t => t.priority === "high").length,
    medium: tasks.filter(t => t.priority === "medium").length,
    low: tasks.filter(t => t.priority === "low").length,
  }
  
  const byStatus = {
    todo: tasks.filter(t => t.status === "todo").length,
    in_progress: tasks.filter(t => t.status === "in_progress").length,
    completed: tasks.filter(t => t.status === "completed").length,
    cancelled: tasks.filter(t => t.status === "cancelled").length,
  }
  
  return {
    total: tasks.length,
    completed,
    pending: tasks.length - completed,
    overdue,
    byPriority,
    byStatus,
  }
}
