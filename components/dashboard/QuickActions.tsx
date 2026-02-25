"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FadeIn } from "@/components/animations"
import { CheckSquare, Target, TrendingUp, Dumbbell, Zap } from "lucide-react"
import Link from "next/link"

const ACTIONS = [
  {
    label: "Новая задача",
    href: "/tasks/new",
    icon: CheckSquare,
    colorClass: "text-blue-400",
    bgClass: "bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20",
  },
  {
    label: "Новая цель",
    href: "/goals",
    icon: Target,
    colorClass: "text-purple-400",
    bgClass: "bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/20",
  },
  {
    label: "Ежедневный обзор",
    href: "/review",
    icon: TrendingUp,
    colorClass: "text-green-400",
    bgClass: "bg-green-500/10 hover:bg-green-500/20 border-green-500/20",
  },
  {
    label: "Добавить тренировку",
    href: "/health",
    icon: Dumbbell,
    colorClass: "text-orange-400",
    bgClass: "bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/20",
  },
]

export function QuickActions() {
  return (
    <FadeIn delay={0.15} className="h-full">
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="size-4 text-primary" />
            Быстрые действия
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2">
          {ACTIONS.map((action) => {
            const Icon = action.icon
            return (
              <Link key={action.href} href={action.href}>
                <Button
                  variant="outline"
                  className={`w-full h-auto py-3 flex-col gap-1.5 border ${action.bgClass} transition-all`}
                >
                  <Icon className={`size-5 ${action.colorClass}`} />
                  <span className="text-xs font-medium leading-tight text-center">
                    {action.label}
                  </span>
                </Button>
              </Link>
            )
          })}
        </CardContent>
      </Card>
    </FadeIn>
  )
}
