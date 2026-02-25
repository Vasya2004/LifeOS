"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth/context"
import { useCreateArea } from "@/hooks/modules/use-areas"
import { useCreateGoal } from "@/hooks/modules/use-goals"
import { cn } from "@/lib/utils"
import { CheckCircle2, ArrowRight, ChevronRight } from "lucide-react"

const PRESET_AREAS = [
  { name: "Здоровье", icon: "❤️", color: "#ef4444" },
  { name: "Карьера", icon: "💼", color: "#3b82f6" },
  { name: "Финансы", icon: "💰", color: "#f59e0b" },
  { name: "Отношения", icon: "👥", color: "#ec4899" },
  { name: "Образование", icon: "📚", color: "#8b5cf6" },
  { name: "Хобби", icon: "🎨", color: "#06b6d4" },
  { name: "Духовность", icon: "✨", color: "#10b981" },
  { name: "Спорт", icon: "🏋️", color: "#f97316" },
]

interface OnboardingWizardProps {
  onComplete: () => void
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const { user, updateProfile, completeOnboarding } = useAuth()
  const createArea = useCreateArea()
  const createGoal = useCreateGoal()

  const [step, setStep] = useState(2)
  const [selectedAreas, setSelectedAreas] = useState<string[]>([])
  const [goalTitle, setGoalTitle] = useState("")
  const [goalAreaId, setGoalAreaId] = useState("")
  const [isWorking, setIsWorking] = useState(false)
  const [createdAreas, setCreatedAreas] = useState<{ id: string; name: string }[]>([])

  const toggleArea = (areaName: string) => {
    setSelectedAreas(prev =>
      prev.includes(areaName) ? prev.filter(a => a !== areaName) : [...prev, areaName]
    )
  }

  const handleStep2Next = async () => {
    if (selectedAreas.length === 0) {
      setStep(3)
      return
    }
    setIsWorking(true)
    const created: { id: string; name: string }[] = []
    for (const areaName of selectedAreas) {
      const preset = PRESET_AREAS.find(p => p.name === areaName)!
      const newArea = await createArea({
        name: areaName,
        icon: preset.icon,
        color: preset.color,
        vision: "",
        currentLevel: 1,
        targetLevel: 5,
        isActive: true,
      })
      created.push({ id: newArea.id, name: newArea.name })
    }
    setCreatedAreas(created)
    if (created.length > 0) setGoalAreaId(created[0].id)
    setIsWorking(false)
    setStep(3)
  }

  const handleStep3Next = async () => {
    if (goalTitle.trim()) {
      setIsWorking(true)
      try {
        await createGoal({
          title: goalTitle.trim(),
          description: "",
          areaId: goalAreaId || "",
          type: "outcome",
          status: "active",
          priority: 3,
          targetDate: "",
          startedAt: new Date().toISOString(),
          progress: 0,
          milestones: [],
          relatedValues: [],
          relatedRoles: [],
        })
      } catch {
        // non-blocking
      } finally {
        setIsWorking(false)
      }
    }
    finish()
  }

  const finish = async () => {
    localStorage.setItem("lifeos_onboarding_done", "true")
    if (user && !user.isGuest) {
      await completeOnboarding()
    }
    onComplete()
  }

  return (
    <Dialog open onOpenChange={() => { }}>
      <DialogContent
        className="max-w-lg p-0 overflow-hidden"
        showCloseButton={false}
        onInteractOutside={e => e.preventDefault()}
        onEscapeKeyDown={e => e.preventDefault()}
      >
        <DialogTitle className="sr-only">Онбординг</DialogTitle>

        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${((step - 1) / 2) * 100}%` }}
          />
        </div>

        <div className="p-6">

          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">Какие сферы жизни важны для вас?</h2>
                <p className="text-sm text-muted-foreground">Выберите хотя бы одну сферу для отслеживания</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {PRESET_AREAS.map(area => {
                  const isSelected = selectedAreas.includes(area.name)
                  return (
                    <button
                      key={area.name}
                      onClick={() => toggleArea(area.name)}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg border p-3 text-left text-sm font-medium transition-all",
                        isSelected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      )}
                    >
                      <span className="text-lg leading-none">{area.icon}</span>
                      <span>{area.name}</span>
                      {isSelected && <CheckCircle2 className="ml-auto size-4 shrink-0" />}
                    </button>
                  )
                })}
              </div>

              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">Шаг 1 из 2</p>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setStep(3)}>
                    Пропустить
                  </Button>
                  <Button onClick={handleStep2Next} disabled={isWorking}>
                    {selectedAreas.length > 0
                      ? `Создать (${selectedAreas.length})`
                      : "Далее"}
                    <ArrowRight className="ml-2 size-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">Добавьте первую цель</h2>
                <p className="text-sm text-muted-foreground">Начните с малого — одна конкретная цель</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="goal-title">Название цели</Label>
                  <Input
                    id="goal-title"
                    placeholder="Например: Прочитать 12 книг за год"
                    value={goalTitle}
                    onChange={e => setGoalTitle(e.target.value)}
                    autoFocus
                  />
                </div>

                {createdAreas.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="goal-area">Сфера жизни</Label>
                    <select
                      id="goal-area"
                      value={goalAreaId}
                      onChange={e => setGoalAreaId(e.target.value)}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="">— без сферы —</option>
                      {createdAreas.map(a => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">Шаг 2 из 2</p>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={finish}>
                    Пропустить
                  </Button>
                  <Button onClick={handleStep3Next} disabled={!goalTitle.trim() || isWorking}>
                    Создать цель
                    <ChevronRight className="ml-2 size-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
