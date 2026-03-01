"use client"

import { useAreas } from "@/hooks"
import { cn } from "@/lib/utils"
import type { LifeArea } from "@/lib/types"

const AREA_ICONS: Record<string, string> = {
  heart: "❤️", briefcase: "💼", wallet: "💰", users: "🤝",
  brain: "🧠", gamepad: "🎮", home: "🏠", sparkles: "✨",
}

const STAT_LABELS: Record<string, string> = {
  health: "VIT",  career: "ATK",  finance: "GOLD",  relationships: "CHA",
  growth: "INT",  recreation: "LCK", environment: "DEF", spirituality: "WIS",
}

function StatBar({ area }: { area: LifeArea }) {
  const pct = Math.round((area.currentLevel / 10) * 100)
  const icon = AREA_ICONS[area.icon] ?? "⚙️"
  const abbr = STAT_LABELS[area.id] ?? area.name.slice(0, 3).toUpperCase()

  return (
    <div className="flex items-center gap-3">
      {/* Stat abbreviation */}
      <span className="text-xs font-bold font-mono w-10 text-right shrink-0" style={{ color: area.color }}>
        {abbr}
      </span>

      {/* Bar */}
      <div className="flex-1 relative h-4 rounded-sm bg-muted/40 overflow-hidden">
        <div
          className="h-full rounded-sm transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${area.color}80, ${area.color})`,
            boxShadow: `0 0 8px ${area.color}60`,
          }}
        />
        {/* Pixel grid overlay */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 7px, rgba(0,0,0,0.3) 7px, rgba(0,0,0,0.3) 8px)`
        }} />
      </div>

      {/* Level number */}
      <div className="flex items-baseline gap-0.5 shrink-0 w-14">
        <span className="text-sm font-bold font-mono" style={{ color: area.color }}>{area.currentLevel}</span>
        <span className="text-xs text-muted-foreground font-mono">/10</span>
      </div>

      {/* Area name + icon */}
      <div className="flex items-center gap-1 w-28 shrink-0">
        <span className="text-base leading-none">{icon}</span>
        <span className="text-xs text-muted-foreground truncate">{area.name}</span>
      </div>
    </div>
  )
}

function TotalPower({ areas }: { areas: LifeArea[] }) {
  if (!areas.length) return null
  const total = areas.reduce((s, a) => s + a.currentLevel, 0)
  const max   = areas.length * 10
  const pct   = Math.round((total / max) * 100)

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Общая мощь</p>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black font-mono text-primary">{total}</span>
          <span className="text-xs text-muted-foreground font-mono">/ {max}</span>
        </div>
      </div>
      <div className="relative h-3 rounded-full bg-muted/40 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899)',
            boxShadow: '0 0 12px rgba(139,92,246,0.5)',
          }}
        />
      </div>
      <p className="text-right text-xs text-muted-foreground mt-1 font-mono">{pct}%</p>
    </div>
  )
}

export function AttributesTab() {
  const { data: areas } = useAreas()
  const active = (areas ?? []).filter(a => a.isActive).sort((a, b) => b.currentLevel - a.currentLevel)

  if (!active.length) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-sm">Настрой сферы жизни в разделе «Сферы жизни», чтобы видеть атрибуты здесь.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <TotalPower areas={active} />

      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Атрибуты персонажа</p>
        {active.map(a => <StatBar key={a.id} area={a} />)}
      </div>

      <p className="text-xs text-center text-muted-foreground">
        Атрибуты растут при оценке сфер жизни в разделе «Сферы»
      </p>
    </div>
  )
}
