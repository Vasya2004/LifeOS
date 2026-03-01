"use client"

import { useGoals, useTasks, useHabits, useStats } from "@/hooks/use-data"
import { saveDailyReview, getDailyReview, addXp } from "@/lib/store"
import type { DailyReview, Task, Habit } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FadeIn } from "@/components/animations"
import {
  BookOpen,
  Save,
  CheckCircle2,
  Target,
  Zap,
  Smile,
  Frown,
  Meh,
  TrendingUp,
  Calendar,
  Trophy,
  Sparkles
} from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"


const MOODS = [
  { value: "terrible", label: "Ужасно", icon: Frown, color: "text-destructive" },
  { value: "bad", label: "Плохо", icon: Frown, color: "text-orange-500" },
  { value: "neutral", label: "Нормально", icon: Meh, color: "text-yellow-500" },
  { value: "good", label: "Хорошо", icon: Smile, color: "text-chart-4" },
  { value: "excellent", label: "Отлично", icon: Smile, color: "text-success" },
]

export default function ReviewPage() {
  const { data: goals } = useGoals()
  const { data: tasks } = useTasks()
  const { data: habits } = useHabits()
  const { data: stats, mutate: mutateStats } = useStats()

  const today = new Date().toISOString().split("T")[0]
  const [activeTab, setActiveTab] = useState("daily")

  // Review form state
  const [dayRating, setDayRating] = useState(3)
  const [energyLevel, setEnergyLevel] = useState(3)
  const [focusLevel, setFocusLevel] = useState(3)
  const [mood, setMood] = useState<"terrible" | "bad" | "neutral" | "good" | "excellent">("good")
  const [wins, setWins] = useState<string[]>(["", ""])
  const [struggles, setStruggles] = useState<string[]>([""])
  const [lessons, setLessons] = useState("")
  const [gratitude, setGratitude] = useState<string[]>(["", "", ""])
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Load existing review
  useEffect(() => {
    const existing = getDailyReview(today)
    if (existing) {
      setDayRating(existing.dayRating)
      setEnergyLevel(existing.energyLevel)
      setFocusLevel(existing.focusLevel)
      setMood(existing.mood)
      setWins(existing.wins.length > 0 ? existing.wins : ["", ""])
      setStruggles(existing.struggles.length > 0 ? existing.struggles : [""])
      setLessons(existing.lessons)
      setGratitude(existing.gratitude.length > 0 ? existing.gratitude : ["", "", ""])
      setIsSubmitted(true)
    }
  }, [today])

  const todayTasks = tasks?.filter((t: Task) => t.scheduledDate === today) || []
  const completedTasks = todayTasks.filter((t: Task) => t.status === "completed")
  const completedHabits = habits?.filter((h: Habit) => {
    const entry = h.entries.find((e: {date: string, completed: boolean}) => e.date === today)
    return entry?.completed
  }) || []

  const handleSave = () => {
    const review: DailyReview = {
      date: today,
      dayRating: dayRating as 1 | 2 | 3 | 4 | 5,
      energyLevel: energyLevel as 1 | 2 | 3 | 4 | 5,
      focusLevel: focusLevel as 1 | 2 | 3 | 4 | 5,
      mood,
      wins: wins.filter(w => w.trim()),
      struggles: struggles.filter(s => s.trim()),
      lessons: lessons.trim(),
      gratitude: gratitude.filter(g => g.trim()),
      goalProgress: []
    }

    saveDailyReview(review)

    // XP for completing daily review
    if (!isSubmitted) {
      addXp(25, "daily_review_completed")
      toast.success("Обзор сохранен! +25 XP", {
        icon: <Trophy className="size-4 text-warning" />
      })
    } else {
      toast.success("Обзор обновлен!")
    }

    setIsSubmitted(true)
    mutateStats()
  }

  const addWin = () => setWins([...wins, ""])
  const addStruggle = () => setStruggles([...struggles, ""])
  const addGratitude = () => setGratitude([...gratitude, ""])

  const updateWin = (index: number, value: string) => {
    const newWins = [...wins]
    newWins[index] = value
    setWins(newWins)
  }

  const updateStruggle = (index: number, value: string) => {
    const newStruggles = [...struggles]
    newStruggles[index] = value
    setStruggles(newStruggles)
  }

  const updateGratitude = (index: number, value: string) => {
    const newGratitude = [...gratitude]
    newGratitude[index] = value
    setGratitude(newGratitude)
  }

  const productivity = todayTasks.length > 0
    ? Math.round((completedTasks.length / todayTasks.length) * 100)
    : 0

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8 max-w-4xl">
      {/* Header */}
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Обзор дня</h1>
            <p className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          {isSubmitted && (
            <Badge variant="outline" className="text-success">
              <CheckCircle2 className="mr-1 size-3" />
              Сохранено
            </Badge>
          )}
        </div>
      </FadeIn>

      {/* Daily Stats */}
      <FadeIn delay={0.1}>
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-success" />
                <div>
                  <p className="text-2xl font-bold">{completedTasks.length}/{todayTasks.length}</p>
                  <p className="text-xs text-muted-foreground">Задач выполнено</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="size-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{productivity}%</p>
                  <p className="text-xs text-muted-foreground">Продуктивность</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Zap className="size-5 text-chart-5" />
                <div>
                  <p className="text-2xl font-bold">{completedHabits.length}</p>
                  <p className="text-xs text-muted-foreground">Привычек выполнено</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="size-5 text-chart-4" />
                <div>
                  <p className="text-2xl font-bold">{stats?.currentStreak || 0}</p>
                  <p className="text-xs text-muted-foreground">Дней подряд</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </FadeIn>

      {/* Review Form */}
      <FadeIn delay={0.2}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="daily">
              <Calendar className="mr-2 size-4" />
              Ежедневный обзор
            </TabsTrigger>
            <TabsTrigger value="gratitude">
              <Sparkles className="mr-2 size-4" />
              Благодарность
            </TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="space-y-4 mt-4">
            {/* Ratings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Оценка дня</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Day Rating */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label>Общая оценка дня</Label>
                    <span className="font-medium">{dayRating}/5</span>
                  </div>
                  <Slider
                    value={[dayRating]}
                    onValueChange={([v]) => setDayRating(v)}
                    min={1} max={5} step={1}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Плохо</span>
                    <span>Отлично</span>
                  </div>
                </div>

                {/* Energy Level */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label>Уровень энергии</Label>
                    <span className="font-medium">{energyLevel}/5</span>
                  </div>
                  <Slider
                    value={[energyLevel]}
                    onValueChange={([v]) => setEnergyLevel(v)}
                    min={1} max={5} step={1}
                  />
                </div>

                {/* Focus Level */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label>Уровень фокуса</Label>
                    <span className="font-medium">{focusLevel}/5</span>
                  </div>
                  <Slider
                    value={[focusLevel]}
                    onValueChange={([v]) => setFocusLevel(v)}
                    min={1} max={5} step={1}
                  />
                </div>

                {/* Mood */}
                <div className="space-y-3">
                  <Label>Настроение</Label>
                  <div className="flex gap-2">
                    {MOODS.map(m => (
                      <button
                        key={m.value}
                        onClick={() => setMood(m.value as "terrible" | "bad" | "neutral" | "good" | "excellent")}
                        className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                          mood === m.value
                            ? 'border-primary bg-primary/5'
                            : 'border-transparent hover:bg-muted'
                        }`}
                      >
                        <m.icon className={`size-6 mx-auto mb-1 ${m.color}`} />
                        <span className="text-xs">{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Wins */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="size-5 text-warning" />
                  Победы дня
                </CardTitle>
                <CardDescription>Что получилось сегодня?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {wins.map((win, idx) => (
                  <Input
                    key={idx}
                    value={win}
                    onChange={(e) => updateWin(idx, e.target.value)}
                    placeholder={`Победа ${idx + 1}`}
                  />
                ))}
                <Button variant="outline" onClick={addWin} className="w-full">
                  <Plus className="mr-2 size-4" />
                  Добавить победу
                </Button>
              </CardContent>
            </Card>

            {/* Struggles */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="size-5 text-chart-4" />
                  Сложности
                </CardTitle>
                <CardDescription>С чем было трудно справиться?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {struggles.map((struggle, idx) => (
                  <Input
                    key={idx}
                    value={struggle}
                    onChange={(e) => updateStruggle(idx, e.target.value)}
                    placeholder={`Сложность ${idx + 1}`}
                  />
                ))}
                <Button variant="outline" onClick={addStruggle} className="w-full">
                  <Plus className="mr-2 size-4" />
                  Добавить сложность
                </Button>
              </CardContent>
            </Card>

            {/* Lessons */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Урок дня</CardTitle>
                <CardDescription>Чему вы научились сегодня?</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={lessons}
                  onChange={(e) => setLessons(e.target.value)}
                  placeholder="Запишите главный урок или инсайт..."
                  rows={3}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gratitude" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="size-5 text-chart-4" />
                  Благодарность
                </CardTitle>
                <CardDescription>За что вы благодарны сегодня?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {gratitude.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-muted-foreground">{idx + 1}</span>
                    <Input
                      value={item}
                      onChange={(e) => updateGratitude(idx, e.target.value)}
                      placeholder={`Я благодарен за...`}
                    />
                  </div>
                ))}
                <Button variant="outline" onClick={addGratitude} className="w-full">
                  <Plus className="mr-2 size-4" />
                  Добавить пункт
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </FadeIn>

      {/* Save Button */}
      <FadeIn delay={0.3}>
        <Button onClick={handleSave} size="lg" className="w-full">
          <Save className="mr-2 size-4" />
          {isSubmitted ? "Обновить обзор" : "Сохранить обзор дня"}
        </Button>
      </FadeIn>
    </div>
  )
}

import { Plus } from "lucide-react"
