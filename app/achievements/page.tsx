"use client"

import * as React from "react"
import { AppShell } from "@/components/app-shell"
import { useAchievements, useAchievementStats, useCreateAchievement } from "@/hooks"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Trophy,
  Star,
  Zap,
  Sparkles,
  Plus,
  Heart,
  Lock,
  Award,
  Flame,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  ACHIEVEMENT_TYPE_CONFIG,
  ACHIEVEMENT_CATEGORY_CONFIG,
  EMOTION_TAG_CONFIG,
  type AchievementType,
  type AchievementCategory,
  type EmotionTag,
} from "@/lib/types/achievements"

// ─── Type icon map ────────────────────────────────────────────────

function TypeIcon({ type, className }: { type: AchievementType; className?: string }) {
  const cfg = ACHIEVEMENT_TYPE_CONFIG[type]
  const props = { className: cn("size-4", className), style: { color: cfg.color } }
  switch (cfg.icon) {
    case "zap":      return <Zap {...props} />
    case "trophy":   return <Trophy {...props} />
    case "star":     return <Star {...props} />
    case "sparkles": return <Sparkles {...props} />
    default:         return <Award {...props} />
  }
}

// ─── Stats header ─────────────────────────────────────────────────

function StatsBar() {
  const { data: stats } = useAchievementStats()
  if (!stats) return null

  const items = [
    { label: "Всего побед",  value: stats.totalCount,        icon: <Trophy className="size-4 text-primary" /> },
    { label: "Микро-побед",  value: stats.microCount,        icon: <Zap className="size-4" style={{ color: "#22c55e" }} /> },
    { label: "Крупных целей", value: stats.macroCount,       icon: <Trophy className="size-4" style={{ color: "#3b82f6" }} /> },
    { label: "Прорывов",     value: stats.breakthroughCount, icon: <Star className="size-4" style={{ color: "#8b5cf6" }} /> },
    { label: "Моментов",     value: stats.momentCount,       icon: <Sparkles className="size-4" style={{ color: "#f59e0b" }} /> },
    { label: "Избранных",    value: stats.favoriteCount,     icon: <Heart className="size-4 text-rose-500" /> },
    { label: "Серия дней",   value: stats.currentStreakDays, icon: <Flame className="size-4 text-orange-500" /> },
  ]

  return (
    <div className="grid grid-cols-4 gap-3 sm:grid-cols-7">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col items-center gap-1 rounded-xl border bg-card p-3 text-center">
          {item.icon}
          <p className="text-xl font-bold">{item.value}</p>
          <p className="text-[10px] text-muted-foreground leading-tight">{item.label}</p>
        </div>
      ))}
    </div>
  )
}

// ─── Achievement card ─────────────────────────────────────────────

