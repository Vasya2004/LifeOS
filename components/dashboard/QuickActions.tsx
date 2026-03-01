"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui"
import { FadeIn } from "@/components/animations"
import { CheckSquare, Target, TrendingUp, Repeat, Zap } from "lucide-react"
import Link from "next/link"

const ACTIONS = [
  {
    label: "Новая задача",
    href: "/tasks/new",
    icon: CheckSquare,
    variant: "outline" as const,
    colorClass: "text-[#60a5fa]",
  },
  {
    label: "Новая цель",
    href: "/goals",
    icon: Target,
    variant: "outline" as const,
    colorClass: "text-blue-400",
  },
  {
    label: "Ежедневный обзор",
    href: "/review",
    icon: TrendingUp,
    variant: "outline" as const,
    colorClass: "text-emerald-400",
  },
  {
    label: "Новая привычка",
    href: "/habits",
    icon: Repeat,
    variant: "outline" as const,
    colorClass: "text-orange-400",
  },
]

export function QuickActions() {
  return (
    <FadeIn delay={0.15} className="h-full">
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-heading flex items-center gap-2">
            <Zap className="size-4 text-[#3b82f6]" />
            Быстрые действия
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2">
          {ACTIONS.map((action) => {
            const Icon = action.icon
            return (
              <Link key={action.href} href={action.href}>
                <Button
                  variant={action.variant}
                  className="w-full h-auto py-3 flex-col gap-1.5 transition-all"
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
