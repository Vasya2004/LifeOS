"use client"

import { AppShell } from "@/components/app-shell"
import { useTasks, useHabits, useGoals, useStats } from "@/hooks/use-data"
import type { Task, Goal, Habit } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FadeIn } from "@/components/animations"
import {
  TrendingUp,
  Target,
  CheckCircle2,
  Flame,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Trophy,
  ArrowUpRight,
  ArrowDownRight,
  Plus
} from "lucide-react"
import { AddAchievementDialog } from "@/components/achievements/add-achievement-dialog"
import { useCreateAchievement } from "@/hooks"
import { toast } from "sonner"
import { ActivityChart } from "@/components/analytics/activity-chart"
import { EnergyChart } from "@/components/analytics/energy-chart"
import { AiInsightsCard } from "@/components/ai-insights-card"
import { generateInsights } from "@/lib/api/ai-mentor"

export default function AnalyticsPage() {
  const { data: tasks } = useTasks()
  const { data: habits } = useHabits()
  const { data: goals } = useGoals()
  const { data: stats } = useStats()

  // Calculate stats
  const totalTasks = tasks?.length || 0
  const completedTasks = tasks?.filter((t: Task) => t.status === "completed").length || 0
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const activeGoals = goals?.filter((g: Goal) => g.status === "active").length || 0
  const completedGoals = goals?.filter((g: Goal) => g.status === "completed").length || 0

  const totalHabits = habits?.length || 0
  const totalHabitCompletions = habits?.reduce((sum: number, h: Habit) => sum + h.totalCompletions, 0) || 0
  const bestStreak = habits?.reduce((max: number, h: Habit) => Math.max(max, h.bestStreak), 0) || 0

  // Energy type distribution
  const energyTypes = {
    physical: tasks?.filter((t: Task) => t.energyType === "physical" && t.status === "completed").length || 0,
    mental: tasks?.filter((t: Task) => t.energyType === "mental" && t.status === "completed").length || 0,
    emotional: tasks?.filter((t: Task) => t.energyType === "emotional" && t.status === "completed").length || 0,
    creative: tasks?.filter((t: Task) => t.energyType === "creative" && t.status === "completed").length || 0,
  }

  const totalEnergyTasks = Object.values(energyTypes).reduce((a, b) => a + b, 0)

  // Priority distribution
  const priorityStats = {
    critical: tasks?.filter((t: Task) => t.priority === "critical").length || 0,
    high: tasks?.filter((t: Task) => t.priority === "high").length || 0,
    medium: tasks?.filter((t: Task) => t.priority === "medium").length || 0,
    low: tasks?.filter((t: Task) => t.priority === "low").length || 0,
  }

  // Last 7 days activity
  const last7Days = Array.from({ length: 7 }, (_: unknown, i: number) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return date.toISOString().split("T")[0]
  })

  const dailyCompletions = last7Days.map((date: string) => ({
    date: new Date(date).toLocaleDateString('ru-RU', { weekday: 'short' }),
    tasks: tasks?.filter((t: Task) => t.completedAt?.startsWith(date)).length || 0,
    habits: habits?.filter((h: Habit) => h.entries.find(e => e.date === date && e.completed)).length || 0,
  }))

  const energyChartData = [
    { name: 'Физическая', value: energyTypes.physical, color: '#22c55e' },
    { name: 'Ментальная', value: energyTypes.mental, color: '#3b82f6' },
    { name: 'Эмоциональная', value: energyTypes.emotional, color: '#ec4899' },
    { name: 'Творческая', value: energyTypes.creative, color: '#8b5cf6' },
  ].filter(item => item.value > 0)

  const createAchievement = useCreateAchievement()

  const insights = generateInsights(tasks, habits, goals)

  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
        {/* Header */}
        <FadeIn>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Аналитика</h1>
              <p className="text-sm text-muted-foreground">
                Отслеживайте свой прогресс и продуктивность
              </p>
            </div>
            <AddAchievementDialog
              onSubmit={async (data) => {
                await createAchievement(data)
              }}
            />
          </div>
        </FadeIn>

        {/* AI Insights */}
        {insights.length > 0 && (
          <FadeIn delay={0.05}>
            <AiInsightsCard insights={insights} />
          </FadeIn>
        )}

        {/* Key Metrics */}
        <FadeIn delay={0.1}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              title="Выполнено задач"
              value={completedTasks}
              subtitle={`${taskCompletionRate}% эффективность`}
              icon={CheckCircle2}
              trend={taskCompletionRate > 50 ? "up" : "down"}
            />
            <MetricCard
              title="Дней подряд"
              value={stats?.currentStreak || 0}
              subtitle={`Лучшее: ${stats?.longestStreak || 0}`}
              icon={Flame}
              color="text-chart-5"
            />
            <MetricCard
              title="Целей достигнуто"
              value={completedGoals}
              subtitle={`${activeGoals} в процессе`}
              icon={Target}
              color="text-primary"
            />
            <MetricCard
              title="Всего XP"
              value={stats?.xp || 0}
              subtitle={`Уровень ${stats?.level || 1}`}
              icon={Trophy}
              color="text-warning"
            />
          </div>
        </FadeIn>

        {/* Tabs */}
        <FadeIn delay={0.2}>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="overview">Обзор</TabsTrigger>
              <TabsTrigger value="energy">Энергия</TabsTrigger>
              <TabsTrigger value="activity">Активность</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-6">
              {/* Progress Section */}
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="size-5 text-primary" />
                      Прогресс целей
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {goals && goals.length > 0 ? (
                      <div className="space-y-4">
                        {goals.slice(0, 5).map((goal: Goal) => (
                          <div key={goal.id}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="truncate">{goal.title}</span>
                              <span className="text-muted-foreground">{goal.progress}%</span>
                            </div>
                            <Progress value={goal.progress} className="h-2" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-4">
                        Нет активных целей
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart3 className="size-5 text-chart-4" />
                      Приоритеты задач
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(priorityStats).map(([priority, count]: [string, number]) => (
                        <div key={priority} className="flex items-center gap-3">
                          <Badge className={getPriorityColor(priority)}>
                            {getPriorityLabel(priority)}
                          </Badge>
                          <div className="flex-1">
                            <Progress
                              value={totalTasks > 0 ? (count / totalTasks) * 100 : 0}
                              className="h-2"
                            />
                          </div>
                          <span className="text-sm font-medium w-8 text-right">{count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Habits Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Flame className="size-5 text-chart-5" />
                    Статистика привычек
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold">{totalHabits}</p>
                      <p className="text-sm text-muted-foreground">Активных привычек</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold">{totalHabitCompletions}</p>
                      <p className="text-sm text-muted-foreground">Всего выполнено</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-chart-5">{bestStreak}</p>
                      <p className="text-sm text-muted-foreground">Лучшая серия</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="energy" className="space-y-4 mt-6">
              <div className="grid lg:grid-cols-3 gap-4">
                <EnergyChart data={energyChartData} />
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg">Энергетический баланс</CardTitle>
                    <CardDescription>Относительное количество задач по типам</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {Object.entries(energyTypes).map(([type, count]: [string, number]) => (
                      <div key={type} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{getEnergyLabel(type)}</span>
                          <span className="text-muted-foreground">
                            {count} {count === 1 ? 'задача' : count > 1 && count < 5 ? 'задачи' : 'задач'} ({totalEnergyTasks > 0 ? Math.round((count / totalEnergyTasks) * 100) : 0}%)
                          </span>
                        </div>
                        <Progress
                          value={totalEnergyTasks > 0 ? (count / totalEnergyTasks) * 100 : 0}
                          className="h-2.5"
                          style={{
                            backgroundColor: `${getEnergyColor(type)}15`,
                            color: getEnergyColor(type)
                          }}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="space-y-4 mt-6">
              <ActivityChart data={dailyCompletions} />
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Детали активности</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {dailyCompletions.map((day: { date: string, tasks: number, habits: number }, idx: number) => {
                      const dateStr = day.date // This is already localized in our map

                      return (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-lg border">
                          <span className="font-medium">{dateStr}</span>
                          <div className="flex gap-4">
                            <span className="text-sm text-muted-foreground">
                              <CheckCircle2 className="inline mr-1 size-4" />
                              {day.tasks}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              <Flame className="inline mr-1 size-4" />
                              {day.habits}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </FadeIn>
      </div>
    </AppShell>
  )
}

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "text-primary",
  trend
}: {
  title: string
  value: number
  subtitle: string
  icon: React.ElementType
  color?: string
  trend?: "up" | "down"
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              {trend === "up" && <ArrowUpRight className="size-3 text-success" />}
              {trend === "down" && <ArrowDownRight className="size-3 text-destructive" />}
              {subtitle}
            </p>
          </div>
          <Icon className={`size-5 ${color}`} />
        </div>
      </CardContent>
    </Card>
  )
}

function EnergyCard({
  label,
  count,
  total,
  color
}: {
  label: string
  count: number
  total: number
  color: string
}) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0

  return (
    <div className="text-center p-4 rounded-lg border">
      <div
        className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center"
        style={{ backgroundColor: `${color}20` }}
      >
        <span className="text-xl font-bold" style={{ color }}>
          {count}
        </span>
      </div>
      <p className="font-medium text-sm">{label}</p>
      <p className="text-xs text-muted-foreground">{percentage}%</p>
    </div>
  )
}

function getPriorityColor(priority: string): string {
  switch (priority) {
    case "critical": return "bg-destructive text-destructive-foreground"
    case "high": return "bg-warning text-warning-foreground"
    case "medium": return "bg-secondary text-secondary-foreground"
    default: return "bg-muted text-muted-foreground"
  }
}

function getPriorityLabel(priority: string): string {
  switch (priority) {
    case "critical": return "Критично"
    case "high": return "Высокий"
    case "medium": return "Средний"
    default: return "Низкий"
  }
}

function getEnergyLabel(type: string): string {
  switch (type) {
    case "physical": return "Физическая"
    case "mental": return "Ментальная"
    case "emotional": return "Эмоциональная"
    case "creative": return "Творческая"
    default: return type
  }
}

function getEnergyColor(type: string): string {
  switch (type) {
    case "physical": return "#22c55e"
    case "mental": return "#3b82f6"
    case "emotional": return "#ec4899"
    case "creative": return "#8b5cf6"
    default: return "#6366f1"
  }
}
