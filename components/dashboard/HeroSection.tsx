"use client"

import Link from "next/link"
import { useDashboardData } from "@/hooks/useDashboardData"
import { useLevelProgress } from "@/hooks/useLevelProgress"
import { FadeIn } from "@/components/animations"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

const ACCENT_COLOR = "#8b5cf6"

export function HeroSection() {
  const data = useDashboardData()
  const lp = useLevelProgress()

  const displayName = data.identity?.name || "Игрок"
  const coins = data.stats?.coins ?? 0
  const streak = data.stats?.currentStreak ?? 0

  return (
    <FadeIn>
      <Link href="/settings" className="block group">
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 hover:bg-accent/30 transition-colors">

          {/* Avatar circle */}
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold"
            style={{
              background: `${lp.tierColor}22`,
              border: `1.5px solid ${lp.tierColor}55`,
              color: lp.tierColor,
            }}
          >
            {lp.level}
          </div>

          {/* Name + XP bar */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-sm font-semibold truncate">{displayName}</span>
              <span
                className="text-[11px] font-medium px-1.5 py-px rounded-full shrink-0"
                style={{
                  background: `${lp.tierColor}18`,
                  color: lp.tierColor,
                  border: `1px solid ${lp.tierColor}35`,
                }}
              >
                {lp.tierName}
              </span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <div
                className="flex-1"
                style={{ filter: `drop-shadow(0 0 6px ${lp.tierColor}90)` }}
              >
                <Progress
                  value={lp.xpPercent}
                  className="h-3.5"
                  style={{ "--progress-color": lp.tierColor } as React.CSSProperties}
                />
              </div>
              <span className="text-xs font-bold font-mono shrink-0" style={{ color: lp.tierColor }}>
                {lp.xp.toLocaleString()}
              </span>
              <span className="text-[11px] text-muted-foreground font-mono shrink-0">
                / {lp.xpToNext.toLocaleString()}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              До след. уровня:{" "}
              <span className="font-semibold text-foreground/70">
                {(lp.xpToNext - lp.xp).toLocaleString()} XP
              </span>
            </p>
          </div>

          {/* Stats chips */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            <StatChip emoji="🪙" value={coins.toLocaleString()} label="монет" />
            <StatChip emoji="🔥" value={streak} label="серия" />
          </div>

        </div>
      </Link>
    </FadeIn>
  )
}

function StatChip({
  emoji,
  value,
  label,
}: {
  emoji: string
  value: string | number
  label: string
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-sm leading-none">{emoji}</span>
      <div className="flex flex-col">
        <span className="text-xs font-bold leading-none font-mono">{value}</span>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider leading-none mt-0.5">
          {label}
        </span>
      </div>
    </div>
  )
}
