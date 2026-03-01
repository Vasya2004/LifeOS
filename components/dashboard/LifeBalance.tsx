"use client"

import { useAreas } from "@/hooks/modules/use-areas"
import { cn } from "@/lib/utils"
import type { LifeArea } from "@/lib/types"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BarChart3 } from "lucide-react"

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

  // Detect if all areas are at the default level (never rated)
  const allDefault = activeAreas.every((a: LifeArea) => (a.currentLevel ?? 1) <= 1)

  if (allDefault) {
    return (
      <div className="py-2 space-y-3">
        <div className="flex items-start gap-3 rounded-lg border border-dashed border-primary/30 bg-primary/5 p-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <BarChart3 className="size-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Оцени свои сферы жизни</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              Укажи текущий уровень от 1 до 10 — это покажет реальную картину баланса.
            </p>
            <Link href="/areas">
              <Button size="sm" variant="outline" className="mt-2 h-7 text-xs gap-1 border-primary/30 text-primary hover:bg-primary/10">
                Оценить сферы <ArrowRight className="size-3" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Still show areas as preview */}
        {activeAreas.slice(0, 4).map((area: LifeArea) => (
          <div key={area.id} className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{area.icon}</span>
            <span className="flex-1">{area.name}</span>
            <span className="font-mono">—/10</span>
          </div>
        ))}
        {activeAreas.length > 4 && (
          <p className="text-xs text-muted-foreground">+{activeAreas.length - 4} сфер</p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {activeAreas.slice(0, 8).map((area: LifeArea) => {
        const level = area.currentLevel ?? 1
        const pct = Math.round((level / 10) * 100)
        return (
          <div key={area.id} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <span>{area.icon}</span>
                <span className="font-medium">{area.name}</span>
              </div>
              <span className="text-muted-foreground font-mono">
                {level}/10
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
