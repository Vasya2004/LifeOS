"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Trophy, Zap, Star, Sparkles, Heart, Clock, Flame } from "lucide-react"
import type { AchievementStats } from "@/lib/types/achievements"
import { ACHIEVEMENT_TYPE_CONFIG } from "@/lib/types/achievements"
import { cn } from "@/lib/utils"

interface AchievementStatsProps {
  stats: AchievementStats
}

export function AchievementStatsDisplay({ stats }: AchievementStatsProps) {
  const totalByType = stats.microCount + stats.macroCount + stats.breakthroughCount + stats.momentCount
  
  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Trophy}
          label="Всего"
          value={stats.totalCount}
          color="#6366f1"
        />
        <StatCard
          icon={Zap}
          label="Микро"
          value={stats.microCount}
          color={ACHIEVEMENT_TYPE_CONFIG.micro.color}
        />
        <StatCard
          icon={Star}
          label="Прорывы"
          value={stats.breakthroughCount}
          color={ACHIEVEMENT_TYPE_CONFIG.breakthrough.color}
        />
        <StatCard
          icon={Flame}
          label="Серия"
          value={stats.currentStreakDays}
          suffix="дн"
          color="#f97316"
          highlight={stats.currentStreakDays > 0}
        />
      </div>

      {/* Distribution */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Распределение по типам</h3>
          
          <div className="space-y-4">
            <DistributionBar
              icon={Zap}
              label="Микро-победы"
              count={stats.microCount}
              total={totalByType}
              color={ACHIEVEMENT_TYPE_CONFIG.micro.color}
            />
            <DistributionBar
              icon={Trophy}
              label="Крупные цели"
              count={stats.macroCount}
              total={totalByType}
              color={ACHIEVEMENT_TYPE_CONFIG.macro.color}
            />
            <DistributionBar
              icon={Star}
              label="Прорывы"
              count={stats.breakthroughCount}
              total={totalByType}
              color={ACHIEVEMENT_TYPE_CONFIG.breakthrough.color}
            />
            <DistributionBar
              icon={Sparkles}
              label="Магические моменты"
              count={stats.momentCount}
              total={totalByType}
              color={ACHIEVEMENT_TYPE_CONFIG.moment.color}
            />
          </div>
        </CardContent>
      </Card>

      {/* Secondary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <SecondaryStat
          icon={Heart}
          label="Избранное"
          value={stats.favoriteCount}
        />
        <SecondaryStat
          icon={Clock}
          label="Капсулы"
          value={stats.timeCapsuleCount}
        />
        <SecondaryStat
          icon={Flame}
          label="Рекорд серии"
          value={stats.longestStreakDays}
          suffix="дн"
        />
      </div>
    </div>
  )
}

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
  suffix?: string
  color: string
  highlight?: boolean
}

function StatCard({ icon: Icon, label, value, suffix, color, highlight }: StatCardProps) {
  return (
    <Card className={cn(highlight && "border-primary/50")}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div 
            className="flex size-10 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${color}20`, color }}
          >
            <Icon className="size-5" />
          </div>
          <div>
            <p className="text-2xl font-bold">
              {value}
              {suffix && <span className="text-sm font-normal text-muted-foreground">{suffix}</span>}
            </p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface DistributionBarProps {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  label: string
  count: number
  total: number
  color: string
}

function DistributionBar({ icon: Icon, label, count, total, color }: DistributionBarProps) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Icon className="size-4" style={{ color }} />
          <span>{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium">{count}</span>
          <span className="text-xs text-muted-foreground">({percentage}%)</span>
        </div>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

interface SecondaryStatProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
  suffix?: string
}

function SecondaryStat({ icon: Icon, label, value, suffix }: SecondaryStatProps) {
  return (
    <div className="flex flex-col items-center p-4 rounded-lg bg-muted/50">
      <Icon className="size-5 text-muted-foreground mb-1" />
      <p className="text-xl font-semibold">
        {value}
        {suffix && <span className="text-xs font-normal">{suffix}</span>}
      </p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}
