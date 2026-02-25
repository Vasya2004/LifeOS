"use client"

import { useAreas } from "@/hooks/modules/use-areas"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import type { LifeArea } from "@/lib/types"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function LifeBalance() {
  const { data: areas } = useAreas()

  const activeAreas = areas?.filter((a: LifeArea) => a.isActive) ?? []

  if (activeAreas.length === 0) {
    return (
      <div className="text-center py-4 space-y-2">
        <p className="text-sm text-muted-foreground">Сферы жизни не настроены</p>
        <Link href="/areas">
          <Button size="sm" variant="outline">
            Настроить сферы
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {activeAreas.slice(0, 8).map((area: LifeArea) => {
        const pct = Math.round(((area.currentLevel ?? 1) / 10) * 100)
        return (
          <div key={area.id} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <span>{area.icon}</span>
                <span className="font-medium">{area.name}</span>
              </div>
              <span className="text-muted-foreground font-mono">
                {area.currentLevel ?? 1}/10
              </span>
            </div>
            <div className="relative h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${pct}%`,
                  backgroundColor: area.color || "hsl(var(--primary))",
                }}
              />
            </div>
          </div>
        )
      })}

      <div className="pt-1 flex justify-end">
        <Link href="/areas">
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
            Управление <ArrowRight className="size-3" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
