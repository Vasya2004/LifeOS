"use client"

import Link from "next/link"
import { Plus } from "lucide-react"
import { FadeIn } from "@/components/animations"
import { useTodaysTasks } from "@/hooks/modules/use-tasks"
import type { Task } from "@/lib/types"

const MONTHS_SHORT = [
  "янв", "фев", "мар", "апр", "май", "июн",
  "июл", "авг", "сен", "окт", "ноя", "дек",
]

const DAYS_RU = [
  "Воскресенье", "Понедельник", "Вторник",
  "Среда", "Четверг", "Пятница", "Суббота",
]

const TASK_COLORS = [
  "#a78bfa", // purple
  "#60a5fa", // blue
  "#34d399", // green
  "#f472b6", // pink
  "#fb923c", // orange
  "#38bdf8", // cyan
]

function formatTime(time?: string) {
  if (!time) return null
  return time.slice(0, 5)
}

export function DayWidget() {
  const tasks = useTodaysTasks()
  const now = new Date()
  const day = now.getDate()
  const month = now.getMonth()
  const dayOfWeek = now.getDay()

  const pending = tasks.filter((t: Task) => t.status !== "completed")
  const preview = pending.slice(0, 3)
  const totalCount = tasks.length

  return (
    <FadeIn delay={0.15} className="h-full">
      <div
        className="relative flex h-full flex-col overflow-hidden rounded-2xl p-4"
        style={{
          background: "linear-gradient(160deg, #0e1420 0%, #080d16 100%)",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.06), 0 8px 32px rgba(0,0,0,0.5)",
        }}
      >
        <div className="flex gap-3">

          {/* ── Left panel ── */}
          <div
            className="relative flex w-[42%] flex-shrink-0 flex-col justify-between overflow-hidden rounded-xl px-3 py-4"
            style={{
              background: "linear-gradient(160deg, #141e30 0%, #0c1522 100%)",
              minHeight: 180,
            }}
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

            {/* Date */}
            <div className="relative">
              <p className="text-4xl font-black leading-none tracking-tight text-white">
                {MONTHS_SHORT[month].charAt(0).toUpperCase() + MONTHS_SHORT[month].slice(1)}{" "}
                {day}
              </p>
            </div>

            {/* Day + count */}
            <div className="relative">
              <p className="text-sm font-semibold text-white">{DAYS_RU[dayOfWeek]}</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                {totalCount} {totalCount === 1 ? "задача" : totalCount < 5 ? "задачи" : "задач"}
              </p>
            </div>
          </div>

          {/* ── Right panel ── */}
          <div className="flex flex-1 flex-col py-1">

            {/* Header */}
            <p
              className="mb-2 text-[10px] font-semibold uppercase tracking-[0.15em]"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              Предстоящее
            </p>

            {/* Task list */}
            <div className="flex flex-1 flex-col gap-2">
              {preview.length === 0 ? (
                <p className="text-xs italic" style={{ color: "rgba(255,255,255,0.25)" }}>
                  Задач нет
                </p>
              ) : (
                preview.map((task: Task, i: number) => (
                  <div key={task.id} className="flex items-start gap-2">
                    {/* Colored left bar */}
                    <div
                      className="mt-0.5 w-0.5 self-stretch rounded-full flex-shrink-0"
                      style={{
                        background: TASK_COLORS[i % TASK_COLORS.length],
                        minHeight: 28,
                      }}
                    />
                    <div className="min-w-0">
                      <p
                        className="truncate text-xs font-medium leading-tight text-white"
                        title={task.title}
                      >
                        {task.title}
                      </p>
                      <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                        {formatTime(task.scheduledTime)
                          ? formatTime(task.scheduledTime)
                          : "Без времени"}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add button — прижат к низу */}
            <div className="mt-auto pt-3 flex justify-end">
              <Link href="/tasks">
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
