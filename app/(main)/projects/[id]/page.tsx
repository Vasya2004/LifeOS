"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useProject, useUpdateProject, useCompleteProject, useDeleteProject } from "@/hooks/modules/use-projects"
import { useTasks, useCreateTask, useCompleteTask, useDeleteTask } from "@/hooks/modules/use-tasks"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Zap,
  Calendar,
  PauseCircle,
  Play,
  Archive,
  CheckSquare,
  FileText,
} from "lucide-react"
import type { Task } from "@/lib/types"

// ─── Priority badge ───────────────────────────────────────────────────────────

const PRIORITY_LABELS: Record<string, { label: string; bg: string }> = {
  critical: { label: "Критично",  bg: "bg-red-500/20 text-red-400" },
  high:     { label: "Высокий",   bg: "bg-orange-500/20 text-orange-400" },
  medium:   { label: "Средний",   bg: "bg-yellow-500/20 text-yellow-400" },
  low:      { label: "Низкий",    bg: "bg-slate-500/20 text-slate-400" },
}

// ─── Task item ────────────────────────────────────────────────────────────────

function TaskItem({ task }: { task: Task }) {
  const completeTask = useCompleteTask()
  const deleteTask = useDeleteTask()
  const isCompleted = task.status === "completed"

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
      isCompleted
        ? "border-white/[0.04] bg-white/[0.02]"
        : "border-white/[0.07] bg-[#111111] hover:bg-[#141414]"
    }`}>
      <button
        onClick={() => {
          if (!isCompleted) {
            completeTask(task.id)
            toast.success("+XP за задачу!")
          }
        }}
        className="flex-shrink-0"
      >
        {isCompleted ? (
          <CheckCircle2 className="size-4 text-green-500" />
        ) : (
          <Circle className="size-4 text-white/30 hover:text-white/60 transition-colors" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`text-sm truncate ${isCompleted ? "text-white/30 line-through" : "text-white/90"}`}>
          {task.title}
        </p>
        {task.scheduledDate && (
          <p className="text-xs text-white/35 mt-0.5 flex items-center gap-1">
            <Calendar className="size-3" />
            {new Date(task.scheduledDate).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}
          </p>
        )}
      </div>

      {task.priority && (
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${
          PRIORITY_LABELS[task.priority]?.bg ?? ""
        }`}>
          {PRIORITY_LABELS[task.priority]?.label}
        </span>
      )}

      <button
        onClick={() => deleteTask(task.id)}
        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/20 rounded"
      >
        <Trash2 className="size-3.5 text-red-400" />
      </button>
    </div>
  )
}

// ─── Add task inline form ─────────────────────────────────────────────────────

function AddTaskForm({ projectId }: { projectId: string }) {
  const [value, setValue] = useState("")
  const [loading, setLoading] = useState(false)
  const createTask = useCreateTask()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!value.trim()) return
    setLoading(true)
    try {
      await createTask({
        title: value.trim(),
        projectId,
        status: "todo",
        priority: "medium",
        energyCost: "medium",
        energyType: "mental",
        scheduledDate: new Date().toISOString().split("T")[0],
      })
      setValue("")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Добавить задачу..."
        disabled={loading}
        className="bg-white/[0.07] border-white/10 text-white placeholder:text-white/30"
      />
      <Button type="submit" disabled={loading || !value.trim()} size="sm" className="shrink-0">
        <Plus className="size-4" />
      </Button>
    </form>
  )
}

// ─── Project header ───────────────────────────────────────────────────────────

