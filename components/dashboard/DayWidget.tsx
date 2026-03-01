"use client"

import Link from "next/link"
import { Plus, Flame } from "lucide-react"
import { FadeIn } from "@/components/animations"
import { useTodaysTasks } from "@/hooks/modules/use-tasks"
import { useHabits, useToggleHabit } from "@/hooks/modules/use-habits"
import type { Task, Habit } from "@/lib/types"
import { cn } from "@/lib/utils"

const MONTHS_SHORT = [
  "янв", "фев", "мар", "апр", "май", "июн",
  "июл", "авг", "сен", "окт", "ноя", "дек",
]

const DAYS_RU = [
  "Воскресенье", "Понедельник", "Вторник",
  "Среда", "Четверг", "Пятница", "Суббота",
]

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function isScheduledToday(habit: Habit): boolean {
  const dow = new Date().getDay()
  if (habit.frequency === "daily") return true
  if (habit.frequency === "weekly" || habit.frequency === "custom") {
    return habit.targetDays.includes(dow)
  }
  return true
}

export function DayWidget() {
  const tasks = useTodaysTasks()
  const { data: habits } = useHabits()
  const toggleHabit = useToggleHabit()

  const now = new Date()
  const day = now.getDate()
  const month = now.getMonth()
  const dayOfWeek = now.getDay()
  const today = todayStr()

  const completedTaskCount = tasks.filter((t: Task) => t.status === "completed").length
  const totalTaskCount = tasks.length

  const todaysHabits = (habits ?? []).filter(isScheduledToday).slice(0, 5)
  const completedHabits = todaysHabits.filter(
    (h: Habit) => h.entries?.some((e) => e.date === today && e.completed)
  )

  return (
    <FadeIn delay={0.15} className="h-full">
      <div
        className="relative flex h-full flex-col overflow-hidden rounded-xl p-4 bg-slate-900/60 border border-white/[0.07] shadow-md"
      >
        <div className="flex gap-3 h-full">

          {/* ── Left panel — date (links to /tasks) ── */}
          <Link
            href="/tasks"
            className="relative flex w-[42%] flex-shrink-0 flex-col justify-between overflow-hidden rounded-xl px-3 py-4 bg-white/[0.04] hover:bg-white/[0.07] transition-colors"
          >
            {/* Blue glow at bottom */}
            <div
              className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2"
              style={{
                width: "110%",
                height: "55%",
                background: "radial-gradient(ellipse at 50% 100%, rgba(59,130,246,0.45) 0%, transparent 70%)",
              }}
            />

            {/* Date + task count badge */}
            <div className="relative flex items-start justify-between">
              <p className="text-4xl font-black leading-none tracking-tight text-white">
                {MONTHS_SHORT[month].charAt(0).toUpperCase() + MONTHS_SHORT[month].slice(1)}{" "}
                {day}
              </p>
              {totalTaskCount > 0 && (
                <div
                  className="flex size-5 items-center justify-center rounded-full text-[10px] font-bold text-white shrink-0"
                  style={{ background: "rgba(99,102,241,0.8)" }}
                >
                  {totalTaskCount > 9 ? "9+" : totalTaskCount}
                </div>
              )}
            </div>

            {/* Day + task progress */}
            <div className="relative">
              <p className="text-sm font-semibold text-white">{DAYS_RU[dayOfWeek]}</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                {totalTaskCount === 0
                  ? "Задач нет"
                  : completedTaskCount > 0
                    ? `${completedTaskCount}/${totalTaskCount} задач`
                    : `${totalTaskCount} ${totalTaskCount === 1 ? "задача" : totalTaskCount < 5 ? "задачи" : "задач"}`
                }
              </p>
            </div>
          </Link>

          {/* ── Right panel — habits ── */}
          <div className="flex flex-1 flex-col py-1">

            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <p
                className="text-[10px] font-semibold uppercase tracking-[0.15em]"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                Привычки
              </p>
              {todaysHabits.length > 0 && (
                <span className="text-[10px] font-medium" style={{ color: "rgba(255,255,255,0.40)" }}>
                  {completedHabits.length}/{todaysHabits.length}
                </span>
              )}
            </div>

            {/* Habit list */}
            <div className="flex flex-1 flex-col gap-1.5">
              {todaysHabits.length === 0 ? (
                <p className="text-xs italic" style={{ color: "rgba(255,255,255,0.25)" }}>
                  Привычек нет
                </p>
              ) : (
                todaysHabits.map((habit: Habit) => {
                  const done = habit.entries?.some((e) => e.date === today && e.completed) ?? false
                  return (
                    <button
                      key={habit.id}
                      onClick={() => toggleHabit(habit.id, today, !done)}
                      className="flex items-center gap-2 rounded-lg px-2 py-1 text-left transition-all hover:bg-white/[0.06] active:scale-[0.98]"
                    >
                      {/* Completion dot */}
                      <div
                        className={cn(
                          "flex size-4 shrink-0 items-center justify-center rounded-full border transition-all",
                          done
                            ? "border-emerald-400/70 bg-emerald-400/20"
                            : "border-white/20 bg-transparent"
                        )}
                      >
                        {done && (
                          <div className="size-1.5 rounded-full bg-emerald-400" />
                        )}
                      </div>
                      <span
                        className="flex-1 truncate text-xs font-medium leading-tight"
                        style={{ color: done ? "rgba(255,255,255,0.30)" : "rgba(255,255,255,0.85)" }}
                      >
                        {habit.title}
                      </span>
                      {habit.streak > 0 && !done && (
                        <div className="flex items-center gap-0.5 shrink-0">
                          <Flame className="size-2.5 text-orange-400" />
                          <span className="text-[9px] text-orange-400 font-medium">{habit.streak}</span>
                        </div>
                      )}
                    </button>
                  )
                })
              )}
            </div>

            {/* Go to habits */}
            <div className="mt-auto pt-3 flex justify-end">
              <Link href="/habits">
                <button
                  className="flex size-7 items-center justify-center rounded-full transition-opacity hover:opacity-80"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    border: "1.5px solid rgba(255,255,255,0.15)",
                  }}
                >
                  <Plus className="size-3.5 text-white" />
                </button>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </FadeIn>
  )
}
