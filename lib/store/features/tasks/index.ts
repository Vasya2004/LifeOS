// ============================================
// TASKS FEATURE MODULE
// 
// Публичный API модуля задач
// ============================================

// Types
export type {
  TaskFilters,
  TaskSort,
  TaskSortBy,
  TaskSortOrder,
  TaskOperationResult,
  TasksStats,
  TaskGroupBy,
  GroupedTasks,
} from "./types"

// Store (CRUD)
export {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  completeTask,
  uncompleteTask,
  deleteTask,
  deleteTasks,
  updateTasks,
} from "./store"

// Queries (Filtering & Search)
export {
  // Date-based
  getTodaysTasks,
  getTasksByDate,
  getTomorrowsTasks,
  getThisWeekTasks,
  getOverdueTasks,
  getUpcomingTasks,
  // Status-based
  getCompletedTasks,
  getActiveTasks,
  getInProgressTasks,
  getCancelledTasks,
  // Project-based
  getTasksByProject,
  // Filtering & Sorting
  filterTasks,
  sortTasks,
  groupTasks,
  // Statistics
  getTasksStats,
} from "./queries"

// Hooks (React)
export {
  useTasks,
  useFilteredTasks,
  useTodaysTasks,
  useActiveTasks,
  useTasksStats,
  useTask,
  useTaskManager,
} from "./hooks"
