"use client"

import { Card, CardContent } from "@/components/ui/card"
import { AvatarDisplay } from "./AvatarDisplay"
import { XPProgressBar } from "./XPProgressBar"
import { useDashboardData } from "@/hooks/useDashboardData"
import { useLevelProgress } from "@/hooks/useLevelProgress"
import { FadeIn } from "@/components/animations"
import { Coins, Flame, CheckSquare, Heart } from "lucide-react"
import { cn } from "@/lib/utils"

function ResourceChip({
  icon: Icon,
  label,
  value,
  colorClass,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
  colorClass: string
}) {
  return (
    <div className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 min-w-[70px]">
      <Icon className={cn("size-4", colorClass)} />
      <span className="text-lg font-bold leading-none font-mono">{value}</span>
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider leading-none">
        {label}
      </span>
    </div>
  )
}

export function HeroSection() {
  const data = useDashboardData()
  const levelProgress = useLevelProgress()

  const displayName = data.identity?.name || "Игрок"
  const coins = data.stats?.coins ?? 0
  const streak = data.stats?.currentStreak ?? 0
  const pendingTasks = data.pendingTodayTasks
  const energy = data.energyPercent

  return (
    <FadeIn>
      <Card className="border-white/10 bg-gradient-to-br from-background to-muted/30 overflow-hidden">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
            {/* Left: Avatar + Info */}
            <div className="flex flex-col sm:flex-row items-center gap-4 flex-shrink-0">
              <AvatarDisplay
                tierIndex={levelProgress.tierIndex}
                tierName={levelProgress.tierName}
                level={levelProgress.level}
                size={100}
              />
              <div className="text-center sm:text-left space-y-1">
                <h2 className="text-xl font-bold font-heading leading-tight">{displayName}</h2>
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <span
                    className="text-sm font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      background: `${levelProgress.tierColor}22`,
                      color: levelProgress.tierColor,
                      border: `1px solid ${levelProgress.tierColor}44`,
                    }}
                  >
                    {levelProgress.tierName}
                  </span>
                  <span className="text-sm text-muted-foreground font-mono">Ур. {levelProgress.level}</span>
                </div>
                <div className="pt-1 w-48 sm:w-56">
                  <XPProgressBar
                    xp={levelProgress.xp}
                    xpToNext={levelProgress.xpToNext}
                    xpPercent={levelProgress.xpPercent}
                    tierColor={levelProgress.tierColor}
                    tierGradient={levelProgress.tierGradient}
                  />
                </div>
              </div>
            </div>

            {/* Right: Resources */}
            <div className="flex flex-wrap gap-2 justify-center sm:justify-end sm:ml-auto">
              <ResourceChip
                icon={Coins}
                label="Монеты"
                value={coins.toLocaleString()}
                colorClass="text-yellow-400"
              />
              <ResourceChip
                icon={Flame}
                label="Серия"
                value={streak}
                colorClass="text-orange-400"
              />
              <ResourceChip
                icon={CheckSquare}
                label="Сегодня"
                value={pendingTasks}
                colorClass="text-blue-400"
              />
              <ResourceChip
                icon={Heart}
                label="Энергия"
                value={`${energy}%`}
                colorClass="text-red-400"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </FadeIn>
  )
}
