// ============================================
// LEVEL CALCULATION UTILITIES
// ============================================

import type { LevelTier, LevelTierIndex, LevelProgress } from "@/lib/types/dashboard.types"

export interface TierConfig {
  name: LevelTier
  index: LevelTierIndex
  minLevel: number
  color: string
  gradient: string
}

export const TIER_CONFIGS: TierConfig[] = [
  {
    name: "Новичок",
    index: 1,
    minLevel: 1,
    color: "hsl(var(--muted-foreground))",
    gradient: "from-slate-400 to-slate-600",
  },
  {
    name: "Ученик",
    index: 2,
    minLevel: 5,
    color: "hsl(210, 80%, 55%)",
    gradient: "from-[#a78bfa] to-[#7c3aed]",
  },
  {
    name: "Адепт",
    index: 3,
    minLevel: 10,
    color: "hsl(270, 70%, 60%)",
    gradient: "from-purple-400 to-purple-600",
  },
  {
    name: "Ветеран",
    index: 4,
    minLevel: 20,
    color: "hsl(25, 90%, 55%)",
    gradient: "from-orange-400 to-orange-600",
  },
  {
    name: "Эксперт",
    index: 5,
    minLevel: 30,
    color: "hsl(0, 75%, 55%)",
    gradient: "from-red-400 to-red-600",
  },
  {
    name: "Мастер",
    index: 6,
    minLevel: 40,
    color: "hsl(45, 90%, 50%)",
    gradient: "from-yellow-400 to-amber-500",
  },
  {
    name: "Легенда",
    index: 7,
    minLevel: 50,
    color: "hsl(280, 80%, 65%)",
    gradient: "from-violet-400 via-pink-500 to-amber-400",
  },
]

export function getTierFromLevel(level: number): TierConfig {
  // Iterate in reverse to find the highest matching tier
  for (let i = TIER_CONFIGS.length - 1; i >= 0; i--) {
    if (level >= TIER_CONFIGS[i].minLevel) {
      return TIER_CONFIGS[i]
    }
  }
  return TIER_CONFIGS[0]
}

export function getLevelProgress(level: number, xp: number, xpToNext: number): LevelProgress {
  const tier = getTierFromLevel(level)
  const xpPercent = xpToNext > 0 ? Math.min(Math.round((xp / xpToNext) * 100), 100) : 0

  return {
    level,
    xp,
    xpToNext,
    xpPercent,
    tierName: tier.name,
    tierIndex: tier.index,
    tierColor: tier.color,
    tierGradient: tier.gradient,
  }
}
