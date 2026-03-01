"use client"

import * as React from "react"
import { useIdentity, useUpdateIdentity } from "@/hooks"
import { useStats } from "@/hooks"
import { useLevelProgress } from "@/hooks/useLevelProgress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { FadeIn } from "@/components/animations"
import { PixelCharacter, loadCharacterConfig, saveCharacterConfig, DEFAULT_CHARACTER_CONFIG } from "@/components/profile/PixelCharacter"
import { PrinciplesTab } from "@/components/profile/PrinciplesTab"
import { ValuesTab } from "@/components/profile/ValuesTab"
import { AttributesTab } from "@/components/profile/AttributesTab"
import type { CharacterConfig, CharacterClass, CharacterBackground } from "@/components/profile/PixelCharacter"
import { Pencil, Check, X, Flame, Trophy, CheckSquare, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Character tab ────────────────────────────────────────────────

const CLASS_OPTIONS: { id: CharacterClass; label: string; emoji: string; desc: string }[] = [
  { id: 'knight', label: 'Рыцарь', emoji: '⚔️', desc: 'Защитник и воин. Дисциплина превыше всего.' },
  { id: 'mage',   label: 'Маг',    emoji: '🔮', desc: 'Мудрец и исследователь. Знание — сила.' },
  { id: 'ranger', label: 'Лесник', emoji: '🏹', desc: 'Охотник и разведчик. Свобода и точность.' },
  { id: 'rogue',  label: 'Плут',   emoji: '🗡️', desc: 'Хитрец и адаптер. Гибкость — главное.' },
]

const BG_OPTIONS: { id: CharacterBackground; label: string; emoji: string }[] = [
  { id: 'void',    label: 'Пустота',  emoji: '🌑' },
  { id: 'stars',   label: 'Звёзды',   emoji: '✨' },
  { id: 'dungeon', label: 'Подземелье', emoji: '🏰' },
  { id: 'forest',  label: 'Лес',      emoji: '🌲' },
]

const COLOR_PRESETS = [
  null, // tier color
  '#8b5cf6', '#6366f1', '#ec4899', '#f59e0b',
  '#10b981', '#3b82f6', '#ef4444', '#f97316',
  '#06b6d4', '#84cc16', '#ffffff',
]

function CharacterTab({ config, onChange }: { config: CharacterConfig; onChange: (c: CharacterConfig) => void }) {
  const lp = useLevelProgress()

  return (
    <div className="space-y-6">
      {/* Class selection */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Класс персонажа</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {CLASS_OPTIONS.map(opt => (
            <button
              key={opt.id}
              onClick={() => onChange({ ...config, class: opt.id })}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border p-4 text-sm transition-all",
                config.class === opt.id
                  ? "border-primary/60 bg-primary/10 text-primary shadow-[0_0_16px_rgba(139,92,246,0.2)]"
                  : "border-border hover:border-primary/30 hover:bg-accent/30 text-muted-foreground"
              )}
            >
              <span className="text-2xl">{opt.emoji}</span>
              <span className="font-semibold">{opt.label}</span>
              <span className="text-[10px] text-center leading-tight opacity-70">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Background */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Фон</p>
        <div className="flex gap-2 flex-wrap">
          {BG_OPTIONS.map(bg => (
            <button
              key={bg.id}
              onClick={() => onChange({ ...config, background: bg.id })}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all",
                config.background === bg.id
                  ? "border-primary/60 bg-primary/10 text-primary"
                  : "border-border hover:border-primary/30 text-muted-foreground"
              )}
            >
              <span>{bg.emoji}</span>
              <span>{bg.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Armor color */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Цвет брони</p>
        <div className="flex gap-2 flex-wrap items-center">
          {COLOR_PRESETS.map((c, i) => (
            <button
              key={i}
              onClick={() => onChange({ ...config, armorColor: c })}
              className={cn(
                "size-8 rounded-full border-2 transition-all",
                config.armorColor === c ? "scale-125 border-white" : "border-transparent hover:scale-110"
              )}
              style={{
                background: c ?? `linear-gradient(135deg, ${lp.tierColor}, ${lp.tierColor}80)`,
                boxShadow: config.armorColor === c ? `0 0 10px ${c ?? lp.tierColor}80` : undefined,
              }}
              title={c === null ? "Цвет уровня (авто)" : c}
            />
          ))}
          <span className="text-xs text-muted-foreground ml-2">← Авто (цвет уровня)</span>
        </div>
      </div>
    </div>
  )
}

// ─── Bio tab ──────────────────────────────────────────────────────

function BioTab() {
  const { data: stats } = useStats()
  const { data: identity } = useIdentity()
  const updateIdentity = useUpdateIdentity()
  const [editing, setEditing] = React.useState(false)
  const [vision, setVision] = React.useState(identity?.vision ?? "")
  const [mission, setMission] = React.useState(identity?.mission ?? "")

  React.useEffect(() => {
    setVision(identity?.vision ?? "")
    setMission(identity?.mission ?? "")
  }, [identity])

  const save = () => {
    updateIdentity({ vision: vision.trim(), mission: mission.trim() })
    setEditing(false)
  }

  const statCards = [
    { icon: Flame,       label: "Серия",     value: `${stats?.currentStreak ?? 0} дн.`,     color: "text-orange-400" },
    { icon: CheckSquare, label: "Задач",      value: stats?.totalTasksCompleted ?? 0,          color: "text-primary" },
    { icon: Trophy,      label: "Целей",      value: stats?.totalGoalsAchieved ?? 0,           color: "text-yellow-400" },
    { icon: Clock,       label: "Глуб. работа", value: `${stats?.totalDeepWorkHours ?? 0}ч`,  color: "text-blue-400" },
  ]

  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {statCards.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-4 text-center">
            <Icon className={cn("size-5 mx-auto mb-1", color)} />
            <p className="text-xl font-black font-mono">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Vision & Mission */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Видение и миссия</p>
          {!editing ? (
            <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
              <Pencil className="size-3 mr-1" />Редактировать
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button size="sm" onClick={save}><Check className="size-3 mr-1" />Сохранить</Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)}><X className="size-3" /></Button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">🔭 Видение на 5 лет</p>
            {editing
              ? <Textarea value={vision} onChange={e => setVision(e.target.value)} placeholder="Каким ты видишь себя через 5 лет?" rows={3} className="resize-none" />
              : <p className="text-sm text-muted-foreground leading-relaxed">{vision || <span className="italic opacity-50">Не заполнено</span>}</p>
            }
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">🎯 Миссия / девиз</p>
            {editing
              ? <Input value={mission} onChange={e => setMission(e.target.value)} placeholder="Ради чего ты делаешь это?" />
              : <p className="text-sm text-muted-foreground">{mission || <span className="italic opacity-50">Не заполнено</span>}</p>
            }
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Profile hero ─────────────────────────────────────────────────

function ProfileHero({ config }: { config: CharacterConfig }) {
  const { data: identity } = useIdentity()
  const updateIdentity = useUpdateIdentity()
  const lp = useLevelProgress()
  const [editing, setEditing] = React.useState(false)
  const [name, setName] = React.useState(identity?.name ?? "")

  React.useEffect(() => { setName(identity?.name ?? "") }, [identity])

  const saveName = () => {
    if (name.trim()) updateIdentity({ name: name.trim() })
    setEditing(false)
  }

  return (
    <div className="relative rounded-2xl border border-border bg-card overflow-hidden">
      {/* Ambient glow */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 20% 50%, ${lp.tierColor}, transparent 60%)` }}
      />

      <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6">
        {/* Character */}
        <div className="shrink-0">
          <PixelCharacter config={config} size={180} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 text-center sm:text-left">
          {/* Name */}
          {editing ? (
            <div className="flex items-center gap-2 mb-2">
              <Input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditing(false) }} className="text-xl font-bold h-auto py-1" autoFocus />
              <Button size="icon" variant="ghost" onClick={saveName}><Check className="size-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => setEditing(false)}><X className="size-4" /></Button>
            </div>
          ) : (
            <button onClick={() => setEditing(true)} className="group flex items-center gap-2 mb-2 mx-auto sm:mx-0">
              <h1 className="text-2xl font-black">{identity?.name ?? "Игрок"}</h1>
              <Pencil className="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}

          {/* Tier badge */}
          <div className="flex items-center gap-2 justify-center sm:justify-start mb-3">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
              style={{ background: `${lp.tierColor}20`, border: `1px solid ${lp.tierColor}50`, color: lp.tierColor }}
            >
              Ур. {lp.level} · {lp.tierName}
            </span>
          </div>

          {/* Mission */}
          {identity?.mission && (
            <p className="text-sm text-muted-foreground italic mb-3 max-w-sm">
              «{identity.mission}»
            </p>
          )}

          {/* XP bar */}
          <div className="max-w-xs mx-auto sm:mx-0">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>{lp.xp.toLocaleString()} XP</span>
              <span>{lp.xpToNext.toLocaleString()} XP</span>
            </div>
            <div className="relative h-2 rounded-full bg-muted/40 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${lp.xpPercent}%`,
                  background: `linear-gradient(90deg, ${lp.tierColor}80, ${lp.tierColor})`,
                  boxShadow: `0 0 8px ${lp.tierColor}60`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────

export default function ProfilePage() {
  const [config, setConfig] = React.useState<CharacterConfig>(DEFAULT_CHARACTER_CONFIG)

  // Load from localStorage after mount
  React.useEffect(() => {
    setConfig(loadCharacterConfig())
  }, [])

  const handleConfigChange = (next: CharacterConfig) => {
    setConfig(next)
    saveCharacterConfig(next)
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8 max-w-3xl mx-auto">
      <FadeIn>
        <ProfileHero config={config} />
      </FadeIn>

      <FadeIn delay={0.1}>
        <Tabs defaultValue="character">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="character">⚔️ Персонаж</TabsTrigger>
            <TabsTrigger value="principles">📜 Принципы</TabsTrigger>
            <TabsTrigger value="values">💎 Ценности</TabsTrigger>
            <TabsTrigger value="attributes">📊 Атрибуты</TabsTrigger>
            <TabsTrigger value="bio">📖 Биография</TabsTrigger>
          </TabsList>

          <TabsContent value="character">
            <CharacterTab config={config} onChange={handleConfigChange} />
          </TabsContent>

          <TabsContent value="principles">
            <PrinciplesTab />
          </TabsContent>

          <TabsContent value="values">
            <ValuesTab />
          </TabsContent>

          <TabsContent value="attributes">
            <AttributesTab />
          </TabsContent>

          <TabsContent value="bio">
            <BioTab />
          </TabsContent>
        </Tabs>
      </FadeIn>
    </div>
  )
}
