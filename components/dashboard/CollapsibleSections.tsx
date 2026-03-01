"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { LifeBalance } from "./LifeBalance"
import { useAchievements } from "@/hooks/modules/use-achievements"
import { useStats } from "@/hooks/modules/use-stats"
import { FadeIn } from "@/components/animations"
import { ChevronDown, BarChart2, Trophy, Globe2, Zap, Star } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import type { Achievement } from "@/lib/types/achievements"

// ─── Weekly Progress ──────────────────────────────────────────
function WeekProgressSection() {
  const { data: stats } = useStats()

  const items = [
    {
      label: "XP набрано",
      value: stats?.xp ?? 0,
      max: stats?.xpToNext ?? 1000,
      colorClass: "bg-primary",
    },
    {
      label: "Задач выполнено",
      value: stats?.totalTasksCompleted ?? 0,
      max: 50,
      colorClass: "bg-[#3b82f6]",
    },
    {
      label: "Привычек выполнено",
      value: stats?.totalHabitCompletions ?? 0,
      max: 21,
      colorClass: "bg-green-500",
    },
  ]

  return (
    <div className="space-y-3 py-1">
      {items.map((item) => {
        const pct = Math.min(100, Math.round((item.value / item.max) * 100))
        return (
          <div key={item.label} className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{item.label}</span>
              <span className="font-mono font-semibold text-foreground">
                {item.value.toLocaleString()}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-700", item.colorClass)}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Recent Achievements ────────────────────────────────────────
function RecentAchievementsSection() {
  const { data: achievements } = useAchievements()

  const recent = [...(achievements ?? [])]
    .sort(
      (a, b) =>
        new Date(b.achievementDate).getTime() - new Date(a.achievementDate).getTime()
    )
    .slice(0, 5)

  if (recent.length === 0) {
    return (
      <div className="text-center py-4 space-y-2">
        <p className="text-xs text-muted-foreground">Достижения не зафиксированы</p>
        <Link href="/achievements">
          <Button size="sm" variant="outline" className="text-xs">
            Добавить первое
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-2 py-1">
      {recent.map((a: Achievement) => (
        <div key={a.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-base shrink-0"
            style={{ backgroundColor: `${a.badgeColor}22`, border: `1px solid ${a.badgeColor}44` }}
          >
            {a.badgeIcon || "⭐"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{a.title}</p>
            <p className="text-[11px] text-muted-foreground">
              {new Date(a.achievementDate).toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "short",
              })}
              {a.xpAwarded > 0 && (
                <span className="ml-2 text-chart-3 font-semibold">
                  +{a.xpAwarded} XP
                </span>
              )}
            </p>
          </div>
          <Star
            className={cn(
              "size-3.5 shrink-0",
              a.isFavorite ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30"
            )}
          />
        </div>
      ))}
      <div className="pt-1 flex justify-end">
        <Link href="/achievements">
          <Button variant="ghost" size="sm" className="h-7 text-xs">
            Все достижения →
          </Button>
        </Link>
      </div>
    </div>
  )
}

// ─── Collapsible Section Wrapper ──────────────────────────────
interface Section {
  id: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  content: React.ReactNode
  defaultOpen?: boolean
}

function CollapsibleSection({
  icon: Icon,
  label,
  content,
  defaultOpen = false,
}: Omit<Section, "id">) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold hover:bg-muted/50 transition-colors rounded-lg">
          <div className="flex items-center gap-2">
            <Icon className="size-4 text-primary" />
            {label}
          </div>
          <ChevronDown
            className={cn(
              "size-4 text-muted-foreground transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="px-4 pb-2">
        {content}
      </CollapsibleContent>
    </Collapsible>
  )
}

// ─── Main export ────────────────────────────────────────────────
export function CollapsibleSections() {
  return (
    <FadeIn delay={0.35}>
      <Card className="divide-y divide-border/50">
        <CollapsibleSection
          icon={Globe2}
          label="Баланс жизни"
          content={<LifeBalance />}
        />
        <CollapsibleSection
          icon={Trophy}
          label="Последние достижения"
          content={<RecentAchievementsSection />}
        />
        <CollapsibleSection
          icon={BarChart2}
          label="Прогресс (всего)"
          content={<WeekProgressSection />}
        />
      </Card>
    </FadeIn>
  )
}
