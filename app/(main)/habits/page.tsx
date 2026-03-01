"use client"

import { useHabits, useAreas, useStats, useCreateHabit, useToggleHabit, useDeleteHabit } from "@/hooks/use-data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations"
import { TextField, TextareaField, SelectField, NumberField, FormError, SubmitButton } from "@/components/form-field"
import { createHabitSchema, type CreateHabitInput } from "@/lib/validation"
import { useValidatedForm } from "@/hooks/use-validated-form"
import {
  Repeat,
  Plus,
  Flame,
  Trophy,
  TrendingUp,
  Calendar,
  Zap,
  Brain,
  Heart,
  Sparkles,
  Trash2,
  CheckCircle2,
  XCircle
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import type { Habit, LifeArea } from "@/lib/types"

const WEEKDAYS = [
  { value: 1, label: "Пн" },
  { value: 2, label: "Вт" },
  { value: 3, label: "Ср" },
  { value: 4, label: "Чт" },
  { value: 5, label: "Пт" },
  { value: 6, label: "Сб" },
  { value: 0, label: "Вс" },
]

const ENERGY_TYPES = [
  { value: "physical", label: "Физическая", icon: Zap, color: "#22c55e" },
  { value: "mental", label: "Ментальная", icon: Brain, color: "#8b5cf6" },
  { value: "emotional", label: "Эмоциональная", icon: Heart, color: "#ec4899" },
  { value: "creative", label: "Творческая", icon: Sparkles, color: "#8b5cf6" },
]

const FREQUENCIES = [
  { value: "daily", label: "Ежедневно" },
  { value: "weekly", label: "По дням недели" },
]

export default function HabitsPage() {
  const { data: habits } = useHabits()
  const { data: areas } = useAreas()
  const { data: stats } = useStats()
  const createHabit = useCreateHabit()
  const toggleHabit = useToggleHabit()
  const deleteHabitFn = useDeleteHabit()

  const [isOpen, setIsOpen] = useState(false)
  const [targetDays, setTargetDays] = useState<number[]>([1, 2, 3, 4, 5])

  const today = new Date().toISOString().split("T")[0]
  const todayDay = new Date().getDay()

  const defaultValues = {
    areaId: "",
    title: "",
    description: "",
    frequency: "daily" as const,
    targetDays: [0, 1, 2, 3, 4, 5, 6],
    energyImpact: 10,
    energyType: "mental" as const,
    xpReward: 10,
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
  } = useValidatedForm<CreateHabitInput>({
    schema: createHabitSchema,
    defaultValues,
    onSubmit: async (data) => {
      const finalTargetDays = data.frequency === "daily"
        ? [0, 1, 2, 3, 4, 5, 6]
        : targetDays

      createHabit({
        areaId: data.areaId,
        title: data.title,
        description: data.description || "",
        frequency: data.frequency as "daily" | "weekly" | "custom",
        targetDays: finalTargetDays,
        energyImpact: data.energyImpact,
        energyType: data.energyType as "physical" | "mental" | "emotional" | "creative",
        xpReward: data.xpReward,
      })

      toast.success("Привычка создана!")
      setIsOpen(false)
      resetForm()
      setTargetDays([1, 2, 3, 4, 5])
    },
  })

  const areaId = watch("areaId")
  const frequency = watch("frequency")
  const energyType = watch("energyType")
  const xpReward = watch("xpReward")

  const handleToggle = (habit: Habit) => {
    const entry = habit.entries.find(e => e.date === today)
    const newStatus = !(entry?.completed ?? false)

    toggleHabit(habit.id, today, newStatus)

    if (newStatus) {
      toast.success(`+${habit.xpReward || 10} XP за привычку!`, {
        icon: <Trophy className="size-4 text-warning" />
      })
    }
  }

  const handleDelete = (id: string) => {
    if (confirm("Удалить привычку?")) {
      deleteHabitFn(id)
      toast.success("Привычка удалена")
    }
  }

  const toggleTargetDay = (day: number) => {
    if (targetDays.includes(day)) {
      setTargetDays(targetDays.filter(d => d !== day))
    } else {
      setTargetDays([...targetDays, day].sort())
    }
  }

  const getAreaColor = (areaId: string) => {
    return areas?.find((a: LifeArea) => a.id === areaId)?.color || "#6366f1"
  }

  const getAreaName = (areaId: string) => {
    return areas?.find((a: LifeArea) => a.id === areaId)?.name || "Без сферы"
  }

  const getWeekData = (habit: Habit) => {
    const dates: { date: string; day: number; completed: boolean }[] = []
    const today = new Date()

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]
      const entry = habit.entries.find(e => e.date === dateStr)
      dates.push({
        date: dateStr,
        day: date.getDay(),
        completed: entry?.completed || false
      })
    }

    return dates
  }

  const bestStreak = habits?.reduce((max: number, h: Habit) => Math.max(max, h.bestStreak), 0) || 0
  const totalCompletions = habits?.reduce((sum: number, h: Habit) => sum + h.totalCompletions, 0) || 0

  const areaOptions = areas?.map((area: LifeArea) => ({
    value: area.id,
    label: area.name,
    color: area.color,
  })) || []

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Привычки</h1>
            <p className="text-sm text-muted-foreground">
              {habits?.length || 0} активных • лучшая серия: {bestStreak} дней
            </p>
          </div>
          <Button onClick={() => { resetForm(); setIsOpen(true); }}>
            <Plus className="mr-2 size-4" />
            Новая привычка
          </Button>
        </div>
      </FadeIn>

      {/* Create Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-lg shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Новая привычка</h2>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <FormError error={submitError} />

                <TextField
                  label="Название"
                  name="title"
                  register={register}
                  error={errors.title?.message}
                  placeholder="например, Утренняя зарядка"
                  required
                />

                <TextareaField
                  label="Описание"
                  name="description"
                  register={register}
                  error={errors.description?.message}
                  placeholder="Подробнее о привычке..."
                  rows={2}
                />

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

                <div className="grid grid-cols-2 gap-4">
                  <SelectField
                    label="Частота"
                    name="frequency"
                    value={frequency}
                    onValueChange={(v) => setValue("frequency", v as "daily" | "weekly", { shouldValidate: true })}
                    options={FREQUENCIES}
                    error={errors.frequency?.message}
                  />

                  <SelectField
                    label="Тип энергии"
                    name="energyType"
                    value={energyType}
                    onValueChange={(v) => setValue("energyType", v as Habit["energyType"], { shouldValidate: true })}
                    options={ENERGY_TYPES.map(e => ({ value: e.value, label: e.label, color: e.color }))}
                    error={errors.energyType?.message}
                  />
                </div>

                {frequency === "weekly" && (
                  <div className="space-y-2">
                    <Label>Дни недели</Label>
                    <div className="flex gap-1">
                      {WEEKDAYS.map(day => (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => toggleTargetDay(day.value)}
                          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                            targetDays.includes(day.value)
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <NumberField
                  label="Награда XP"
                  name="xpReward"
                  value={xpReward}
                  onChange={(v) => setValue("xpReward", v, { shouldValidate: true })}
                  error={errors.xpReward?.message}
                  min={5}
                  max={100}
                  unit="XP"
                />

                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setIsOpen(false)}>
                    Отмена
                  </Button>
                  <SubmitButton isSubmitting={isSubmitting} className="flex-1">
                    Создать привычку
                  </SubmitButton>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <FadeIn delay={0.1}>
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Flame className="size-5 text-chart-5" />
                <div>
                  <p className="text-2xl font-bold">{stats?.totalHabitCompletions || 0}</p>
                  <p className="text-xs text-muted-foreground">Всего выполнено</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="size-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{bestStreak}</p>
                  <p className="text-xs text-muted-foreground">Лучшая серия</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Trophy className="size-5 text-warning" />
                <div>
                  <p className="text-2xl font-bold">{habits?.length || 0}</p>
                  <p className="text-xs text-muted-foreground">Активных привычек</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </FadeIn>

      {/* Habits List */}
      <FadeIn delay={0.2}>
        {habits?.length === 0 ? (
          <EmptyHabitsState onCreate={() => setIsOpen(true)} />
        ) : (
          <StaggerContainer className="grid md:grid-cols-2 gap-4" staggerDelay={0.1}>
            {habits?.map((habit: Habit) => (
              <StaggerItem key={habit.id}>
                <HabitCard
                  habit={habit}
                  areaColor={getAreaColor(habit.areaId)}
                  areaName={getAreaName(habit.areaId)}
                  weekData={getWeekData(habit)}
                  isTodayTarget={habit.targetDays.includes(todayDay)}
                  onToggle={() => handleToggle(habit)}
                  onDelete={() => handleDelete(habit.id)}
                />
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </FadeIn>
    </div>
  )
}

function HabitCard({
  habit,
  areaColor,
  areaName,
  weekData,
  isTodayTarget,
  onToggle,
  onDelete
}: {
  habit: Habit
  areaColor: string
  areaName: string
  weekData: { date: string; day: number; completed: boolean }[]
  isTodayTarget: boolean
  onToggle: () => void
  onDelete: () => void
}) {
  const todayEntry = habit.entries.find(e => e.date === new Date().toISOString().split("T")[0])
  const isCompletedToday = todayEntry?.completed || false

  return (
    <Card className="overflow-hidden">
      <div className="h-1.5" style={{ backgroundColor: areaColor }} />
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs">
                {areaName}
              </Badge>
              {habit.streak > 0 && (
                <Badge className="text-xs bg-chart-5 text-white">
                  <Flame className="mr-1 size-3" />
                  {habit.streak} дней
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-lg">{habit.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-1">
              {habit.description || "Нет описания"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 shrink-0 text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>

        {/* Week Grid */}
        <div className="flex gap-1 mb-4">
          {weekData.map((day, idx) => (
            <div
              key={idx}
              className={`flex-1 h-8 rounded-md flex items-center justify-center text-xs font-medium ${
                day.completed
                  ? 'bg-success text-success-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
              title={new Date(day.date).toLocaleDateString('ru-RU')}
            >
              {WEEKDAYS.find(w => w.value === day.day)?.label}
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
          <span>Всего: {habit.totalCompletions} раз</span>
          <span>Лучшая серия: {habit.bestStreak}</span>
          <span>+{habit.xpReward} XP</span>
        </div>

        {/* Action Button */}
        {isTodayTarget && (
          <Button
            className="w-full"
            variant={isCompletedToday ? "outline" : "default"}
            onClick={onToggle}
          >
            {isCompletedToday ? (
              <>
                <CheckCircle2 className="mr-2 size-4" />
                Выполнено
              </>
            ) : (
              <>
                <Plus className="mr-2 size-4" />
                Отметить выполнение
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

function EmptyHabitsState({ onCreate }: { onCreate: () => void }) {
  return (
    <Card className="p-12 text-center">
      <Repeat className="size-12 mx-auto mb-4 text-muted-foreground/50" />
      <h3 className="text-lg font-medium mb-2">Нет привычек</h3>
      <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
        Создайте свою первую привычку, чтобы начать вырабатывать полезные рутины
      </p>
      <Button onClick={onCreate}>
        <Plus className="mr-2 size-4" />
        Создать привычку
      </Button>
    </Card>
  )
}

// Label component for form
function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <label className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}>
      {children}
    </label>
  )
}
