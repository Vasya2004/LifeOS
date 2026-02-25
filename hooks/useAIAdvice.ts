"use client"

import { useMemo } from "react"
import { useStats } from "@/hooks/modules/use-stats"
import { useTasks } from "@/hooks/modules/use-tasks"
import { useGoals } from "@/hooks/modules/use-goals"
import { useHabits } from "@/hooks/modules/use-habits"
import { useSkills } from "@/hooks/modules/use-skills"
import { useFinancialStats } from "@/hooks/modules/use-finance"
import { useBodyZonesStats } from "@/hooks/modules/use-health"
import { generateAIAdvice } from "@/lib/ai-rules"
import type { AIAdvice } from "@/lib/types/dashboard.types"

export function useAIAdvice(): AIAdvice[] {
  const { data: stats } = useStats()
  const { data: tasks } = useTasks()
  const { data: goals } = useGoals()
  const { data: habits } = useHabits()
  const { data: skills } = useSkills()
  const { data: financialStats } = useFinancialStats()
  const { data: healthStats } = useBodyZonesStats()

  return useMemo(() => {
    return generateAIAdvice({
      tasks,
      habits,
      goals,
      skills,
      stats: stats
        ? {
            currentStreak: stats.currentStreak,
            longestStreak: stats.longestStreak,
            level: stats.level,
            xp: stats.xp,
            totalTasksCompleted: stats.totalTasksCompleted,
          }
        : undefined,
      financialStats: financialStats
        ? {
            savingsRate: financialStats.savingsRate,
            netWorth: financialStats.netWorth,
            monthlyExpenses: financialStats.monthlyExpenses,
            monthlyIncome: financialStats.monthlyIncome,
          }
        : undefined,
      healthStats: healthStats
        ? {
            healthScore: healthStats.healthScore,
            red: healthStats.red,
            yellow: healthStats.yellow,
          }
        : undefined,
    })
  }, [stats, tasks, goals, habits, skills, financialStats, healthStats])
}
