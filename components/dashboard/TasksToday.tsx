"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useTasks, useCompleteTask } from "@/hooks/modules/use-tasks"
import { FadeIn } from "@/components/animations"
import { CheckCircle2, Circle, Plus, Sword, ArrowRight, Zap } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import type { Task } from "@/lib/types"

const PRIORITY_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
}

const PRIORITY_LABELS: Record<string, { label: string; color: string }> = {
  critical: { label: "Срочно", color: "text-red-500 bg-red-500/10 border-red-500/20" },
  high: { label: "Высокий", color: "text-orange-500 bg-orange-500/10 border-orange-500/20" },
  medium: { label: "Средний", color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
  low: { label: "Низкий", color: "text-muted-foreground bg-muted/50 border-border" },
}

const PRIORITY_XP: Record<string, number> = {
  critical: 30,
  high: 20,
  medium: 10,
  low: 5,
}

function TaskRow({
  task,
  onComplete,
}: {
  task: Task
  onComplete: (id: string) => Promise<void>
}) {
  const [completing, setCompleting] = useState(false)
  const priority = PRIORITY_LABELS[task.priority] ?? PRIORITY_LABELS.medium
  const xp = PRIORITY_XP[task.priority] ?? 10

  const handleComplete = async () => {
    setCompleting(true)
    await onComplete(task.id)
    setCompleting(false)
  }

  const isDone = task.status === "completed"

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border transition-all",
        isDone
          ? "opacity-50 bg-success/5 border-success/20"
          : "hover:bg-muted/50 border-transparent hover:border-border"
      )}
    >
      <button
        onClick={handleComplete}
        disabled={isDone || completing}
        className="flex-shrink-0 focus:outline-none"
        aria-label={isDone ? "Задача выполнена" : "Отметить как выполненную"}
      >
        {isDone ? (
          <CheckCircle2 className="size-5 text-success fill-success/20" />
        ) : (
          <Circle
            className={cn(
              "size-5 text-muted-foreground hover:text-primary transition-colors",
              completing && "animate-spin text-primary"
            )}
          />
        )}
      </button>

      <span
        className={cn(
          "flex-1 text-sm font-medium leading-tight",
          isDone && "line-through text-muted-foreground"
        )}
      >
        {task.title}
      </span>

      <Badge
        variant="outline"
        className={cn("text-[10px] font-semibold shrink-0 border", priority.color)}
      >
        {priority.label}
      </Badge>

      {!isDone && (
        <div className="flex items-center gap-0.5 text-[10px] font-bold text-chart-3 bg-chart-3/10 px-1.5 py-0.5 rounded shrink-0">
          <Zap className="size-3" />
          {xp}
        </div>
      )}
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
            <Sword className="size-4 text-primary" />
            Сейчас в фокусе
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-11 rounded-lg bg-muted animate-pulse" />
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <FadeIn delay={0.1}>
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Sword className="size-4 text-primary" />
            <CardTitle className="text-base">Сейчас в фокусе</CardTitle>
            {totalCount > 0 && (
              <span className="text-xs text-muted-foreground font-normal">
                {completedCount}/{totalCount}
              </span>
            )}
          </div>
          <Link href="/tasks">
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
              Все <ArrowRight className="size-3" />
            </Button>
          </Link>
        </CardHeader>

        <CardContent className="space-y-1">
          {tasks.length === 0 ? (
            <div className="text-center py-6 space-y-3">
              <p className="text-sm text-muted-foreground">
                Отличный день! Задач нет — самое время добавить квест.
              </p>
              <Link href="/tasks/new">
                <Button size="sm" variant="outline" className="gap-1">
                  <Plus className="size-3" />
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
      </Card>
    </FadeIn>
  )
}
