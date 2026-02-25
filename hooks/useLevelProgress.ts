"use client"

import { useMemo } from "react"
import { useStats } from "@/hooks/modules/use-stats"
import { getLevelProgress } from "@/lib/level-calculation"
import type { LevelProgress } from "@/lib/types/dashboard.types"

export function useLevelProgress(): LevelProgress {
  const { data: stats } = useStats()

  return useMemo(() => {
    const level = stats?.level ?? 1
    const xp = stats?.xp ?? 0
    const xpToNext = stats?.xpToNext ?? 1000
    return getLevelProgress(level, xp, xpToNext)
  }, [stats?.level, stats?.xp, stats?.xpToNext])
}
