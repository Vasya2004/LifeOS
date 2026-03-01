"use client"

import { useMemo } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button, XpBadge } from "@/components/ui"
import { GoalProgress } from "@/components/ui"
import { SkeletonCard } from "@/components/ui"
import { useGoals } from "@/hooks/modules/use-goals"
import { FadeIn } from "@/components/animations"
import { Skull, Plus, ArrowRight, CalendarDays } from "lucide-react"
import Link from "next/link"
import type { Goal } from "@/lib/types"

function getDaysLeft(targetDate: string): number | null {
  if (!targetDate) return null
  const diff = new Date(targetDate).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

function estimateXpReward(goal: Goal): number {
  const base = (goal.priority as number) * 100
  const progressBonus = Math.round((goal.progress / 100) * 200)
  return base + progressBonus
}

export function BossBattle() {
  const { data: goals, isLoading } = useGoals()

  const boss = useMemo(() => {
    if (!goals) return null
    const active = goals.filter((g: Goal) => g.status === "active")
    const sorted = active.slice().sort((a: Goal, b: Goal) => {
      const pDiff = (b.priority as number) - (a.priority as number)
      if (pDiff !== 0) return pDiff
      return (b.progress ?? 0) - (a.progress ?? 0)
    })
    return sorted[0] ?? null
  }, [goals])

  if (isLoading) {
    return <SkeletonCard />
  }

  if (!boss) {
    return (
      <FadeIn delay={0.2}>
        <Card className="h-full border-red-500/10 overflow-hidden">
          <CardContent className="p-6 flex flex-col items-center justify-center min-h-[160px] text-center space-y-3">
            <div className="relative">
              <div className="flex size-14 items-center justify-center rounded-full bg-red-500/10 ring-1 ring-red-500/20">
                <Skull className="size-7 text-red-400/60" />
              </div>
              <div className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
                ?
              </div>
            </div>
            <div>
              <p className="font-semibold text-sm font-heading">Твой первый Босс ждёт!</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-[220px] leading-relaxed">
                Определи главную цель квартала — это твой финальный Босс. Победи его и получи эпическую награду.
              </p>
            </div>
            <Link href="/goals">
              <Button variant="outline" size="sm" className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50">
                <Plus className="size-3 mr-1" />
                Бросить вызов Боссу
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
      <Card className="border-red-500/20 overflow-hidden">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-red-500/10">
              <Skull className="size-4 text-red-500" />
            </div>
            <div>
              <CardTitle className="text-base font-heading">Босс-Битва</CardTitle>
              <p className="text-xs text-muted-foreground">Главная цель квартала</p>
            </div>
          </div>
          <Link href={`/goals`}>
            <Button variant="ghost" size="sm">
              Детали <ArrowRight className="size-3 ml-1" />
            </Button>
          </Link>
        </CardHeader>

        <CardContent className="space-y-4">
          <h3 className="font-bold font-heading text-base leading-tight">{boss.title}</h3>

          <GoalProgress 
            current={boss.progress} 
            target={100} 
            title="Прогресс" 
          />

          <div className="flex items-center gap-4 text-xs">
            {daysLeft !== null && (
              <div
                className={`flex items-center gap-1 font-semibold ${
                  isUrgent ? "text-orange-400" : "text-muted-foreground"
                }`}
              >
                <CalendarDays className="size-3.5" />
                {daysLeft === 0
                  ? "Сегодня дедлайн!"
                  : `Осталось ${daysLeft} ${daysLeft === 1 ? "день" : daysLeft < 5 ? "дня" : "дней"}`}
              </div>
            )}
            <div className="ml-auto">
              <XpBadge value={xpReward} />
            </div>
          </div>
        </CardContent>
      </Card>
    </FadeIn>
  )
}
