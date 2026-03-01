"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SkeletonList } from "@/components/ui"
import { useTasks, useCompleteTask } from "@/hooks/modules/use-tasks"
import { FadeIn } from "@/components/animations"
import { Sword, ArrowRight, Plus, Circle, CheckCircle2, Zap } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import type { Task } from "@/lib/types"

const PRIORITY_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
}

const PRIORITY_XP: Record<string, number> = {
  critical: 30,
  high: 20,
  medium: 10,
  low: 5,
}

const PRIORITY_COLORS: Record<string, string> = {
  critical: "bg-red-500/15 text-red-400 border-red-500/20",
  high: "bg-orange-500/15 text-orange-400 border-orange-500/20",
  medium: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  low: "bg-[#8b5cf6]/15 text-[#a78bfa] border-[#8b5cf6]/20",
}

const PRIORITY_LABELS: Record<string, string> = {
  critical: "Критично",
  high: "Высокий",
  medium: "Средний",
  low: "Низкий",
}

function PriorityIndicator({ priority }: { priority: string }) {
  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border uppercase tracking-wider",
      PRIORITY_COLORS[priority] || PRIORITY_COLORS.medium
    )}>
      {PRIORITY_LABELS[priority] || priority}
    </span>
  )
}

function TaskRow({
  task,
  onComplete,
}: {
  task: Task
  onComplete: (id: string) => Promise<void>
}) {
  const [completing, setCompleting] = useState(false)
  const [showXpPopup, setShowXpPopup] = useState(false)
  const xp = PRIORITY_XP[task.priority] ?? 10

  const handleComplete = async () => {
    if (completing || task.status === "completed") return
    setCompleting(true)
    setShowXpPopup(true)
    await onComplete(task.id)
    setCompleting(false)
    setTimeout(() => setShowXpPopup(false), 1200)
  }

  const isDone = task.status === "completed"

  return (
    <div className="relative">
      <div
        className={cn(
          "flex items-center gap-3 p-3 rounded-lg border transition-all",
          isDone
            ? "opacity-50 bg-[#22c55e]/5 border-[#22c55e]/20"
            : "bg-[#0a0a0f] border-white/[0.08] hover:border-white/[0.15]"
        )}
      >
        <button
          onClick={handleComplete}
          disabled={isDone || completing}
          className="flex-shrink-0 p-1.5 -m-1.5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6]"
          aria-label={isDone ? "Задача выполнена" : "Отметить как выполненную"}
        >
          {isDone ? (
            <CheckCircle2 className="size-5 text-[#22c55e]" />
          ) : (
            <Circle
              className={cn(
                "size-5 text-[#9ca3af] hover:text-[#8b5cf6] transition-colors",
                completing && "animate-spin text-[#8b5cf6]"
              )}
            />
          )}
        </button>

        <span
          className={cn(
            "flex-1 text-sm font-medium leading-tight",
            isDone && "line-through text-[#9ca3af]"
          )}
        >
          {task.title}
        </span>

        <PriorityIndicator priority={task.priority} />

        {!isDone && <Badge variant="xp">⚡ {xp}</Badge>}
      </div>

      {/* Floating +XP popup */}
      <AnimatePresence>
        {showXpPopup && (
          <motion.div
            key="xp-popup"
            initial={{ opacity: 1, y: 0, scale: 0.8 }}
            animate={{ opacity: 0, y: -40, scale: 1.1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.0, ease: "easeOut" }}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 rounded-full bg-[#8b5cf6] px-2.5 py-1 text-xs font-bold text-white shadow-lg"
          >
            <Zap className="size-3 fill-white" />
            +{xp} XP
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function TasksToday() {
  const { data: allTasks, isLoading } = useTasks()
  const completeTask = useCompleteTask()

  const today = new Date().toISOString().split("T")[0]
  const todayTasks = (allTasks ?? []).filter((t: Task) => t.scheduledDate === today)

  const tasks = todayTasks
    .slice()
    .sort(
      (a: Task, b: Task) =>
        (PRIORITY_ORDER[a.priority] ?? 2) - (PRIORITY_ORDER[b.priority] ?? 2)
    )
    .slice(0, 5)

  const completedCount = tasks.filter((t: Task) => t.status === "completed").length
  const totalCount = tasks.length

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Sword className="size-4 text-[#8b5cf6]" />
            Сейчас в фокусе
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SkeletonList count={3} />
        </CardContent>
      </Card>
    )
  }

  return (
    <FadeIn delay={0.1}>
      <Card className="border-white/[0.08]">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Sword className="size-4 text-[#8b5cf6]" />
            <CardTitle className="text-base">Сейчас в фокусе</CardTitle>
            {totalCount > 0 && (
              <span className="text-xs text-[#9ca3af]">
                {completedCount}/{totalCount}
              </span>
            )}
          </div>
          <Link href="/tasks">
            <Button variant="ghost" size="sm">
              Все <ArrowRight className="size-3 ml-1" />
            </Button>
          </Link>
        </CardHeader>

        <CardContent className="space-y-2">
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center py-8 gap-4">
              <div className="flex size-12 items-center justify-center rounded-full bg-[#8b5cf6]/10">
                <Sword className="size-6 text-[#8b5cf6]/60" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-medium text-white">Фокус свободен!</p>
                <p className="text-xs text-[#9ca3af]">
                  Добавь задачу на сегодня и зарабатывай XP за каждое выполненное дело.
                </p>
              </div>
              <Link href="/tasks/new">
                <Button size="sm" className="gap-1.5">
                  <Plus className="size-3.5" />
                  Добавить задачу
                </Button>
              </Link>
            </div>
          ) : (
            tasks.map((task: Task) => (
              <TaskRow key={task.id} task={task} onComplete={completeTask} />
            ))
          )}
        </CardContent>
        
        {tasks.length > 0 && completedCount < totalCount && (
          <CardFooter className="pt-2">
            <p className="text-xs text-[#9ca3af]">
              Осталось {totalCount - completedCount} задач
            </p>
          </CardFooter>
        )}
      </Card>
    </FadeIn>
  )
}