function ProjectHeader({
  project,
  onComplete,
  onPause,
  onArchive,
}: {
  project: NonNullable<ReturnType<typeof useProject>>
  onComplete: () => void
  onPause: () => void
  onArchive: () => void
}) {
  const isCompleted = project.status === "completed"
  const isPaused = project.status === "paused"

  return (
    <div
      className="rounded-2xl p-5 border"
      style={{
        backgroundColor: project.color + "12",
        borderColor: project.color + "33",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <span className="text-4xl leading-none mt-0.5">{project.icon}</span>
          <div className="min-w-0">
            <h1 className={`text-xl font-bold leading-tight ${isCompleted ? "text-white/50 line-through" : "text-white"}`}>
              {project.title}
            </h1>
            {project.description && (
              <p className="text-sm text-white/50 mt-1 leading-relaxed">{project.description}</p>
            )}
          </div>
        </div>

        {/* Status badge */}
        <div className="shrink-0">
          {isCompleted ? (
            <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">✓ Завершён</span>
          ) : isPaused ? (
            <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400">⏸ Пауза</span>
          ) : (
            <span className="text-xs px-2 py-1 rounded-full bg-[#8b5cf6]/20 text-[#a78bfa]">● Активен</span>
          )}
        </div>
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-3 mt-4">
        <div className="flex items-center gap-1 text-xs text-white/40">
          <Zap className="size-3 text-yellow-500" />
          {project.xpAwarded || project.priority * 50} XP
        </div>
        {project.deadline && (
          <div className="flex items-center gap-1 text-xs text-white/40">
            <Calendar className="size-3" />
            Дедлайн: {new Date(project.deadline).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}
          </div>
        )}
        <div className="flex items-center gap-1 text-xs text-white/40">
          Приоритет: {project.priority}/5
        </div>
      </div>

      {/* Action buttons */}
      {!isCompleted && (
        <div className="flex flex-wrap gap-2 mt-4">
          <Button
            size="sm"
            variant="outline"
            onClick={onComplete}
            className="border-green-500/30 text-green-400 hover:bg-green-500/10 bg-transparent text-xs"
          >
            <CheckCircle2 className="mr-1.5 size-3.5" /> Завершить проект
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onPause}
            className="border-white/15 text-white/60 hover:bg-white/10 bg-transparent text-xs"
          >
            {isPaused ? (
              <><Play className="mr-1.5 size-3.5" /> Возобновить</>
            ) : (
              <><PauseCircle className="mr-1.5 size-3.5" /> Пауза</>
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onArchive}
            className="border-white/15 text-white/50 hover:bg-white/10 bg-transparent text-xs"
          >
            <Archive className="mr-1.5 size-3.5" /> В архив
          </Button>
        </div>
      )}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const project = useProject(projectId)
  const { data: allTasks } = useTasks()
  const updateProject = useUpdateProject()
  const completeProjectFn = useCompleteProject()
  const deleteProject = useDeleteProject()

  const projectTasks = allTasks?.filter(t => t.projectId === projectId) ?? []
  const activeTasks = projectTasks.filter(t => t.status !== "completed")
  const completedTasks = projectTasks.filter(t => t.status === "completed")

  const handleComplete = async () => {
    await completeProjectFn(projectId)
    toast.success(`🎉 Проект завершён! +${project?.xpAwarded || (project?.priority ?? 3) * 50} XP`)
  }

  const handlePause = async () => {
    if (!project) return
    const newStatus = project.status === "paused" ? "active" : "paused"
    await updateProject(projectId, { status: newStatus })
    toast.success(newStatus === "paused" ? "Проект приостановлен" : "Проект возобновлён")
  }

  const handleArchive = async () => {
    await updateProject(projectId, { status: "archived" })
    toast.success("Проект перемещён в архив")
    router.push("/projects")
  }

  const handleDelete = async () => {
    await deleteProject(projectId)
    toast.success("Проект удалён")
    router.push("/projects")
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-white/40">Проект не найден</p>
          <Button variant="outline" onClick={() => router.push("/projects")} size="sm">
            Вернуться к проектам
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        {/* Back */}
        <button
          onClick={() => router.push("/projects")}
          className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors"
        >
          <ArrowLeft className="size-4" /> Все проекты
        </button>

        {/* Project header card */}
        <ProjectHeader
          project={project}
          onComplete={handleComplete}
          onPause={handlePause}
          onArchive={handleArchive}
        />

        {/* Tabs: Tasks / Info */}
        <Tabs defaultValue="tasks">
          <TabsList className="bg-white/[0.05] border border-white/[0.07]">
            <TabsTrigger value="tasks" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/50 gap-1.5">
              <CheckSquare className="size-3.5" />
              Задачи
              {activeTasks.length > 0 && (
                <span className="text-[10px] bg-white/20 rounded-full px-1.5 leading-4">
                  {activeTasks.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="info" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/50 gap-1.5">
              <FileText className="size-3.5" /> Инфо
            </TabsTrigger>
          </TabsList>

          {/* Tasks tab */}
          <TabsContent value="tasks" className="mt-4 space-y-3">
            {/* Add task */}
            <AddTaskForm projectId={projectId} />

            {/* Active tasks */}
            {activeTasks.length > 0 ? (
              <div className="space-y-1.5">
                {activeTasks.map(task => (
                  <div key={task.id} className="group">
                    <TaskItem task={task} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-white/30 text-sm">
                Нет активных задач. Добавьте первую!
              </div>
            )}

            {/* Completed tasks */}
            {completedTasks.length > 0 && (
              <div className="space-y-1.5 pt-2">
                <p className="text-xs text-white/30 font-medium uppercase tracking-wider px-1">
                  Выполнено ({completedTasks.length})
                </p>
                {completedTasks.map(task => (
                  <div key={task.id} className="group">
                    <TaskItem task={task} />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Info tab */}
          <TabsContent value="info" className="mt-4">
            <Card className="border-white/[0.07] bg-[#111111]">
              <CardContent className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-white/40 text-xs">Статус</p>
                    <p className="text-white capitalize">{project.status}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-white/40 text-xs">Приоритет</p>
                    <p className="text-white">{project.priority} / 5</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-white/40 text-xs">Начат</p>
                    <p className="text-white">
                      {new Date(project.startedAt).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                  {project.deadline && (
                    <div className="space-y-1">
                      <p className="text-white/40 text-xs">Дедлайн</p>
                      <p className="text-white">
                        {new Date(project.deadline).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    </div>
                  )}
                  {project.completedAt && (
                    <div className="space-y-1">
                      <p className="text-white/40 text-xs">Завершён</p>
                      <p className="text-white">
                        {new Date(project.completedAt).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    </div>
                  )}
                  <div className="space-y-1">
                    <p className="text-white/40 text-xs">Задач</p>
                    <p className="text-white">{projectTasks.length} ({completedTasks.length} выполнено)</p>
                  </div>
                </div>

                <hr className="border-white/[0.07]" />

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10 bg-transparent"
                >
                  <Trash2 className="mr-2 size-3.5" /> Удалить проект
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
