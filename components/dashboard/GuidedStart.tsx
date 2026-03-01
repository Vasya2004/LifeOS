"use client"

import { useState } from "react"
import Link from "next/link"
import { useTasks } from "@/hooks/modules/use-tasks"
import { useGoals } from "@/hooks/modules/use-goals"
import { useAreas } from "@/hooks/modules/use-areas"
import { cn } from "@/lib/utils"
import { Target, CheckSquare, Repeat, ArrowRight, X, Sparkles, Info } from "lucide-react"

// ─── Шаги "с чего начать" ────────────────────────────────────────────────────

const GUIDE_STEPS = [
  {
    icon: Target,
    color: "#8b5cf6",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    step: "1",
    title: "Поставь цель",
    desc: "Определи, чего хочешь достичь. Это даст направление всем задачам.",
    cta: "Создать цель",
    href: "/goals",
  },
  {
    icon: CheckSquare,
    color: "#6366f1",
    bg: "bg-[#8b5cf6]/10",
    border: "border-[#8b5cf6]/20",
    step: "2",
    title: "Добавь первую задачу",
    desc: "Разбей цель на конкретный шаг. Выполни его сегодня — получи XP.",
    cta: "Открыть задачи",
    href: "/tasks",
  },
  {
    icon: Repeat,
    color: "#10b981",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    step: "3",
    title: "Заведи привычку",
    desc: "Маленькие ежедневные действия строят долгосрочный результат.",
    cta: "К привычкам",
    href: "/habits",
  },
]

const DISMISSED_KEY = "lifeos_guided_start_dismissed"

// ─── Component ───────────────────────────────────────────────────────────────

export function GuidedStart() {
  const { data: tasks } = useTasks()
  const { data: goals } = useGoals()
  const { data: areas } = useAreas()
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return false
    return localStorage.getItem(DISMISSED_KEY) === "true"
  })

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "true")
    setDismissed(true)
  }

  // Show only when account is truly empty and not yet dismissed
  const isEmpty =
    Array.isArray(tasks) && tasks.length === 0 &&
    Array.isArray(goals) && goals.length === 0

  if (!isEmpty || dismissed) return null

  // How many steps are "done" (area selected counts as step 0 complete)
  const doneSteps = [
    Array.isArray(areas) && areas.length > 0,
    Array.isArray(tasks) && tasks.length > 0,
    false, // habits — check separately if needed
  ]

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
            <Sparkles className="size-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">С чего начать</h2>
            <p className="text-xs text-muted-foreground">Три шага для быстрого старта</p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          title="Скрыть"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 gap-px bg-border sm:grid-cols-3">
        {GUIDE_STEPS.map((step, i) => {
          const Icon = step.icon
          const done = doneSteps[i]
          return (
            <div
              key={step.step}
              className={cn(
                "flex flex-col gap-3 p-5 bg-card transition-colors",
                done && "opacity-60"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className={cn("flex size-10 items-center justify-center rounded-xl border", step.bg, step.border)}>
                  <Icon className="size-5" style={{ color: step.color }} />
                </div>
                <span className={cn(
                  "text-xs font-medium px-2 py-0.5 rounded-full",
                  done
                    ? "bg-emerald-500/15 text-emerald-500"
                    : "bg-muted text-muted-foreground"
                )}>
                  {done ? "Готово" : `Шаг ${step.step}`}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold mb-1">{step.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
              {!done && (
                <Link
                  href={step.href}
                  className={cn(
                    "mt-auto flex items-center gap-1.5 text-xs font-medium transition-colors",
                    "text-muted-foreground hover:text-foreground"
                  )}
                  style={{ color: step.color }}
                >
                  {step.cta}
                  <ArrowRight className="size-3" />
                </Link>
              )}
            </div>
          )
        })}
      </div>

      {/* Quest tip */}
      <div className="flex items-start gap-2.5 px-5 py-3.5 bg-muted/40 border-t border-border">
        <Info className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          <span className="font-medium text-foreground">Квест</span> — это задача с высоким приоритетом, привязанная к цели и дающая больше XP.{" "}
          <span className="font-medium text-foreground">Обычная задача</span> — любое дело без особых условий. Начни с обычной, потом превращай лучшие в квесты.
        </p>
      </div>
    </div>
  )
}
