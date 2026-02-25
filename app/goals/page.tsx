"use client"

import { AppShell } from "@/components/app-shell"
import { useGoals, useAreas } from "@/hooks/use-data"
import { addGoal, updateGoal, deleteGoal, getLevelName } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations"
import { TextField, TextareaField, SelectField, FormError, SubmitButton } from "@/components/form-field"
import { createGoalSchema, type CreateGoalInput } from "@/lib/validation"
import { useValidatedForm } from "@/hooks/use-validated-form"
import { 
  Target, 
  Plus, 
  Calendar,
  TrendingUp,
  CheckCircle2,
  PauseCircle,
  XCircle,
  MoreHorizontal,
  Trash2,
  Edit3,
  Flag,
  Loader2
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import type { Goal, LifeArea } from "@/lib/types"

const GOAL_TYPES = [
  { value: "outcome", label: "Результат", icon: Flag },
  { value: "process", label: "Процесс", icon: TrendingUp },
]

const PRIORITIES = [
  { value: "5", label: "Критично", color: "destructive" },
  { value: "4", label: "Высокий", color: "warning" },
  { value: "3", label: "Средний", color: "default" },
  { value: "2", label: "Низкий", color: "secondary" },
  { value: "1", label: "Минимальный", color: "outline" },
]

export default function GoalsPage() {
  const { data: goals, mutate } = useGoals()
  const { data: areas } = useAreas()
  
  const [isOpen, setIsOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)

  const defaultValues = {
    title: "",
    description: "",
    areaId: "",
    type: "outcome" as const,
    priority: 3 as const,
    targetDate: "",
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
  } = useValidatedForm<CreateGoalInput>({
    schema: createGoalSchema,
    defaultValues,
    onSubmit: async (data) => {
      if (editingGoal) {
        updateGoal(editingGoal.id, { 
          ...data, 
          priority: data.priority as 1 | 2 | 3 | 4 | 5,
          startedAt: editingGoal.startedAt 
        })
        toast.success("Цель обновлена!")
      } else {
        addGoal({
          ...data,
          priority: data.priority as 1 | 2 | 3 | 4 | 5,
          startedAt: new Date().toISOString(),
          status: "active",
          progress: 0,
          milestones: [],
          relatedValues: [],
          relatedRoles: [],
        })
        toast.success("Цель создана!")
      }
      mutate()
      setIsOpen(false)
      setEditingGoal(null)
      resetForm()
    },
  })

  const areaId = watch("areaId")
  const type = watch("type")
  const priority = watch("priority")

  const activeGoals = goals?.filter((g: Goal) => g.status === "active") || []
  const completedGoals = goals?.filter((g: Goal) => g.status === "completed") || []
  const pausedGoals = goals?.filter((g: Goal) => g.status === "paused") || []

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal)
    reset({
      title: goal.title,
      description: goal.description,
      areaId: goal.areaId,
      type: goal.type,
      priority: goal.priority,
      targetDate: goal.targetDate,
    })
    setIsOpen(true)
  }

  const handleClose = () => {
    setIsOpen(false)
    setEditingGoal(null)
    resetForm()
  }

  const handleDelete = (id: string) => {
    if (confirm("Удалить цель?")) {
      deleteGoal(id)
      toast.success("Цель удалена")
      mutate()
    }
  }

  const handleStatusChange = (goal: Goal, newStatus: Goal["status"]) => {
    updateGoal(goal.id, { status: newStatus })
    mutate()
    toast.success(`Статус изменен на "${newStatus}"`)
  }

  const getAreaColor = (areaId: string) => {
    return areas?.find((a: LifeArea) => a.id === areaId)?.color || "#6366f1"
  }

  const getAreaName = (areaId: string) => {
    return areas?.find((a: LifeArea) => a.id === areaId)?.name || "Без сферы"
  }

  const areaOptions = areas?.map((area: LifeArea) => ({
    value: area.id,
    label: area.name,
    color: area.color,
  })) || []

  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
        {/* Header */}
        <FadeIn>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Цели</h1>
              <p className="text-sm text-muted-foreground">
                {activeGoals.length} активных • {completedGoals.length} выполнено
              </p>
            </div>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingGoal(null); resetForm(); }}>
                  <Plus className="mr-2 size-4" />
                  Новая цель
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>{editingGoal ? "Редактировать цель" : "Новая цель"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleFormSubmit} className="space-y-4 pt-4">
                  <FormError error={submitError} />
                  
                  <TextField
                    label="Название цели"
                    name="title"
                    register={register}
                    error={errors.title?.message}
                    placeholder="например, Пробежать марафон"
                    required
                  />
                  
                  <TextareaField
                    label="Описание"
                    name="description"
                    register={register}
                    error={errors.description?.message}
                    placeholder="Подробное описание цели..."
                    rows={3}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <SelectField
                      label="Сфера жизни"
                      name="areaId"
                      value={areaId}
                      onValueChange={(v) => setValue("areaId", v, { shouldValidate: true })}
                      options={areaOptions}
                      error={errors.areaId?.message}
                      placeholder="Выберите сферу"
                      required
                    />

                    <SelectField
                      label="Тип цели"
                      name="type"
                      value={type}
                      onValueChange={(v) => setValue("type", v as "outcome" | "process", { shouldValidate: true })}
                      options={GOAL_TYPES.map(t => ({ value: t.value, label: t.label }))}
                      error={errors.type?.message}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <SelectField
                      label="Приоритет"
                      name="priority"
                      value={priority.toString()}
                      onValueChange={(v) => setValue("priority", parseInt(v) as 1|2|3|4|5, { shouldValidate: true })}
                      options={PRIORITIES.map(p => ({ value: p.value, label: p.label }))}
                      error={errors.priority?.message}
                    />

                    <TextField
                      label="Дедлайн"
                      name="targetDate"
                      register={register}
                      error={errors.targetDate?.message}
                      type="date"
                      required
                    />
                  </div>

                  <SubmitButton isSubmitting={isSubmitting} className="w-full">
                    {editingGoal ? "Сохранить изменения" : "Создать цель"}
                  </SubmitButton>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </FadeIn>

        {/* Goals Tabs */}
        <FadeIn delay={0.1}>
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="active">
                Активные ({activeGoals.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Выполнено ({completedGoals.length})
              </TabsTrigger>
              <TabsTrigger value="paused">
                Приостановлено ({pausedGoals.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="mt-6">
              {activeGoals.length === 0 ? (
                <EmptyGoalsState onCreate={() => setIsOpen(true)} />
              ) : (
                <StaggerContainer className="grid md:grid-cols-2 gap-4" staggerDelay={0.1}>
                  {activeGoals.map((goal: Goal) => (
                    <StaggerItem key={goal.id}>
                      <GoalCard 
                        goal={goal}
                        areaColor={getAreaColor(goal.areaId)}
                        areaName={getAreaName(goal.areaId)}
                        onEdit={() => handleEdit(goal)}
                        onDelete={() => handleDelete(goal.id)}
                        onStatusChange={(status) => handleStatusChange(goal, status)}
                      />
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              )}
            </TabsContent>

            <TabsContent value="completed" className="mt-6">
              {completedGoals.length === 0 ? (
                <p className="text-center text-muted-foreground py-12">
                  Пока нет выполненных целей. Вперед к победам!
                </p>
              ) : (
                <StaggerContainer className="grid md:grid-cols-2 gap-4" staggerDelay={0.1}>
                  {completedGoals.map((goal: Goal) => (
                    <StaggerItem key={goal.id}>
                      <GoalCard 
                        goal={goal}
                        areaColor={getAreaColor(goal.areaId)}
                        areaName={getAreaName(goal.areaId)}
                        onEdit={() => handleEdit(goal)}
                        onDelete={() => handleDelete(goal.id)}
                        onStatusChange={(status) => handleStatusChange(goal, status)}
                      />
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              )}
            </TabsContent>

            <TabsContent value="paused" className="mt-6">
              {pausedGoals.length === 0 ? (
                <p className="text-center text-muted-foreground py-12">
                  Нет приостановленных целей
                </p>
              ) : (
                <StaggerContainer className="grid md:grid-cols-2 gap-4" staggerDelay={0.1}>
                  {pausedGoals.map((goal: Goal) => (
                    <StaggerItem key={goal.id}>
                      <GoalCard 
                        goal={goal}
                        areaColor={getAreaColor(goal.areaId)}
                        areaName={getAreaName(goal.areaId)}
                        onEdit={() => handleEdit(goal)}
                        onDelete={() => handleDelete(goal.id)}
                        onStatusChange={(status) => handleStatusChange(goal, status)}
                      />
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              )}
            </TabsContent>
          </Tabs>
        </FadeIn>
      </div>
    </AppShell>
  )
}

function GoalCard({ 
  goal, 
  areaColor, 
  areaName,
  onEdit,
  onDelete,
  onStatusChange,
}: { 
  goal: Goal
  areaColor: string
  areaName: string
  onEdit: () => void
  onDelete: () => void
  onStatusChange: (status: Goal["status"]) => void
}) {
  const daysLeft = Math.ceil(
    (new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  )

  const getStatusIcon = () => {
    switch (goal.status) {
      case "completed": return <CheckCircle2 className="size-4 text-success" />
      case "paused": return <PauseCircle className="size-4 text-warning" />
      default: return <Target className="size-4 text-primary" />
    }
  }

  return (
    <Card className="overflow-hidden group">
      <div className="h-1.5" style={{ backgroundColor: areaColor }} />
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {getStatusIcon()}
              <Badge variant="outline" className="text-xs">
                {areaName}
              </Badge>
              {goal.priority >= 4 && (
                <Badge variant="destructive" className="text-xs">Важно</Badge>
              )}
            </div>
            <h3 className="font-semibold text-lg truncate">{goal.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {goal.description || "Нет описания"}
            </p>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="size-8" onClick={onEdit}>
              <Edit3 className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" className="size-8 text-destructive" onClick={onDelete}>
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Прогресс</span>
            <span className="font-medium">{goal.progress}%</span>
          </div>
          <Progress value={goal.progress} className="h-2" />
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="size-3.5" />
              {daysLeft > 0 ? (
                <span>{daysLeft} дн. до дедлайна</span>
              ) : daysLeft === 0 ? (
                <span className="text-warning">Сегодня дедлайн</span>
              ) : (
                <span className="text-destructive">Просрочено на {Math.abs(daysLeft)} дн.</span>
              )}
            </div>
            {goal.milestones.length > 0 && (
              <span>{goal.milestones.filter(m => m.isCompleted).length}/{goal.milestones.length} вех</span>
            )}
          </div>
        </div>

        {goal.status === "active" && (
          <div className="flex gap-2 mt-4 pt-3 border-t">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => onStatusChange("completed")}
            >
              <CheckCircle2 className="mr-1 size-4" />
              Завершить
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onStatusChange("paused")}
            >
              <PauseCircle className="size-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function EmptyGoalsState({ onCreate }: { onCreate: () => void }) {
  return (
    <Card className="p-12 text-center">
      <Target className="size-12 mx-auto mb-4 text-muted-foreground/50" />
      <h3 className="text-lg font-medium mb-2">Нет активных целей</h3>
      <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
        Создайте свою первую цель, чтобы начать путь к достижению мечты
      </p>
      <Button onClick={onCreate}>
        <Plus className="mr-2 size-4" />
        Создать цель
      </Button>
    </Card>
  )
}
