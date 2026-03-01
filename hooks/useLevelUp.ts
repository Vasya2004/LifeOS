"use client"

import { useRef, useEffect, useState } from "react"
import { useStats } from "@/hooks/modules/use-stats"
import { getTierFromLevel } from "@/lib/level-calculation"

export interface LevelUpEvent {
  newLevel: number
  tierName: string
  tierColor: string
  tierChanged: boolean
}

export function useLevelUp() {
  const { data: stats } = useStats()
  const prevLevelRef = useRef<number | null>(null)
  const [levelUpEvent, setLevelUpEvent] = useState<LevelUpEvent | null>(null)

  useEffect(() => {
    const currentLevel = stats?.level ?? 1
    if (prevLevelRef.current === null) {
      // First load — just store without showing modal
      prevLevelRef.current = currentLevel
      return
    }

    if (currentLevel > prevLevelRef.current) {
      const prevTier = getTierFromLevel(prevLevelRef.current)
      const newTier = getTierFromLevel(currentLevel)
      setLevelUpEvent({
        newLevel: currentLevel,
        tierName: newTier.name,
        tierColor: newTier.color,
        tierChanged: prevTier.name !== newTier.name,
      })
    }

    prevLevelRef.current = currentLevel
  }, [stats?.level])

  const dismiss = () => setLevelUpEvent(null)

  return { levelUpEvent, dismiss }
}
