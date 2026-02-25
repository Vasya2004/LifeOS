"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FadeIn } from "@/components/animations"
import { useFinancialStats } from "@/hooks/modules/use-finance"
import { useBodyZonesStats } from "@/hooks/modules/use-health"
import { useTopSkills } from "@/hooks/modules/use-skills"
import { useGoals } from "@/hooks/modules/use-goals"
import { BarChart3, Heart, TrendingUp, Brain, Target, ArrowRight } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import type { Goal } from "@/lib/types"

interface MetricCardProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  subtext?: string
  trend?: "up" | "down" | "neutral"
  href: string
  colorClass: string
  bgClass: string
}

function MetricCard({
  icon: Icon,
  label,
  value,
  subtext,
  trend,
  href,
  colorClass,
  bgClass,
}: MetricCardProps) {
  const trendIcon =
    trend === "up" ? "↑" : trend === "down" ? "↓" : null

  return (
    <Link href={href}>
      <div
        className={cn(
          "group p-3 rounded-xl border transition-all cursor-pointer",
          bgClass
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className={cn("p-1.5 rounded-lg", bgClass)}>
            <Icon className={cn("size-3.5", colorClass)} />
          </div>
          <ArrowRight className="size-3 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors mt-0.5" />
        </div>
        <div className="mt-2">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold leading-none font-mono">{value}</span>
            {trendIcon && (
              <span
                className={cn(
                  "text-xs font-bold",
                  trend === "up" ? "text-green-500" : "text-red-500"
                )}
              >
                {trendIcon}
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
          {subtext && (
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">{subtext}</p>
          )}
        </div>
      </div>
    </Link>
  )
}

export function MiniMetrics() {
  const { data: finStats } = useFinancialStats()
  const { data: healthStats } = useBodyZonesStats()
  const { data: topSkills } = useTopSkills(1)
  const { data: goals } = useGoals()

  const activeGoals = goals?.filter((g: Goal) => g.status === "active") ?? []
  const avgGoalProgress =
    activeGoals.length > 0
      ? Math.round(activeGoals.reduce((sum: number, g: Goal) => sum + (g.progress ?? 0), 0) / activeGoals.length)
      : 0

  const savingsRate = finStats?.savingsRate ?? 0
  const netWorth = finStats?.netWorth ?? 0
  const healthScore = healthStats?.healthScore ?? 80
  const topSkill = topSkills?.[0]

  return (
    <FadeIn delay={0.2}>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="size-4 text-primary" />
            Статус модулей
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2">
          {/* Finance */}
          <MetricCard
            icon={TrendingUp}
            label="Накопления"
            value={
              finStats
                ? `${Math.round(savingsRate * 100)}%`
                : "—"
            }
            subtext={
              netWorth !== 0
                ? `Капитал: ${netWorth.toLocaleString("ru", { notation: "compact", maximumFractionDigits: 1 })}`
                : "Нет данных"
            }
            trend={savingsRate >= 0.1 ? "up" : savingsRate < 0 ? "down" : "neutral"}
            href="/finance"
            colorClass="text-green-400"
            bgClass="bg-green-500/8 hover:bg-green-500/15 border-green-500/15"
          />

          {/* Health */}
          <MetricCard
            icon={Heart}
            label="Здоровье"
            value={`${healthScore}%`}
            subtext={
              healthStats
                ? healthStats.red > 0
                  ? `${healthStats.red} зон требует внимания`
                  : "Всё в норме"
                : "Нет данных"
            }
            trend={healthScore >= 80 ? "up" : healthScore < 50 ? "down" : "neutral"}
            href="/health"
            colorClass="text-red-400"
            bgClass="bg-red-500/8 hover:bg-red-500/15 border-red-500/15"
          />

          {/* Top Skill */}
          <MetricCard
            icon={Brain}
            label="Топ навык"
            value={topSkill ? `Ур. ${topSkill.currentLevel}` : "—"}
            subtext={topSkill?.name ?? "Нет навыков"}
            href="/skills"
            colorClass="text-purple-400"
            bgClass="bg-purple-500/8 hover:bg-purple-500/15 border-purple-500/15"
          />

          {/* Goals Progress */}
          <MetricCard
            icon={Target}
            label="Цели"
            value={activeGoals.length > 0 ? `${avgGoalProgress}%` : "—"}
            subtext={
              activeGoals.length > 0
                ? `${activeGoals.length} активных`
                : "Нет активных целей"
            }
            trend={avgGoalProgress >= 50 ? "up" : "neutral"}
            href="/goals"
            colorClass="text-blue-400"
            bgClass="bg-blue-500/8 hover:bg-blue-500/15 border-blue-500/15"
          />
        </CardContent>
      </Card>
    </FadeIn>
  )
}
