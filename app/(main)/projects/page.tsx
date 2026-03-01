"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useProjects, useCreateProject, useDeleteProject, useCompleteProject, useUpdateProject } from "@/hooks/modules/use-projects"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import {
  FolderKanban,
  Plus,
  MoreHorizontal,
  CheckCircle2,
  PauseCircle,
  Archive,
  Trash2,
  Calendar,
  Zap,
  ChevronRight,
  Play,
} from "lucide-react"
import type { Project } from "@/lib/types"

// ─── Colour / icon presets ───────────────────────────────────────────────────

const COLOR_PRESETS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e",
  "#f97316", "#eab308", "#22c55e", "#06b6d4",
  "#8b5cf6", "#64748b",
]

const ICON_PRESETS = ["🚀", "💡", "🎯", "📚", "🎨", "💻", "🏗️", "🌱", "⚡", "🔬"]

const PRIORITY_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: "Мин",      color: "bg-slate-500/20 text-slate-400" },
  2: { label: "Низкий",   color: "bg-[#8b5cf6]/20 text-[#a78bfa]" },
  3: { label: "Средний",  color: "bg-yellow-500/20 text-yellow-400" },
  4: { label: "Высокий",  color: "bg-orange-500/20 text-orange-400" },
  5: { label: "Крит",     color: "bg-red-500/20 text-red-400" },
}

// ─── Status tabs config ───────────────────────────────────────────────────────

const STATUS_TABS = [
  { value: "active",    label: "Активные",    icon: Play },
  { value: "paused",   label: "На паузе",    icon: PauseCircle },
  { value: "completed", label: "Завершённые", icon: CheckCircle2 },
  { value: "archived",  label: "Архив",       icon: Archive },
] as const

// ─── Project card ─────────────────────────────────────────────────────────────

