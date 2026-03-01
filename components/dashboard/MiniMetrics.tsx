"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FadeIn } from "@/components/animations"
import { useFinancialStats } from "@/hooks/modules/use-finance"
import { useBodyZonesStats } from "@/hooks/modules/use-health"
import { useTopSkills } from "@/hooks/modules/use-skills"
import { useGoals } from "@/hooks/modules/use-goals"
import { useTasks, useCompleteTask } from "@/hooks/modules/use-tasks"
import { useHabits } from "@/hooks/modules/use-habits"
import {
  BarChart3, Heart, TrendingUp, Brain, Target, ArrowRight,
  CheckCircle2, Circle, Repeat, ChevronDown, ExternalLink,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { mutate } from "swr"
import type { Task, Habit, Goal } from "@/lib/types"

// ─── Types ─────────────────────────────────────────────────────────────────────

type ModuleKey = "finance" | "health" | "skills" | "goals"
type StatusLevel = "good" | "warning" | "critical" | "neutral"

// ─── Module config ──────────────────────────────────────────────────────────────

const MODULE_CONFIG = {
  finance: {
    label: "Финансы",
    icon: TrendingUp,
    href: "/finance",
    colorClass: "text-emerald-400",
    bgClass: "bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/18",
    ringClass: "ring-emerald-500/40",
  },
  health: {
    label: "Здоровье",
    icon: Heart,
    href: "/health",
    colorClass: "text-rose-400",
    bgClass: "bg-rose-500/10 border-rose-500/20 hover:bg-rose-500/18",
    ringClass: "ring-rose-500/40",
  },
  skills: {
    label: "Навыки",
    icon: Brain,
    href: "/skills",
    colorClass: "text-violet-400",
    bgClass: "bg-violet-500/10 border-violet-500/20 hover:bg-violet-500/18",
    ringClass: "ring-violet-500/40",
  },
  goals: {
    label: "Цели",
    icon: Target,
    href: "/goals",
    colorClass: "text-sky-400",
    bgClass: "bg-[#8b5cf6]/10 border-[#8b5cf6]/20 hover:bg-[#8b5cf6]/18",
    ringClass: "ring-[#8b5cf6]/40",
  },
} satisfies Record<ModuleKey, {
  label: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  colorClass: string
  bgClass: string
  ringClass: string
}>

const STATUS_DOT: Record<StatusLevel, string> = {
  good:     "bg-emerald-500",
  warning:  "bg-amber-500",
  critical: "bg-red-500",
  neutral:  "bg-slate-500",
}

// Progress bar color reflects actual status, not just module theme
// This prevents "red bar at 100%" confusion (e.g. health fully rose = looks like error)
const STATUS_BAR_COLOR: Record<StatusLevel, string> = {
  good:     "#10b981", // emerald — positive
  warning:  "#f59e0b", // amber   — caution
  critical: "#ef4444", // red     — danger
  neutral:  "#64748b", // slate   — no data
}

// ─── Relevance filtering ────────────────────────────────────────────────────────

function getModuleTasks(tasks: Task[], module: ModuleKey, today: string): Task[] {
  const active = tasks.filter(t => t.status !== "completed" && t.status !== "cancelled")
  const overdue = active.filter(t => t.scheduledDate < today).slice(0, 2)
  const todayTasks = active.filter(t => t.scheduledDate === today)
  const pool = [...overdue, ...todayTasks]

  switch (module) {
    case "health":
      return pool.filter(t => t.energyType === "physical").slice(0, 4)
    case "finance": {
      const kw = /финанс|деньг|бюджет|зарплат|инвест|расход|доход|счёт|платёж|копи/i
      return pool.filter(t => kw.test(t.title)).slice(0, 4)
    }
    case "skills":
      return pool
        .filter(t => t.energyType === "mental" || t.energyType === "creative")
        .slice(0, 4)
    case "goals":
      return pool
        .filter(t => t.priority === "critical" || t.priority === "high")
        .slice(0, 4)
  }
}

function getModuleHabits(habits: Habit[], module: ModuleKey, todayDow: number): Habit[] {
  const todaysHabits = habits.filter(h => h.targetDays.includes(todayDow))

  switch (module) {
    case "health":
      return todaysHabits.filter(h => h.energyType === "physical").slice(0, 3)
    case "finance": {
      const kw = /финанс|деньг|бюджет|расход|копит|трат|запис/i
      return todaysHabits.filter(h => kw.test(h.title)).slice(0, 3)
    }
    case "skills":
      return todaysHabits
        .filter(h => h.energyType === "mental" || h.energyType === "creative")
        .slice(0, 3)
    case "goals":
      return todaysHabits.slice(0, 3)
  }
}

// ─── Module detail panel ────────────────────────────────────────────────────────

function ModuleDetailPanel({
  moduleKey,
  tasks,
  habits,
  goals,
}: {
  moduleKey: ModuleKey
  tasks: Task[]
  habits: Habit[]
  goals: Goal[]
}) {
  const completeTask = useCompleteTask()
  const [completing, setCompleting] = useState<string | null>(null)
  const today = new Date().toISOString().split("T")[0]
  const todayDow = new Date().getDay()
  const cfg = MODULE_CONFIG[moduleKey]

  const relatedTasks   = getModuleTasks(tasks, moduleKey, today)
  const relatedHabits  = getModuleHabits(habits, moduleKey, todayDow)
  const activeGoals    = goals.filter(g => g.status === "active")

  const handleComplete = async (id: string) => {
    setCompleting(id)
    await completeTask(id)
    await mutate("tasks")
    setCompleting(null)
  }

  const hasContent = relatedTasks.length > 0 || relatedHabits.length > 0 || (moduleKey === "goals" && activeGoals.length > 0)

  return (
    <motion.div
      key={`panel-${moduleKey}`}
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      style={{ overflow: "hidden" }}
    >
      <div className="mt-3 pt-3 border-t border-border space-y-4">

        {/* Goals list (only for goals module) */}
        {moduleKey === "goals" && activeGoals.length > 0 && (
          <section>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Активные цели
            </p>
            <div className="space-y-2">
              {activeGoals.slice(0, 3).map(goal => (
                <div key={goal.id} className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium leading-tight truncate">{goal.title}</span>
                    <span className="text-xs text-muted-foreground font-mono shrink-0">{goal.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all bg-[#8b5cf6]"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Related tasks */}
        {relatedTasks.length > 0 && (
          <section>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Задачи
            </p>
            <div className="space-y-0.5">
              {relatedTasks.map(task => {
                const isDone = task.status === "completed"
                const isOverdue = task.scheduledDate < today
                return (
                  <div key={task.id} className="flex items-center gap-2 rounded-md px-1 py-1.5 hover:bg-muted/40 transition-colors">
                    <button
                      onClick={() => handleComplete(task.id)}
                      disabled={isDone || completing === task.id}
                      className="shrink-0 rounded-full p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6]"
                      aria-label={isDone ? "Выполнено" : "Отметить как выполненное"}
                    >
                      {isDone ? (
                        <CheckCircle2 className="size-4 text-emerald-500 fill-emerald-500/20" />
                      ) : (
                        <Circle className={cn(
                          "size-4 text-muted-foreground hover:text-indigo-400 transition-colors",
                          completing === task.id && "animate-spin text-[#8b5cf6]"
                        )} />
                      )}
                    </button>
                    <span className={cn(
                      "flex-1 text-xs leading-snug truncate",
                      isDone && "line-through text-muted-foreground"
                    )}>
                      {task.title}
                    </span>
                    {isOverdue && !isDone && (
                      <span className="shrink-0 text-[9px] font-semibold text-red-400 bg-red-400/10 px-1 rounded">
                        просроч.
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Related habits */}
        {relatedHabits.length > 0 && (
          <section>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Привычки сегодня
            </p>
            <div className="space-y-0.5">
              {relatedHabits.map(habit => {
                const todayEntry = habit.entries?.find(e => e.date === today)
                const done = todayEntry?.completed === true
                return (
                  <div key={habit.id} className="flex items-center gap-2 rounded-md px-1 py-1.5">
                    {done ? (
                      <CheckCircle2 className="size-4 shrink-0 text-emerald-500 fill-emerald-500/20" />
                    ) : (
                      <Repeat className="size-4 shrink-0 text-muted-foreground" />
                    )}
                    <span className={cn(
                      "flex-1 text-xs truncate",
                      done && "line-through text-muted-foreground"
                    )}>
                      {habit.title}
                    </span>
                    {habit.streak > 0 && (
                      <span className="shrink-0 text-[9px] text-orange-400 font-medium">
                        {habit.streak}🔥
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Empty state */}
        {!hasContent && (
          <p className="text-xs text-muted-foreground text-center py-1">
            Нет связанных задач и привычек
          </p>
        )}

        {/* Navigate to module */}
        <Link href={cfg.href} className="block pt-1">
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-1.5 text-xs"
          >
            Открыть {cfg.label.toLowerCase()}
            <ArrowRight className="size-3" />
          </Button>
        </Link>
      </div>
    </motion.div>
  )
}

// ─── Module card ────────────────────────────────────────────────────────────────

function ModuleCard({
  moduleKey,
  value,
  subtext,
  status,
  progress,
  isSelected,
  onToggle,
}: {
  moduleKey: ModuleKey
  value: string
  subtext?: string
  status: StatusLevel
  progress?: number  // 0–100 for mini progress bar
  isSelected: boolean
  onToggle: () => void
}) {
  const cfg = MODULE_CONFIG[moduleKey]
  const Icon = cfg.icon

  return (
    <div className={cn(
      "rounded-xl border transition-all",
      cfg.bgClass,
      isSelected && `ring-2 ${cfg.ringClass}`
    )}>
      {/* Card button — toggles panel */}
      <button
        onClick={onToggle}
        className={cn(
          "w-full p-3 text-left rounded-xl",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
        )}
        aria-expanded={isSelected}
        aria-label={`${cfg.label}: ${value}. ${isSelected ? "Свернуть" : "Развернуть"}`}
      >
        <div className="flex items-start justify-between gap-1">
          {/* Module icon */}
          <div className={cn("p-1.5 rounded-lg bg-black/10 dark:bg-white/5")}>
            <Icon className={cn("size-4", cfg.colorClass)} aria-hidden />
          </div>

          {/* Status + controls */}
          <div className="flex items-center gap-1.5">
            {/* Status dot */}
            <div
              className={cn("size-2 rounded-full", STATUS_DOT[status])}
              aria-hidden
            />
            {/* External link — navigates without expanding panel */}
            <Link
              href={cfg.href}
              onClick={e => e.stopPropagation()}
              className="rounded p-0.5 text-muted-foreground/50 hover:text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              aria-label={`Открыть ${cfg.label}`}
              tabIndex={0}
            >
              <ExternalLink className="size-3" aria-hidden />
            </Link>
            {/* Expand chevron */}
            <ChevronDown
              className={cn(
                "size-3 text-muted-foreground/50 transition-transform duration-200",
                isSelected && "rotate-180"
              )}
              aria-hidden
            />
          </div>
        </div>

        <div className="mt-2">
          <span className={cn("text-lg font-bold leading-none font-mono", cfg.colorClass)}>{value}</span>
          <p className="text-xs font-medium text-foreground/70 mt-0.5">{cfg.label}</p>
          {subtext && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{subtext}</p>
          )}
        </div>

        {/* Mini progress bar — color based on status, not module theme */}
        {progress !== undefined && (
          <div className="mt-2.5 h-1 w-full rounded-full bg-black/10 dark:bg-white/8 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, progress)}%`, backgroundColor: STATUS_BAR_COLOR[status] }}
            />
          </div>
        )}
      </button>
    </div>
  )
}

// ─── Main component ─────────────────────────────────────────────────────────────

export function MiniMetrics() {
  const [selected, setSelected] = useState<ModuleKey | null>(null)

  const { data: finStats }    = useFinancialStats()
  const { data: healthStats } = useBodyZonesStats()
  const { data: topSkills }   = useTopSkills(1)
  const { data: goals }       = useGoals()
  const { data: tasks }       = useTasks()
  const { data: habits }      = useHabits()

  const activeGoals = (goals ?? []).filter((g: Goal) => g.status === "active")
  const avgGoalProgress = activeGoals.length > 0
    ? Math.round(activeGoals.reduce((s: number, g: Goal) => s + (g.progress ?? 0), 0) / activeGoals.length)
    : 0

  const savingsRate  = finStats?.savingsRate ?? 0
  const netWorth     = finStats?.netWorth ?? 0
  const healthScore  = healthStats?.healthScore ?? 80
  const topSkill     = topSkills?.[0]

  // Status levels
  const financeStatus: StatusLevel   = savingsRate > 0.1 ? "good" : savingsRate < 0 ? "critical" : "warning"
  const healthStatus: StatusLevel    = healthScore >= 80 ? "good" : healthScore >= 50 ? "warning" : "critical"
  const skillsStatus: StatusLevel    = topSkill ? (topSkill.currentLevel >= 3 ? "good" : "warning") : "neutral"
  const goalsStatus: StatusLevel     = avgGoalProgress >= 50 ? "good" : avgGoalProgress >= 20 ? "warning" : (activeGoals.length === 0 ? "neutral" : "critical")

  const handleToggle = (key: ModuleKey) =>
    setSelected(prev => prev === key ? null : key)

  return (
    <FadeIn delay={0.2} className="h-full">
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-heading flex items-center gap-2">
            <BarChart3 className="size-4 text-primary" />
            Статус модулей
          </CardTitle>
        </CardHeader>

        <CardContent>
          {/* 2×2 module grid */}
          <div className="grid grid-cols-2 gap-2">
            <ModuleCard
              moduleKey="finance"
              value={finStats ? `${Math.round(savingsRate * 100)}%` : "0%"}
              subtext={netWorth !== 0
                ? `Капитал: ${netWorth.toLocaleString("ru", { notation: "compact", maximumFractionDigits: 1 })}`
                : "Нет данных"}
              status={financeStatus}
              progress={Math.min(100, Math.max(0, Math.round(savingsRate * 100) + 50))}
              isSelected={selected === "finance"}
              onToggle={() => handleToggle("finance")}
            />

            <ModuleCard
              moduleKey="health"
              value={`${healthScore}%`}
              subtext={healthStats
                ? healthStats.red > 0
                  ? `${healthStats.red} зон требует внимания`
                  : "Всё в норме"
                : "Нет данных"}
              status={healthStatus}
              progress={healthScore}
              isSelected={selected === "health"}
              onToggle={() => handleToggle("health")}
            />

            <ModuleCard
              moduleKey="skills"
              value={topSkill ? `Ур. ${topSkill.currentLevel}` : "—"}
              subtext={topSkill?.name ?? "Добавьте навык"}
              status={skillsStatus}
              progress={topSkill ? Math.round((topSkill.currentLevel / 10) * 100) : 0}
              isSelected={selected === "skills"}
              onToggle={() => handleToggle("skills")}
            />

            <ModuleCard
              moduleKey="goals"
              value={activeGoals.length > 0 ? `${avgGoalProgress}%` : "0%"}
              subtext={activeGoals.length > 0
                ? `${activeGoals.length} ${activeGoals.length === 1 ? "активная" : "активных"}`
                : "Поставьте цель"}
              status={goalsStatus}
              progress={avgGoalProgress}
              isSelected={selected === "goals"}
              onToggle={() => handleToggle("goals")}
            />
          </div>

          {/* Expandable detail panel */}
          <AnimatePresence>
            {selected && (
              <ModuleDetailPanel
                moduleKey={selected}
                tasks={tasks ?? []}
                habits={habits ?? []}
                goals={goals ?? []}
              />
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </FadeIn>
  )
}
