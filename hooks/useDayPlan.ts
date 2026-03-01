"use client"

import { useMemo } from "react"
import { useTasks } from "@/hooks/modules/use-tasks"
import { useGoals } from "@/hooks/modules/use-goals"
import { useHabits } from "@/hooks/modules/use-habits"
import { useSkills } from "@/hooks/modules/use-skills"
import type { Task } from "@/lib/types"

export interface DayPlanTask {
  id: string
  title: string
  priority: Task["priority"]
  tag: string // reason chip label
  scheduledDate: string
}

function buildSuggestions(
  tasks: Task[] | undefined,
  goals: { title: string; progress: number; targetDate?: string }[] | undefined,
  habits: { title: string; targetDays: number[] }[] | undefined,
  skills: { name: string; lastActivityDate?: string }[] | undefined
): DayPlanTask[] {
  const today = new Date().toISOString().split("T")[0]
  const suggestions: DayPlanTask[] = []

  // 1. Overdue tasks — highest value to pick up
  const overdue = (tasks ?? []).filter(t => {
    if (t.status === "completed" || t.status === "cancelled") return false
    return t.scheduledDate && t.scheduledDate < today
  })
  for (const t of overdue.slice(0, 2)) {
    suggestions.push({
      id: `plan-overdue-${t.id}`,
      title: t.title,
      priority: t.priority,
      tag: "Просрочена",
      scheduledDate: today,
    })
  }

  // 2. Goal-based — if goal has low progress and no task yet
  const activeGoals = (goals ?? []).filter((g: any) => g.status === "active" || !g.status)
  const goalWithLowProgress = activeGoals.find(g => g.progress < 70)
  if (goalWithLowProgress && suggestions.length < 4) {
    const taskTitle = goalWithLowProgress.title.length < 40
      ? `Сделать шаг к цели: ${goalWithLowProgress.title}`
      : `Шаг к цели: ${goalWithLowProgress.title.slice(0, 35)}…`
    suggestions.push({
      id: "plan-goal-0",
      title: taskTitle,
      priority: "high",
      tag: `Цель ${goalWithLowProgress.progress}%`,
      scheduledDate: today,
    })
  }

  // 3. Habit due today
  const todayDow = new Date().getDay()
  const dueHabits = (habits ?? []).filter(h => h.targetDays.includes(todayDow))
  if (dueHabits.length > 0 && suggestions.length < 4) {
    suggestions.push({
      id: "plan-habit-0",
      title: `Выполнить привычку: ${dueHabits[0].title}`,
      priority: "medium",
      tag: "Привычка",
      scheduledDate: today,
    })
  }

  // 4. Skill practice
  if ((skills ?? []).length > 0 && suggestions.length < 4) {
    suggestions.push({
      id: "plan-skill-0",
      title: `Потренировать навык: ${skills![0].name}`,
      priority: "medium",
      tag: "Навык",
      scheduledDate: today,
    })
  }

  // 5. Fill with generic suggestions if under 3
  const generic: Omit<DayPlanTask, "id">[] = [
    { title: "Записать три приоритета на сегодня", priority: "medium", tag: "Планирование", scheduledDate: today },
    { title: "15 минут на чтение или обучение",    priority: "low",    tag: "Развитие",    scheduledDate: today },
    { title: "Записать итоги дня",                  priority: "low",    tag: "Рефлексия",   scheduledDate: today },
  ]
  for (const g of generic) {
    if (suggestions.length >= 5) break
    suggestions.push({ id: `plan-generic-${suggestions.length}`, ...g })
  }

  return suggestions.slice(0, 5)
}

export function useDayPlan() {
  const { data: tasks, isLoading: tasksLoading } = useTasks()
  const { data: goals,  isLoading: goalsLoading  } = useGoals()
  const { data: habits, isLoading: habitsLoading } = useHabits()
  const { data: skills, isLoading: skillsLoading } = useSkills()

  const today = new Date().toISOString().split("T")[0]
  const isLoading = tasksLoading || goalsLoading || habitsLoading || skillsLoading

  const hasTodayTasks = useMemo(() =>
    (tasks ?? []).some(t => t.scheduledDate === today),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tasks, today]
  )

  const suggestions = useMemo(() =>
    buildSuggestions(tasks, goals as any, habits, skills),
    [tasks, goals, habits, skills]
  )

  return { hasTodayTasks, suggestions, isLoading }
}
