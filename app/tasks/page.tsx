"use client"

import { AppShell } from "@/components/app-shell"
import { useTasks, useGoals, useStats } from "@/hooks/use-data"
import { addTask, completeTask, deleteTask, updateTask } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations"
import { TextField, TextareaField, SelectField, NumberField, FormError, SubmitButton } from "@/components/form-field"
import { createTaskSchema, type CreateTaskInput } from "@/lib/validation"
import { useValidatedForm } from "@/hooks/use-validated-form"
import { usePagination } from "@/lib/search/pagination"
import { Pagination } from "@/components/pagination"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { searchInModule } from "@/lib/search"
import { 
  CheckSquare, 
  Plus, 
  Calendar,
  Clock,
  Zap,
  Brain,
  Heart,
  Sparkles,
  Trash2,
  RotateCcw,
  Trophy,
  X
} from "lucide-react"
import { useState, useMemo } from "react"
import { toast } from "sonner"
import type { Task, Goal } from "@/lib/types"

const ENERGY_TYPES = [
  { value: "physical", label: "Физическая", icon: Zap, color: "#22c55e" },
  { value: "mental", label: "Ментальная", icon: Brain, color: "#3b82f6" },
  { value: "emotional", label: "Эмоциональная", icon: Heart, color: "#ec4899" },
  { value: "creative", label: "Творческая", icon: Sparkles, color: "#8b5cf6" },
]

const ENERGY_COSTS = [
  { value: "low", label: "Низкая", xp: 5 },
  { value: "medium", label: "Средняя", xp: 10 },
  { value: "high", label: "Высокая", xp: 20 },
]

const PRIORITIES = [
  { value: "critical", label: "Критично", color: "bg-destructive text-destructive-foreground" },
  { value: "high", label: "Высокий", color: "bg-warning text-warning-foreground" },
  { value: "medium", label: "Средний", color: "bg-secondary text-secondary-foreground" },
  { value: "low", label: "Низкий", color: "bg-muted text-muted-foreground" },
]