function AchievementCard({ achievement }: { achievement: any }) {
  const cfg = ACHIEVEMENT_TYPE_CONFIG[achievement.type as AchievementType]
  const catCfg = achievement.category
    ? ACHIEVEMENT_CATEGORY_CONFIG[achievement.category as AchievementCategory]
    : null
  const emotionCfg = achievement.emotionTag
    ? EMOTION_TAG_CONFIG[achievement.emotionTag as EmotionTag]
    : null

  const isLocked = achievement.isTimeCapsule &&
    achievement.unlockDate &&
    new Date(achievement.unlockDate) > new Date()

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-200 hover:shadow-md",
        isLocked && "opacity-60"
      )}
      style={{ borderLeftColor: cfg.color, borderLeftWidth: 3 }}
    >
      <CardContent className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div
              className="flex size-7 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: `${cfg.color}20` }}
            >
              {isLocked
                ? <Lock className="size-3.5 text-muted-foreground" />
                : <TypeIcon type={achievement.type} />
              }
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm leading-tight truncate">{achievement.title}</p>
              <p className="text-[10px] text-muted-foreground">{cfg.labelRu}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {achievement.isFavorite && <Heart className="size-3 text-rose-500 fill-rose-500" />}
            {emotionCfg && <span className="text-sm">{emotionCfg.emoji}</span>}
          </div>
        </div>

        {/* Description */}
        {achievement.description && (
          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{achievement.description}</p>
        )}

        {/* Lesson */}
        {achievement.lessonLearned && (
          <div className="rounded-md bg-muted/50 px-2.5 py-1.5 mb-2">
            <p className="text-[11px] italic text-muted-foreground line-clamp-2">
              "{achievement.lessonLearned}"
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-muted-foreground">
            {new Date(achievement.achievementDate).toLocaleDateString("ru-RU", {
              day: "numeric", month: "short", year: "numeric"
            })}
          </p>
          <div className="flex items-center gap-1.5">
            {catCfg && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                {catCfg.labelRu}
              </Badge>
            )}
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-mono">
              +{achievement.xpAwarded} XP
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Add achievement dialog ───────────────────────────────────────

function AddAchievementDialog() {
  const createAchievement = useCreateAchievement()
  const [open, setOpen] = React.useState(false)
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [type, setType] = React.useState<AchievementType>("micro")
  const [category, setCategory] = React.useState<AchievementCategory | "">("")
  const [emotion, setEmotion] = React.useState<EmotionTag | "">("")
  const [lesson, setLesson] = React.useState("")
  const [date, setDate] = React.useState(new Date().toISOString().slice(0, 10))
  const [loading, setLoading] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    try {
      await createAchievement({
        title: title.trim(),
        description: description.trim() || undefined,
        type,
        category: (category as AchievementCategory) || undefined,
        emotionTag: (emotion as EmotionTag) || undefined,
        lessonLearned: lesson.trim() || undefined,
        achievementDate: date,
      })
      setOpen(false)
      setTitle(""); setDescription(""); setType("micro")
      setCategory(""); setEmotion(""); setLesson("")
      setDate(new Date().toISOString().slice(0, 10))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 size-4" />
          Записать победу
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Новая победа</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type selector */}
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(ACHIEVEMENT_TYPE_CONFIG) as AchievementType[]).map((t) => {
              const cfg = ACHIEVEMENT_TYPE_CONFIG[t]
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border p-2.5 text-left text-sm transition-all",
                    type === t
                      ? "border-transparent text-white"
                      : "hover:bg-muted"
                  )}
                  style={type === t ? { backgroundColor: cfg.color } : {}}
                >
                  <TypeIcon type={t} className={type === t ? "!text-white" : ""} />
                  <span className="font-medium">{cfg.labelRu}</span>
                </button>
              )
            })}
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title">Что произошло? *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Название победы"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description">Подробнее</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Расскажи чуть больше..."
              rows={2}
            />
          </div>

          {/* Category + Date row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Категория</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as AchievementCategory)}>
                <SelectTrigger>
                  <SelectValue placeholder="Выбери..." />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(ACHIEVEMENT_CATEGORY_CONFIG) as AchievementCategory[]).map((c) => (
                    <SelectItem key={c} value={c}>
                      {ACHIEVEMENT_CATEGORY_CONFIG[c].labelRu}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="date">Дата</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          {/* Emotion */}
          <div className="space-y-1.5">
            <Label>Эмоция</Label>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(EMOTION_TAG_CONFIG) as EmotionTag[]).map((e) => {
                const cfg = EMOTION_TAG_CONFIG[e]
                return (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setEmotion(emotion === e ? "" : e)}
                    className={cn(
                      "flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-all",
                      emotion === e ? "border-primary bg-primary/10 text-primary" : "hover:bg-muted"
                    )}
                  >
                    <span>{cfg.emoji}</span>
                    <span>{cfg.labelRu}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Lesson learned */}
          <div className="space-y-1.5">
            <Label htmlFor="lesson">Урок / инсайт</Label>
            <Input
              id="lesson"
              value={lesson}
              onChange={(e) => setLesson(e.target.value)}
              placeholder="Что понял(а) благодаря этому?"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading || !title.trim()}>
            {loading ? "Сохраняю..." : "Записать победу"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Page ─────────────────────────────────────────────────────────

export default function AchievementsPage() {
  const [activeTab, setActiveTab] = React.useState<string>("all")

  const typeFilter = activeTab === "all"
    ? undefined
    : { types: [activeTab as AchievementType] }

  const { data: achievements, isLoading } = useAchievements(
    typeFilter,
    { field: "date", direction: "desc" }
  )

  const tabs = [
    { value: "all",          label: "Все" },
    { value: "micro",        label: "Микро-победы" },
    { value: "macro",        label: "Крупные цели" },
    { value: "breakthrough", label: "Прорывы" },
    { value: "moment",       label: "Моменты" },
  ]

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Trophy className="size-6 text-primary" />
              Мои победы
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Журнал личных достижений и значимых моментов
            </p>
          </div>
          <AddAchievementDialog />
        </div>

        {/* Stats */}
        <div className="mb-6">
          <StatsBar />
        </div>

        {/* Tabs + grid */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="text-xs sm:text-sm">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              {isLoading ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
                  ))}
                </div>
              ) : achievements && achievements.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {achievements.map((a) => (
                    <AchievementCard key={a.id} achievement={a} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="flex size-16 items-center justify-center rounded-full bg-muted mb-4">
                    <Trophy className="size-7 text-muted-foreground" />
                  </div>
                  <p className="font-medium">Нет побед в этой категории</p>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">
                    Запиши свою первую победу — любую, даже самую маленькую
                  </p>
                  <AddAchievementDialog />
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </AppShell>
  )
}
