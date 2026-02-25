// ============================================
// REALTIME HOOKS - Main Export
// ============================================

export {
  useRealtimeSubscription,
  useRealtimeMulti,
  useRealtimeStatus,
  useRealtimeSync,
} from "./use-realtime"

export { useRealtimeGoals, useRealtimeGoal } from "./use-realtime-goals"
export { useRealtimeTasks } from "./use-realtime-tasks"
export { useRealtimeHabits } from "./use-realtime-habits"
export { useRealtimeSkills } from "./use-realtime-skills"

// Re-export from client
export {
  realtimeManager,
  subscribeToTable,
  subscribeToUserData,
  subscribeToGoals,
  subscribeToTasks,
  subscribeToHabits,
  subscribeToSkills,
  type ChangeType,
  type RealtimeConfig,
} from "@/lib/realtime/client"
