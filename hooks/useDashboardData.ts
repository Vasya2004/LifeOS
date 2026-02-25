"use client"

import { useMemo } from "react"
import { useStats } from "@/hooks/modules/use-stats"
import { useIdentity } from "@/hooks/modules/use-identity"
import { useTodaysTasks } from "@/hooks/modules/use-tasks"
import { useBodyZonesStats } from "@/hooks/modules/use-health"
import type { DashboardData } from "@/lib/types/dashboard.types"
import type { Task } from "@/lib/types"

export function useDashboardData(): DashboardData {
  const { data: stats } = useStats()
  const { data: identity } = useIdentity()
  // useTodaysTasks returns Task[] directly (no wrapper object)
  const todayTasks: Task[] = useTodaysTasks()
  const { data: healthStats } = useBodyZonesStats()

  return useMemo(() => {
    const pendingToday = todayTasks.filter((t: Task) => t.status !== "completed").length
    const totalToday = todayTasks.length

    // Energy: derived from health score, default 80 if no data
    const energyPercent = healthStats?.healthScore ?? 80

    return {
      stats: stats
        ? {
            level: stats.level,
            xp: stats.xp,
            xpToNext: stats.xpToNext,
            coins: stats.coins,
            currentStreak: stats.currentStreak,
            longestStreak: stats.longestStreak,
            totalTasksCompleted: stats.totalTasksCompleted,
          }
        : undefined,
      identity: identity ? { name: identity.name } : undefined,
      todayTasksCount: totalToday,
      pendingTodayTasks: pendingToday,
      energyPercent,
    }
  }, [stats, identity, todayTasks, healthStats])
}
