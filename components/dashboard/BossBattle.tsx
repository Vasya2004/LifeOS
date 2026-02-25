"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useGoals } from "@/hooks/modules/use-goals"
import { FadeIn } from "@/components/animations"
import { Skull, Plus, ArrowRight, CalendarDays, Zap } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import type { Goal } from "@/lib/types"

function getDaysLeft(targetDate: string): number | null {
  if (!targetDate) return null
  const diff = new Date(targetDate).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

function estimateXpReward(goal: Goal): number {
  // Priority 1-5 numeric: 5 = most important
  const base = (goal.priority as number) * 100
  const progressBonus = Math.round((goal.progress / 100) * 200)
  return base + progressBonus
}

export function BossBattle() {
  const { data: goals, isLoading } = useGoals()

  const boss = useMemo(() => {
    if (!goals) return null
    const active = goals.filter((g: Goal) => g.status === "active")
    // Priority is numeric 1-5: sort descending (5 = highest first)
    const sorted = active.slice().sort((a: Goal, b: Goal) => {
      const pDiff = (b.priority as number) - (a.priority as number)
      if (pDiff !== 0) return pDiff
      return (b.progress ?? 0) - (a.progress ?? 0)
    })
    return sorted[0] ?? null
  }, [goals])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-3">
            <div className="h-5 w-32 bg-muted animate-pulse rounded" />
            <div className="h-7 w-64 bg-muted animate-pulse rounded" />
            <div className="h-3 w-full bg-muted animate-pulse rounded" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!boss) {
    return (
      <FadeIn delay={0.2}>
        <Card className="border-dashed">
          <CardContent className="p-6 text-center space-y-3">
            <Skull className="size-8 mx-auto text-muted-foreground/50" />
            <div>
              <p className="font-semibold text-sm">Нет активной Босс-Битвы</p>
              <p className="text-xs text-muted-foreground mt-1">
                Создайте главную цель квартала, чтобы сфокусировать усилия.
              </p>
            </div>
            <Link href="/goals">
              <Button size="sm" variant="outline" className="gap-1">
                <Plus className="size-3" />
                Создать главную цель
              </Button>
            </Link>
          </CardContent>
        </Card>
      </FadeIn>
    )
  }

  const daysLeft = getDaysLeft(boss.targetDate)
  const xpReward = estimateXpReward(boss)
  const isUrgent = daysLeft !== null && daysLeft <= 14

  return (
    <FadeIn delay={0.2}>
      <Card className="border-destructive/20 bg-gradient-to-br from-destructive/5 to-background overflow-hidden">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-destructive/10">
              <Skull className="size-4 text-destructive" />
            </div>
            <div>
              <CardTitle className="text-base">Босс-Битва</CardTitle>
              <p className="text-[11px] text-muted-foreground">Главная цель квартала</p>
            </div>
          </div>
          <Link href={`/goals`}>
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
              Детали <ArrowRight className="size-3" />
            </Button>
          </Link>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Title */}
          <h3 className="font-bold text-base leading-tight">{boss.title}</h3>

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>Прогресс</span>
              <span className="font-bold text-foreground">{boss.progress}%</span>
            </div>
            <div className="relative h-3 w-full rounded-full bg-muted overflow-hidden">
              <motion.div
                className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-destructive/70 to-destructive"
                initial={{ width: 0 }}
                animate={{ width: `${boss.progress}%` }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.5 }}
              />
            </div>
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-4 text-xs">
            {daysLeft !== null && (
              <div
                className={`flex items-center gap-1 font-semibold ${
                  isUrgent ? "text-destructive" : "text-muted-foreground"
                }`}
              >
                <CalendarDays className="size-3.5" />
                {daysLeft === 0
                  ? "Сегодня дедлайн!"
                  : `Осталось ${daysLeft} ${daysLeft === 1 ? "день" : daysLeft < 5 ? "дня" : "дней"}`}
              </div>
            )}
            <div className="flex items-center gap-1 text-chart-3 font-semibold ml-auto">
              <Zap className="size-3.5" />
              {xpReward} XP награда
            </div>
          </div>
        </CardContent>
      </Card>
    </FadeIn>
  )
}
