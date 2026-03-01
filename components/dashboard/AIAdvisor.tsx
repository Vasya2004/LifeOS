"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAIAdvice } from "@/hooks/useAIAdvice"
import { useDayPlan } from "@/hooks/useDayPlan"
import { useCreateTask } from "@/hooks/modules/use-tasks"
import { FadeIn } from "@/components/animations"
import { motion, AnimatePresence } from "framer-motion"
import { mutate } from "swr"
import {
  Sparkles, X, Check, ArrowRight, ChevronDown,
  AlertTriangle, Lightbulb, TrendingUp,
  CalendarPlus, CheckSquare, Square, Loader2, Zap,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import type { AIAdvice, AIAdviceType } from "@/lib/types/dashboard.types"
import type { DayPlanTask } from "@/hooks/useDayPlan"

// ─── Advice card type config ──────────────────────────────────────────────────

const TYPE_CONFIG: Record<
  AIAdviceType,
  { icon: React.ComponentType<{ className?: string }>; cardClass: string; iconClass: string; badgeLabel: string }
> = {
  urgent: {
    icon: AlertTriangle,
    cardClass: "border-orange-500/20 bg-orange-500/5",
    iconClass: "text-orange-500",
    badgeLabel: "Внимание",
  },
  warning: {
    icon: AlertTriangle,
    cardClass: "border-yellow-500/20 bg-yellow-500/5",
    iconClass: "text-yellow-500",
    badgeLabel: "Совет",
  },
  tip: {
    icon: Lightbulb,
    cardClass: "border-[#8b5cf6]/20 bg-[#8b5cf6]/5",
    iconClass: "text-[#8b5cf6]",
    badgeLabel: "Идея",
  },
  positive: {
    icon: TrendingUp,
    cardClass: "border-green-500/20 bg-green-500/5",
    iconClass: "text-green-500",
    badgeLabel: "Отлично",
  },
}

const PRIORITY_COLOR: Record<string, string> = {
  critical: "text-red-400 bg-red-400/10 border-red-400/20",
  high:     "text-orange-400 bg-orange-400/10 border-orange-400/20",
  medium:   "text-indigo-400 bg-indigo-400/10 border-indigo-400/20",
  low:      "text-slate-400 bg-slate-400/10 border-slate-400/20",
}

// ─── Advice card ──────────────────────────────────────────────────────────────

function AdviceCard({
  advice,
  onDismiss,
}: {
  advice: AIAdvice
  onDismiss: (id: string) => void
}) {
  const config = TYPE_CONFIG[advice.type]
  const Icon = config.icon

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className={cn("rounded-xl border p-4 flex gap-3", config.cardClass)}
    >
      <div className="shrink-0 mt-0.5">
        <Icon className={cn("size-4", config.iconClass)} />
      </div>
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-semibold leading-tight">{advice.title}</h4>
          <Badge variant="outline" className="text-[10px] shrink-0">
            {config.badgeLabel}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{advice.message}</p>
        <div className="flex items-center gap-2 pt-1">
          {advice.actionHref && advice.actionLabel && (
            <Link href={advice.actionHref}>
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1 px-3">
                {advice.actionLabel}
                <ArrowRight className="size-3" />
              </Button>
            </Link>
          )}
          <Button
            size="sm"
            variant="ghost"
            className={cn(
              "h-7 text-xs gap-1 px-2 ml-auto",
              advice.dismissible ? "text-muted-foreground hover:text-foreground" : "text-primary"
            )}
            onClick={() => onDismiss(advice.id)}
          >
            {advice.dismissible ? <X className="size-3" /> : <Check className="size-3" />}
            {advice.dismissible ? "Позже" : "Понятно"}
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Day plan suggestion row ──────────────────────────────────────────────────

function SuggestionRow({
  task,
  selected,
  onToggle,
}: {
  task: DayPlanTask
  selected: boolean
  onToggle: (id: string) => void
}) {
  return (
    <button
      onClick={() => onToggle(task.id)}
      className={cn(
        "w-full flex items-center gap-3 p-2.5 rounded-lg border text-left transition-all",
        selected
          ? "border-[#8b5cf6]/40 bg-[#8b5cf6]/8"
          : "border-transparent bg-slate-900/30 hover:border-slate-700 hover:bg-slate-800/30"
      )}
    >
      {selected ? (
        <CheckSquare className="size-4 shrink-0 text-indigo-400" />
      ) : (
        <Square className="size-4 shrink-0 text-muted-foreground" />
      )}
      <span className="flex-1 text-sm">{task.title}</span>
      <span className={cn(
        "shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded border",
        PRIORITY_COLOR[task.priority]
      )}>
        {task.tag}
      </span>
    </button>
  )
}

// ─── Day plan section ─────────────────────────────────────────────────────────

type PlanState = "idle" | "picking" | "added"

function DayPlanSection() {
  const { suggestions } = useDayPlan()
  const createTask = useCreateTask()
  const [state, setState] = useState<PlanState>("idle")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [adding, setAdding] = useState(false)

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleGenerate = () => {
    // Pre-select first 2 suggestions
    const preSelected = new Set(suggestions.slice(0, 2).map(s => s.id))
    setSelected(preSelected)
    setState("picking")
  }

  const handleAdd = async () => {
    const toAdd = suggestions.filter(s => selected.has(s.id))
    if (toAdd.length === 0) return

    setAdding(true)
    for (const task of toAdd) {
      await createTask({
        title: task.title,
        status: "todo",
        priority: task.priority,
        scheduledDate: task.scheduledDate,
        energyCost: "medium",
        energyType: "mental",
        xpReward: 10,
        tags: [task.tag],
      } as any)
    }
    await mutate("tasks")
    setAdding(false)
    setState("added")
  }

  return (
    <AnimatePresence mode="wait">
      {state === "idle" && (
        <motion.div
          key="idle"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="rounded-xl border border-dashed border-[#8b5cf6]/30 bg-[#8b5cf6]/5 p-4"
        >
          <div className="flex items-start gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#8b5cf6]/15">
              <CalendarPlus className="size-4 text-indigo-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Составить план на день</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                На сегодня нет задач. AI подберёт список дел на основе твоих целей и привычек.
              </p>
              <Button
                size="sm"
                variant="outline"
                className="mt-3 h-7 text-xs gap-1.5 border-[#8b5cf6]/30 text-indigo-400 hover:border-[#8b5cf6]/60 hover:text-indigo-300"
                onClick={handleGenerate}
              >
                <Zap className="size-3" />
                Сгенерировать план
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {state === "picking" && (
        <motion.div
          key="picking"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="rounded-xl border border-[#8b5cf6]/20 bg-card p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Выбери задачи для плана</p>
            <span className="text-xs text-muted-foreground">{selected.size} выбрано</span>
          </div>

          <div className="space-y-1">
            {suggestions.map(task => (
              <SuggestionRow
                key={task.id}
                task={task}
                selected={selected.has(task.id)}
                onToggle={toggleSelect}
              />
            ))}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Button
              size="sm"
              className="h-8 text-xs gap-1.5 flex-1"
              disabled={selected.size === 0 || adding}
              onClick={handleAdd}
            >
              {adding ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <Check className="size-3" />
              )}
              {adding ? "Добавляю…" : `Добавить${selected.size > 0 ? ` (${selected.size})` : ""}`}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-xs text-muted-foreground"
              onClick={() => setState("idle")}
            >
              Отмена
            </Button>
          </div>
        </motion.div>
      )}

      {state === "added" && (
        <motion.div
          key="added"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 280, damping: 22 }}
          className="rounded-xl border border-emerald-500/25 bg-emerald-500/8 p-4 flex items-center gap-3"
        >
          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
            <Check className="size-3.5 text-emerald-500" />
          </div>
          <p className="text-sm font-medium text-emerald-400">
            Задачи добавлены в план на сегодня!
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Main AIAdvisor component ─────────────────────────────────────────────────

export function AIAdvisor() {
  const adviceList = useAIAdvice()
  const { hasTodayTasks, isLoading } = useDayPlan()
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [collapsed, setCollapsed] = useState(true)

  const visible = (adviceList || []).filter((a: AIAdvice) => !dismissed.has(a.id))
  const showDayPlan = !isLoading && !hasTodayTasks
  const topAdvice = visible[0]

  const handleDismiss = (id: string) => {
    setDismissed(prev => new Set([...prev, id]))
  }

  // Only render if there's something to show
  if (!showDayPlan && visible.length === 0) return null

  const totalHints = visible.length + (showDayPlan ? 1 : 0)

  return (
    <FadeIn delay={0.3}>
      <Card className="border-primary/15">
        {/* Fully-clickable compact header — shows preview when collapsed */}
        <button
          onClick={() => setCollapsed(v => !v)}
          className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-accent/20 transition-colors rounded-xl"
        >
          <div className="p-1.5 rounded-lg bg-primary/10 shrink-0">
            <Sparkles className="size-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-sm font-semibold font-heading">AI Наставник</span>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {collapsed
                ? (topAdvice?.title ?? (showDayPlan ? "Составить план на день →" : ""))
                : "Персональные рекомендации"}
            </p>
          </div>
          {collapsed && totalHints > 0 && (
            <Badge variant="outline" className="text-[10px] shrink-0 tabular-nums">
              {totalHints}
            </Badge>
          )}
          <ChevronDown
            className={cn("size-4 text-muted-foreground shrink-0 transition-transform duration-200", !collapsed && "rotate-180")}
          />
        </button>

        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              key="advisor-content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              style={{ overflow: "hidden" }}
            >
              <div className="px-4 pb-4 pt-1 space-y-3 border-t border-border/40">
                {/* Day plan block — only when no today tasks */}
                {showDayPlan && <DayPlanSection />}

                {/* Regular advice cards */}
                <AnimatePresence mode="popLayout">
                  {visible.map(advice => (
                    <AdviceCard key={advice.id} advice={advice} onDismiss={handleDismiss} />
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </FadeIn>
  )
}