export default function TasksPage() {
  const { data: tasks, mutate } = useTasks()
  const { data: goals } = useGoals()
  const { data: stats } = useStats()
  
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Filter tasks based on search
  const filteredTasks = useMemo(() => {
    if (!tasks) return []
    if (!searchQuery.trim()) return tasks
    
    const searchResults = searchInModule('tasks', searchQuery, 1000)
    const searchIds = new Set(searchResults.map(r => r.id))
    return tasks.filter((t: Task) => searchIds.has(t.id))
  }, [tasks, searchQuery])

  // Separate paginated sections for different tabs
  const todoTasksList = filteredTasks?.filter((t: Task) => t.status === "todo") || []
  const completedTasksList = filteredTasks?.filter((t: Task) => t.status === "completed") || []

  const todoPagination = usePagination(todoTasksList, 10)
  const completedPagination = usePagination(completedTasksList, 10)

  const today = new Date().toISOString().split("T")[0]

  const defaultValues = {
    title: "",
    description: "",
    scheduledDate: today,
    priority: "medium" as const,
    energyCost: "medium" as const,
    energyType: "mental" as const,
    duration: 30,
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
    isSubmitting,
    submitError,
    handleFormSubmit,
    resetForm,
  } = useValidatedForm<CreateTaskInput>({
    schema: createTaskSchema,
    defaultValues,
    onSubmit: async (data) => {
      addTask({
        ...data,
        status: "todo",
        priority: data.priority as "low" | "medium" | "high" | "critical",
        energyCost: data.energyCost as "low" | "medium" | "high",
        energyType: data.energyType as "physical" | "mental" | "emotional" | "creative",
      })
      
      toast.success("Задача создана!")
      mutate()
      setIsOpen(false)
      resetForm()
    },
  })

  const scheduledDate = watch("scheduledDate")
  const priority = watch("priority")
  const energyType = watch("energyType")
  const energyCost = watch("energyCost")
  const duration = watch("duration")
  
  const todayTasks = tasks?.filter((t: Task) => t.scheduledDate === today && t.status !== "completed") || []
  const upcomingTasks = tasks?.filter((t: Task) => t.scheduledDate > today && t.status !== "completed") || []
  const completedTasksCount = tasks?.filter((t: Task) => t.status === "completed").length || 0

  const handleComplete = (task: Task) => {
    if (task.status === "completed") return
    
    completeTask(task.id)
    
    const xpReward = PRIORITIES.find(p => p.value === task.priority) ? 
      (task.priority === "critical" ? 30 : task.priority === "high" ? 20 : task.priority === "medium" ? 10 : 5) : 5
    
    toast.success(`Задача выполнена! +${xpReward} XP`, {
      icon: <Trophy className="size-4 text-warning" />
    })
    mutate()
  }

  const handleDelete = (id: string) => {
    if (confirm("Удалить задачу?")) {
      deleteTask(id)
      toast.success("Задача удалена")
      mutate()
    }
  }

  const handleRestore = (task: Task) => {
    updateTask(task.id, { status: "todo", completedAt: undefined })
    toast.success("Задача восстановлена")
    mutate()
  }

  const goalOptions = [
    { value: "", label: "Без цели" },
    ...(goals?.filter((g: Goal) => g.status === "active").map((goal: Goal) => ({
      value: goal.id,
      label: goal.title,
    })) || []),
  ]

  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
        {/* Header */}
        <FadeIn>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Задачи</h1>
              <p className="text-sm text-muted-foreground">
                {todayTasks.length} на сегодня • {completedTasksCount} выполнено
              </p>
            </div>
            <Button onClick={() => { resetForm(); setIsOpen(true); }}>
              <Plus className="mr-2 size-4" />
              Новая задача
            </Button>
          </div>
        </FadeIn>

        {/* Create Dialog */}
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-background rounded-lg shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Новая задача</h2>
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <FormError error={submitError} />
                  
                  <TextField
                    label="Название"
                    name="title"
                    register={register}
                    error={errors.title?.message}
                    placeholder="Что нужно сделать?"
                    required
                  />
                  
                  <TextareaField
                    label="Описание"
                    name="description"
                    register={register}
                    error={errors.description?.message}
                    placeholder="Детали задачи..."
                    rows={2}
                  />

                  <SelectField
                    label="Связана с целью"
                    name="projectId"
                    value={watch("projectId") || ""}
                    onValueChange={(v) => setValue("projectId", v || undefined, { shouldValidate: true })}
                    options={goalOptions}
                    placeholder="Выберите цель (опционально)"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <SelectField
                      label="Приоритет"
                      name="priority"
                      value={priority}
                      onValueChange={(v) => setValue("priority", v as Task["priority"], { shouldValidate: true })}
                      options={PRIORITIES.map(p => ({ value: p.value, label: p.label }))}
                      error={errors.priority?.message}
                    />

                    <TextField
                      label="Дата"
                      name="scheduledDate"
                      register={register}
                      error={errors.scheduledDate?.message}
                      type="date"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <SelectField
                      label="Тип энергии"
                      name="energyType"
                      value={energyType}
                      onValueChange={(v) => setValue("energyType", v as Task["energyType"], { shouldValidate: true })}
                      options={ENERGY_TYPES.map(e => ({ value: e.value, label: e.label, color: e.color }))}
                      error={errors.energyType?.message}
                    />

                    <SelectField
                      label="Затраты энергии"
                      name="energyCost"
                      value={energyCost}
                      onValueChange={(v) => setValue("energyCost", v as Task["energyCost"], { shouldValidate: true })}
                      options={ENERGY_COSTS.map(e => ({ value: e.value, label: `${e.label} (+${e.xp} XP)` }))}
                      error={errors.energyCost?.message}
                    />
                  </div>

                  <NumberField
                    label="Длительность (минут)"
                    name="duration"
                    value={duration}
                    onChange={(v) => setValue("duration", v, { shouldValidate: true })}
                    error={errors.duration?.message}
                    min={5}
                    max={1440}
                    step={5}
                    presets={[15, 30, 60, 120]}
                    unit="м"
                  />

                  <div className="flex gap-2 pt-2">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setIsOpen(false)}>
                      Отмена
                    </Button>
                    <SubmitButton isSubmitting={isSubmitting} className="flex-1">
                      Создать задачу
                    </SubmitButton>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        <FadeIn delay={0.05}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск задач..."
              className="pl-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() => setSearchQuery("")}
              >
                <X className="size-4" />
              </Button>
            )}
          </div>
          {searchQuery && (
            <p className="text-xs text-muted-foreground mt-1">
              Найдено: {filteredTasks.length} задач
            </p>
          )}
        </FadeIn>

        {/* Stats */}
        <FadeIn delay={0.1}>
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckSquare className="size-5 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{stats?.totalTasksCompleted || 0}</p>
                    <p className="text-xs text-muted-foreground">Всего выполнено</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="size-5 text-chart-4" />
                  <div>
                    <p className="text-2xl font-bold">
                      {Math.round((tasks?.filter((t: Task) => t.status === "completed").reduce((acc: number, t: Task) => acc + (t.actualDuration || t.duration || 0), 0) || 0) / 60 * 10) / 10}ч
                    </p>
                    <p className="text-xs text-muted-foreground">Всего времени</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Zap className="size-5 text-chart-5" />
                  <div>
                    <p className="text-2xl font-bold">
                      {Math.round((completedTasksCount / (tasks?.length || 1)) * 100)}%
                    </p>
                    <p className="text-xs text-muted-foreground">Эффективность</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </FadeIn>

        {/* Tasks Tabs */}
        <FadeIn delay={0.2}>
          <Tabs defaultValue="todo" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="todo">
                Активные ({todoTasksList.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Выполнено ({completedTasksCount})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="todo" className="mt-6">
              {todoPagination.items.length === 0 ? (
                <EmptyTasksState onCreate={() => setIsOpen(true)} />
              ) : (
                <>
                  <StaggerContainer className="space-y-2" staggerDelay={0.05}>
                    {todoPagination.items.map((task: Task) => (
                      <StaggerItem key={task.id}>
                        <TaskItem 
                          task={task}
                          onComplete={() => handleComplete(task)}
                          onDelete={() => handleDelete(task.id)}
                        />
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
                  {todoTasksList.length > todoPagination.pageSize && (
                    <div className="mt-6">
                      <Pagination
                        page={todoPagination.page}
                        pageSize={todoPagination.pageSize}
                        total={todoPagination.total}
                        totalPages={todoPagination.totalPages}
                        hasMore={todoPagination.hasMore}
                        onPageChange={todoPagination.goToPage}
                        onPageSizeChange={todoPagination.changePageSize}
                      />
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="completed" className="mt-6">
              {completedPagination.items.length === 0 ? (
                <p className="text-center text-muted-foreground py-12">
                  Пока нет выполненных задач
                </p>
              ) : (
                <>
                  <StaggerContainer className="space-y-2" staggerDelay={0.05}>
                    {completedPagination.items.map((task: Task) => (
                      <StaggerItem key={task.id}>
                        <TaskItem 
                          task={task}
                          onRestore={() => handleRestore(task)}
                          onDelete={() => handleDelete(task.id)}
                          isCompleted
                        />
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
                  {completedTasksList.length > completedPagination.pageSize && (
                    <div className="mt-6">
                      <Pagination
                        page={completedPagination.page}
                        pageSize={completedPagination.pageSize}
                        total={completedPagination.total}
                        totalPages={completedPagination.totalPages}
                        hasMore={completedPagination.hasMore}
                        onPageChange={completedPagination.goToPage}
                        onPageSizeChange={completedPagination.changePageSize}
                      />
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </FadeIn>
      </div>
    </AppShell>
  )
}

function TaskItem({ 
  task, 
  onComplete, 
  onDelete,
  onRestore,
  isCompleted = false
}: { 
  task: Task
  onComplete?: () => void
  onDelete: () => void
  onRestore?: () => void
  isCompleted?: boolean
}) {
  const priority = PRIORITIES.find(p => p.value === task.priority)
  const energyType = ENERGY_TYPES.find(e => e.value === task.energyType)

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
      isCompleted ? 'bg-muted/50 opacity-70' : 'hover:border-primary/50 bg-card'
    }`}>
      {isCompleted ? (
        <Button variant="ghost" size="icon" className="size-8 shrink-0" onClick={onRestore}>
          <RotateCcw className="size-4" />
        </Button>
      ) : (
        <Checkbox 
          checked={false}
          onCheckedChange={onComplete}
          className="size-5 shrink-0"
        />
      )}
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`font-medium ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
            {task.title}
          </span>
          {!isCompleted && priority && (
            <Badge className={`text-xs ${priority.color}`}>
              {priority.label}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
          {task.description && <span className="truncate max-w-xs">{task.description}</span>}
          {energyType && (
            <span className="flex items-center gap-1">
              <energyType.icon className="size-3" style={{ color: energyType.color }} />
              {energyType.label}
            </span>
          )}
          {task.duration && (
            <span className="flex items-center gap-1">
              <Clock className="size-3" />
              {task.duration} мин
            </span>
          )}
          <span>{new Date(task.scheduledDate).toLocaleDateString('ru-RU')}</span>
        </div>
      </div>

      <Button variant="ghost" size="icon" className="size-8 shrink-0 text-destructive" onClick={onDelete}>
        <Trash2 className="size-4" />
      </Button>
    </div>
  )
}

function EmptyTasksState({ onCreate }: { onCreate: () => void }) {
  return (
    <Card className="p-12 text-center">
      <CheckSquare className="size-12 mx-auto mb-4 text-muted-foreground/50" />
      <h3 className="text-lg font-medium mb-2">Нет задач на сегодня</h3>
      <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
        Создайте задачи для продуктивного дня
      </p>
      <Button onClick={onCreate}>
        <Plus className="mr-2 size-4" />
        Добавить задачу
      </Button>
    </Card>
  )
}
