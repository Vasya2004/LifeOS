"use client"

import { AppShell } from "@/components/app-shell"
import { useAreas, useIdentity, useValues, useCreateArea, useCreateValue } from "@/hooks"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { FadeIn } from "@/components/animations"
import { TextField, TextareaField, FormError, SubmitButton } from "@/components/form-field"
import { lifeAreaSchema } from "@/lib/validation"
import { useValidatedForm } from "@/hooks/use-validated-form"
import { Compass, Plus, Target, Heart } from "lucide-react"
import type { LifeArea, CoreValue } from "@/lib/types"
import { useState } from "react"
import { toast } from "sonner"
import { z } from "zod"

const AREA_COLORS = [
  "#22c55e", // green
  "#3b82f6", // blue
  "#eab308", // yellow
  "#ec4899", // pink
  "#8b5cf6", // purple
  "#f97316", // orange
  "#14b8a6", // teal
  "#6366f1", // indigo
]

const createAreaSchema = z.object({
  name: z.string().min(1, "Название обязательно").max(100, "Максимум 100 символов"),
  vision: z.string().max(500, "Максимум 500 символов").optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Выберите цвет"),
})

type CreateAreaInput = z.infer<typeof createAreaSchema>

export default function AreasPage() {
  const { data: areas, mutate } = useAreas()
  const { data: identity } = useIdentity()
  const { data: values } = useValues()

  const createArea = useCreateArea()
  const createValue = useCreateValue()

  const [isOpen, setIsOpen] = useState(false)

  const defaultValues = {
    name: "",
    vision: "",
    color: AREA_COLORS[0],
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
  } = useValidatedForm<CreateAreaInput>({
    schema: createAreaSchema,
    defaultValues,
    onSubmit: async (data) => {
      await createArea({
        name: data.name,
        vision: data.vision || "",
        color: data.color as string,
        icon: "circle",
        currentLevel: 5,
        targetLevel: 8,
        isActive: true,
      })

      toast.success("Сфера жизни создана!")
      mutate()
      setIsOpen(false)
      resetForm()
    },
  })

  const color = watch("color")

  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8 max-w-4xl">
        {/* Header */}
        <FadeIn>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Сферы жизни</h1>
              <p className="text-sm text-muted-foreground">
                Определите ключевые сферы вашей жизни
              </p>
            </div>
            <Button onClick={() => { resetForm(); setIsOpen(true); }}>
              <Plus className="mr-2 size-4" />
              Добавить
            </Button>
          </div>
        </FadeIn>

        {/* Create Dialog */}
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-background rounded-lg shadow-lg max-w-md w-full">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Новая сфера жизни</h2>
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <FormError error={submitError} />

                  <TextField
                    label="Название"
                    name="name"
                    register={register}
                    error={errors.name?.message}
                    placeholder="например, Здоровье, Карьера, Отношения"
                    required
                  />

                  <TextareaField
                    label="Видение"
                    name="vision"
                    register={register}
                    error={errors.vision?.message}
                    placeholder="Как вы хотите видеть эту сферу своей жизни?"
                    rows={3}
                  />

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Цвет</label>
                    <div className="flex flex-wrap gap-2">
                      {AREA_COLORS.map((c: string) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setValue("color", c, { shouldValidate: true })}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${color === c ? "border-white scale-110 ring-2 ring-primary" : "border-transparent"
                            }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                    {errors.color && (
                      <p className="text-xs text-destructive">{errors.color.message}</p>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setIsOpen(false)}>
                      Отмена
                    </Button>
                    <SubmitButton isSubmitting={isSubmitting} className="flex-1">
                      Создать
                    </SubmitButton>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Identity Card */}
        <FadeIn delay={0.1}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="size-5 text-primary" />
                Ваше видение
              </CardTitle>
            </CardHeader>
            <CardContent>
              {identity?.vision ? (
                <p className="text-muted-foreground">{identity.vision}</p>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-2">Видение ещё не определено</p>
                  <Button variant="outline" size="sm">
                    Определить видение
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </FadeIn>

        {/* Areas Grid */}
        <FadeIn delay={0.2}>
          <div className="grid md:grid-cols-2 gap-4">
            {areas?.map((area: LifeArea) => (
              <Card key={area.id} className="overflow-hidden">
                <div
                  className="h-2"
                  style={{ backgroundColor: area.color }}
                />
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{area.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {area.vision || "No vision defined"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Current Level</span>
                      <span className="font-medium">{area.currentLevel}/10</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${area.currentLevel * 10}%`,
                          backgroundColor: area.color
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </FadeIn>

        {(!areas || areas.length === 0) && (
          <FadeIn delay={0.3}>
            <Card className="p-8 text-center">
              <Compass className="size-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground mb-2">Сферы жизни не созданы</p>
              <p className="text-sm text-muted-foreground/70 mb-4">
                Начните с определения ключевых сфер вашей жизни (Здоровье, Карьера, Отношения и т.д.)
              </p>
              <Button onClick={() => setIsOpen(true)}>
                <Plus className="mr-2 size-4" />
                Создать первую сферу
              </Button>
            </Card>
          </FadeIn>
        )}

        {/* Values Section */}
        <FadeIn delay={0.3}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="size-5 text-chart-5" />
                  Ценности
                </CardTitle>
                <CardDescription>Что для вас важнее всего</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Plus className="mr-2 size-4" />
                Добавить
              </Button>
            </CardHeader>
            <CardContent>
              {values && values.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {values.map((value: CoreValue) => (
                    <div
                      key={value.id}
                      className="px-3 py-1.5 rounded-full border text-sm"
                    >
                      {value.name}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Определите свои основные ценности, чтобы они направляли ваши решения
                </p>
              )}
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </AppShell>
  )
}