function ProjectCard({ project }: { project: Project }) {
  const router = useRouter()
  const deleteProject = useDeleteProject()
  const completeProjectFn = useCompleteProject()
  const updateProject = useUpdateProject()

  const priority = PRIORITY_LABELS[project.priority]
  const isCompleted = project.status === "completed"

  const handleDelete = async () => {
    await deleteProject(project.id)
    toast.success("Проект удалён")
  }

  const handleComplete = async () => {
    await completeProjectFn(project.id)
    toast.success(`🎉 Проект завершён! +${project.xpAwarded || project.priority * 50} XP`)
  }

  const handlePause = async () => {
    const newStatus = project.status === "paused" ? "active" : "paused"
    await updateProject(project.id, { status: newStatus })
    toast.success(newStatus === "paused" ? "Проект приостановлен" : "Проект возобновлён")
  }

  const handleArchive = async () => {
    await updateProject(project.id, { status: "archived" })
    toast.success("Проект перемещён в архив")
  }

  return (
    <Card
      className="group relative cursor-pointer border-white/[0.07] bg-[#111111] hover:bg-[#161616] transition-all duration-200 hover:border-white/[0.12]"
      onClick={() => router.push(`/projects/${project.id}`)}
    >
      <CardContent className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-lg"
              style={{ backgroundColor: project.color + "22", border: `1px solid ${project.color}44` }}
            >
              {project.icon}
            </span>
            <div className="min-w-0">
              <h3 className={`font-semibold text-sm leading-snug truncate ${isCompleted ? "text-white/50 line-through" : "text-white"}`}>
                {project.title}
              </h3>
              {project.deadline && (
                <p className="text-xs text-white/40 flex items-center gap-1 mt-0.5">
                  <Calendar className="size-3" />
                  {new Date(project.deadline).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}
                </p>
              )}
            </div>
          </div>

          {/* Actions menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
              <button className="opacity-0 group-hover:opacity-100 transition-opacity rounded-md p-1 hover:bg-white/10">
                <MoreHorizontal className="size-4 text-white/60" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#1a1a1a] border-white/10">
              {!isCompleted && (
                <DropdownMenuItem onClick={e => { e.stopPropagation(); handleComplete() }} className="text-green-400 focus:text-green-300">
                  <CheckCircle2 className="mr-2 size-4" /> Завершить
                </DropdownMenuItem>
              )}
              {project.status === "active" && (
                <DropdownMenuItem onClick={e => { e.stopPropagation(); handlePause() }}>
                  <PauseCircle className="mr-2 size-4" /> Пауза
                </DropdownMenuItem>
              )}
              {project.status === "paused" && (
                <DropdownMenuItem onClick={e => { e.stopPropagation(); handlePause() }}>
                  <Play className="mr-2 size-4" /> Возобновить
                </DropdownMenuItem>
              )}
              {project.status !== "archived" && (
                <DropdownMenuItem onClick={e => { e.stopPropagation(); handleArchive() }}>
                  <Archive className="mr-2 size-4" /> В архив
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem
                onClick={e => { e.stopPropagation(); handleDelete() }}
                className="text-red-400 focus:text-red-300"
              >
                <Trash2 className="mr-2 size-4" /> Удалить
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Description */}
        {project.description && (
          <p className="text-xs text-white/45 leading-relaxed line-clamp-2 mb-3">
            {project.description}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priority.color}`}>
            {priority.label}
          </span>
          <div className="flex items-center gap-1 text-xs text-white/35">
            <Zap className="size-3" />
            {project.xpAwarded || project.priority * 50} XP
          </div>
        </div>

        {/* Color accent bar */}
        <div
          className="absolute left-0 top-3 bottom-3 w-0.5 rounded-r-full"
          style={{ backgroundColor: project.color }}
        />
      </CardContent>
    </Card>
  )
}

// ─── Create project dialog ────────────────────────────────────────────────────

function CreateProjectDialog({ onSuccess }: { onSuccess?: () => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const createProject = useCreateProject()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<"1"|"2"|"3"|"4"|"5">("3")
  const [color, setColor] = useState(COLOR_PRESETS[0])
  const [icon, setIcon] = useState(ICON_PRESETS[0])
  const [deadline, setDeadline] = useState("")

  const reset = () => {
    setTitle("")
    setDescription("")
    setPriority("3")
    setColor(COLOR_PRESETS[0])
    setIcon(ICON_PRESETS[0])
    setDeadline("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setLoading(true)
    try {
      const priorityNum = Number(priority) as 1|2|3|4|5
      await createProject({
        title: title.trim(),
        description: description.trim(),
        status: "active",
        priority: priorityNum,
        color,
        icon,
        deadline: deadline || undefined,
        startedAt: new Date().toISOString().split("T")[0],
        xpAwarded: priorityNum * 50,
      })
      toast.success("Проект создан!")
      reset()
      setOpen(false)
      onSuccess?.()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="size-4" /> Новый проект
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#111111] border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Новый проект</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Icon + Color row */}
          <div className="flex gap-4">
            {/* Icon picker */}
            <div className="space-y-1.5">
              <Label className="text-white/60 text-xs">Иконка</Label>
              <div className="flex flex-wrap gap-1.5 w-40">
                {ICON_PRESETS.map(em => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setIcon(em)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-base transition-all ${
                      icon === em ? "ring-2 ring-white/40 bg-white/15" : "hover:bg-white/10"
                    }`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>

            {/* Color picker */}
            <div className="space-y-1.5 flex-1">
              <Label className="text-white/60 text-xs">Цвет</Label>
              <div className="flex flex-wrap gap-1.5">
                {COLOR_PRESETS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-6 h-6 rounded-full transition-all ${
                      color === c ? "ring-2 ring-white ring-offset-2 ring-offset-[#111111] scale-110" : ""
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div
            className="rounded-xl px-4 py-3 flex items-center gap-3"
            style={{ backgroundColor: color + "15", border: `1px solid ${color}33` }}
          >
            <span className="text-2xl">{icon}</span>
            <p className="text-sm font-medium text-white/80">{title || "Название проекта"}</p>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label className="text-white/80">Название</Label>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Например: Запустить подкаст"
              required
              className="bg-white/[0.07] border-white/10 text-white placeholder:text-white/30"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-white/80">Описание</Label>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Для чего этот проект?"
              rows={2}
              className="bg-white/[0.07] border-white/10 text-white placeholder:text-white/30 resize-none"
            />
          </div>

          {/* Priority + Deadline */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-white/80">Приоритет</Label>
              <Select value={priority} onValueChange={v => setPriority(v as typeof priority)}>
                <SelectTrigger className="bg-white/[0.07] border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-white/10">
                  <SelectItem value="1">1 — Минимальный</SelectItem>
                  <SelectItem value="2">2 — Низкий</SelectItem>
                  <SelectItem value="3">3 — Средний</SelectItem>
                  <SelectItem value="4">4 — Высокий</SelectItem>
                  <SelectItem value="5">5 — Критичный</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-white/80">Дедлайн</Label>
              <Input
                type="date"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className="bg-white/[0.07] border-white/10 text-white"
              />
            </div>
          </div>

          {/* XP hint */}
          <p className="text-xs text-white/35 flex items-center gap-1.5">
            <Zap className="size-3 text-yellow-500" />
            При завершении: +{Number(priority) * 50} XP
          </p>

          <Button type="submit" disabled={loading || !title.trim()} className="w-full">
            {loading ? "Создание..." : "Создать проект"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ status }: { status: string }) {
  const messages: Record<string, { emoji: string; text: string }> = {
    active:    { emoji: "🚀", text: "Нет активных проектов. Создайте первый!" },
    paused:    { emoji: "⏸️", text: "Нет приостановленных проектов" },
    completed: { emoji: "🏆", text: "Нет завершённых проектов пока" },
    archived:  { emoji: "📦", text: "Архив пуст" },
  }
  const { emoji, text } = messages[status] ?? { emoji: "📂", text: "Нет проектов" }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
      <span className="text-5xl">{emoji}</span>
      <p className="text-white/40 text-sm">{text}</p>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ProjectsPage() {
  const { data: projects, isLoading } = useProjects()
  const [activeTab, setActiveTab] = useState<Project["status"]>("active")

  const filtered = projects?.filter(p => p.status === activeTab) ?? []
  const counts = {
    active:    projects?.filter(p => p.status === "active").length ?? 0,
    paused:    projects?.filter(p => p.status === "paused").length ?? 0,
    completed: projects?.filter(p => p.status === "completed").length ?? 0,
    archived:  projects?.filter(p => p.status === "archived").length ?? 0,
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
              <FolderKanban className="size-6 text-violet-400" />
              Проекты
            </h1>
            <p className="text-sm text-white/40 mt-0.5">
              {(projects?.length ?? 0)} всего
            </p>
          </div>
          <CreateProjectDialog />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={v => setActiveTab(v as Project["status"])}>
          <TabsList className="bg-white/[0.05] border border-white/[0.07] w-full grid grid-cols-4">
            {STATUS_TABS.map(tab => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/50 text-xs gap-1.5"
              >
                {tab.label}
                {counts[tab.value] > 0 && (
                  <span className="text-[10px] bg-white/20 text-white/70 rounded-full px-1.5 py-0 leading-4">
                    {counts[tab.value]}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {STATUS_TABS.map(tab => (
            <TabsContent key={tab.value} value={tab.value} className="mt-4">
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-32 rounded-xl bg-white/[0.04] animate-pulse" />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <EmptyState status={tab.value} />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filtered
                    .sort((a, b) => b.priority - a.priority)
                    .map(project => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}
