"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/context"
import { useCreateArea } from "@/hooks/modules/use-areas"
import { useCreateGoal } from "@/hooks/modules/use-goals"
import { useCreateTask } from "@/hooks/modules/use-tasks"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react"

// ─── Data ──────────────────────────────────────────────────────────────────────

const TOTAL_STEPS = 4

const PRESET_AREAS = [
  {
    name: "Здоровье",    icon: "❤️",  color: "#ef4444",
    goalExample: "Похудеть на 5 кг за 3 месяца",
    tasks: ["Сделать зарядку сегодня", "Записаться в спортзал", "Выпить 2л воды"],
  },
  {
    name: "Карьера",     icon: "💼",  color: "#8b5cf6",
    goalExample: "Получить повышение до конца года",
    tasks: ["Составить план на неделю", "Обновить резюме", "Прочитать профильную статью"],
  },
  {
    name: "Финансы",     icon: "💰",  color: "#f59e0b",
    goalExample: "Накопить 100 000 ₽ за 6 месяцев",
    tasks: ["Записать все расходы за день", "Составить бюджет на месяц", "Отложить 10% дохода"],
  },
  {
    name: "Отношения",   icon: "👥",  color: "#ec4899",
    goalExample: "Проводить больше времени с близкими",
    tasks: ["Позвонить другу или родителям", "Запланировать совместный ужин", "Написать слова благодарности"],
  },
  {
    name: "Образование", icon: "📚",  color: "#8b5cf6",
    goalExample: "Прочитать 12 книг за год",
    tasks: ["Прочитать 10 страниц сегодня", "Пройти один урок онлайн-курса", "Повторить конспекты"],
  },
  {
    name: "Хобби",       icon: "🎨",  color: "#06b6d4",
    goalExample: "Освоить новый навык за 30 дней",
    tasks: ["30 минут на хобби сегодня", "Найти вдохновляющий пример", "Записаться на курс"],
  },
  {
    name: "Духовность",  icon: "✨",  color: "#10b981",
    goalExample: "Ввести ежедневную медитацию в привычку",
    tasks: ["5 минут медитации утром", "Написать в дневник благодарности", "Час без телефона"],
  },
  {
    name: "Спорт",       icon: "🏋️", color: "#f97316",
    goalExample: "Пробежать 5 км без остановки",
    tasks: ["Тренировка 30 минут", "Разминка и растяжка", "Отслеживать прогресс в беге"],
  },
]

// ─── Sub-components ────────────────────────────────────────────────────────────

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-[5px] pb-7">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={cn(
            "h-[3px] rounded-full transition-all duration-300",
            i === current - 1
              ? "w-8 bg-emerald-500"
              : i < current - 1
              ? "w-5 bg-emerald-500/35"
              : "w-5 bg-white/15"
          )}
        />
      ))}
    </div>
  )
}

function ScreenIcon({ emoji }: { emoji: string }) {
  return (
    <div className="flex justify-center mb-5">
      <div className="size-[72px] rounded-[20px] bg-[#22222e] border border-white/[0.10] shadow-2xl flex items-center justify-center">
        <span className="text-[38px] leading-none select-none">{emoji}</span>
      </div>
    </div>
  )
}

function ScreenTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="text-center mb-6 space-y-2">
      <h2 className="text-xl font-bold text-white leading-snug">{title}</h2>
      <p className="text-sm text-white/45 leading-relaxed max-w-[280px] mx-auto">{subtitle}</p>
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

interface OnboardingWizardProps {
  onComplete: () => void
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const router = useRouter()
  const { user, completeOnboarding } = useAuth()
  const createArea = useCreateArea()
  const createGoal = useCreateGoal()
  const createTask = useCreateTask()

  const [step, setStep] = useState(1)
  const [selectedArea, setSelectedArea] = useState<typeof PRESET_AREAS[0] | null>(null)
  const [goalTitle, setGoalTitle] = useState("")
  const [selectedTask, setSelectedTask] = useState<string | null>(null)
  const [isWorking, setIsWorking] = useState(false)

  const next = () => setStep(s => Math.min(s + 1, TOTAL_STEPS))

  const handleAreaSelect = (area: typeof PRESET_AREAS[0]) => {
    setSelectedArea(area)
    setGoalTitle(area.goalExample)
    next()
  }

  const handleGoalTaskNext = async () => {
    if (isWorking) return
    setIsWorking(true)
    try {
      // 1. Create selected area
      let areaId = ""
      if (selectedArea) {
        const newArea = await createArea({
          name: selectedArea.name,
          icon: selectedArea.icon,
          color: selectedArea.color,
          vision: "",
          currentLevel: 1,
          targetLevel: 5,
          isActive: true,
        })
        areaId = newArea.id
      }

      // 2. Create goal if filled
      if (goalTitle.trim()) {
        await createGoal({
          title: goalTitle.trim(),
          description: "",
          areaId,
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
      }

      // 3. Create first task if selected
      if (selectedTask) {
        const today = new Date().toISOString().split("T")[0]
        await createTask({
          title: selectedTask,
          status: "todo",
          priority: "high",
          energyCost: "medium",
          energyType: "mental",
          scheduledDate: today,
        })
      }
    } catch {
      // non-blocking
    } finally {
      setIsWorking(false)
    }
    next()
  }

  const finish = async () => {
    localStorage.setItem("lifeos_onboarding_done", "true")
    if (user && !user.isGuest) {
      await completeOnboarding()
    }
    onComplete()
    router.push("/")
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md">
      <div className="w-full max-w-[420px] relative">

        {/* Top edge glow */}
        <div className="absolute -top-px left-1/2 -translate-x-1/2 w-52 h-px bg-gradient-to-r from-transparent via-emerald-500/65 to-transparent rounded-full pointer-events-none" />

        {/* Card */}
        <div
          className="rounded-[28px] border border-white/[0.13] overflow-hidden shadow-2xl relative"
          style={{ backgroundColor: "#0e0e14" }}
        >
          {/* Dot pattern overlay */}
          <div
            className="absolute inset-0 pointer-events-none z-0"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px)",
              backgroundSize: "22px 22px",
            }}
          />
          <div className="relative z-10 px-6 pt-7 pb-6">

            <ProgressDots current={step} total={TOTAL_STEPS} />

            {/* ── STEP 1: Welcome ─────────────────────────────────── */}
            {step === 1 && (
              <>
                <ScreenIcon emoji="🎮" />
                <ScreenTitle
                  title="Добро пожаловать в LifeOS"
                  subtitle="Твоя жизнь — это RPG. Выполняй задачи, прокачивай навыки и зарабатывай награды"
                />
                <div className="space-y-2.5 mb-2">
                  {[
                    { icon: "🎯", label: "Цели и задачи", desc: "Ставь цели и выполняй их шаг за шагом" },
                    { icon: "🔥", label: "Привычки и стрики", desc: "Строй системы и поддерживай серии" },
                    { icon: "⚡", label: "XP и уровни", desc: "Прокачивай персонажа за реальные дела" },
                  ].map(item => (
                    <div
                      key={item.label}
                      className="flex items-center gap-3 px-3 py-3 rounded-2xl border border-white/[0.09]"
                      style={{ backgroundColor: "#1b1b26" }}
                    >
                      <div className="size-10 rounded-xl bg-emerald-700/70 flex items-center justify-center text-[18px] leading-none shrink-0">
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white text-[13px] leading-tight">{item.label}</p>
                        <p className="text-[11px] text-white/40 mt-[2px]">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={next}
                  className="mt-5 w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  Начать путь
                  <ArrowRight className="size-4" />
                </button>
              </>
            )}

            {/* ── STEP 2: Choose main area ─────────────────────────── */}
            {step === 2 && (
              <>
                <ScreenIcon emoji="🌍" />
                <ScreenTitle
                  title="Главная сфера жизни"
                  subtitle="Выбери, что сейчас важнее всего — система подстроит рекомендации"
                />
                <div className="grid grid-cols-2 gap-2">
                  {PRESET_AREAS.map(area => (
                    <button
                      key={area.name}
                      onClick={() => handleAreaSelect(area)}
                      className="flex items-center gap-2.5 px-3 py-3 rounded-xl border border-white/[0.09] text-left text-[13px] font-medium hover:border-white/[0.25] transition-all active:scale-[0.98]"
                      style={{ backgroundColor: "#1b1b26" }}
                      onMouseEnter={e => {
                        e.currentTarget.style.backgroundColor = "#222232"
                        e.currentTarget.style.borderColor = `${area.color}50`
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.backgroundColor = "#1b1b26"
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)"
                      }}
                    >
                      <span className="text-base leading-none">{area.icon}</span>
                      <span className="flex-1 truncate text-white/80">{area.name}</span>
                      <ArrowRight className="size-3 text-white/30 shrink-0" />
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* ── STEP 3: First goal + first task ──────────────────── */}
            {step === 3 && selectedArea && (
              <>
                <div className="flex justify-center mb-5">
                  <div
                    className="size-[72px] rounded-[20px] border border-white/[0.10] shadow-2xl flex items-center justify-center"
                    style={{ backgroundColor: `${selectedArea.color}20`, borderColor: `${selectedArea.color}40` }}
                  >
                    <span className="text-[38px] leading-none select-none">{selectedArea.icon}</span>
                  </div>
                </div>

                {/* Goal */}
                <div className="mb-5">
                  <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-2 px-1">
                    Первая цель
                  </p>
                  <Input
                    value={goalTitle}
                    onChange={e => setGoalTitle(e.target.value)}
                    placeholder={`Например: ${selectedArea.goalExample}`}
                    className="border-white/[0.10] focus:border-emerald-500/60 text-white placeholder:text-white/25 rounded-xl h-11 text-sm"
                    style={{ backgroundColor: "#1b1b26" }}
                    autoFocus
                    onKeyDown={e => {
                      if (e.key === "Enter" && !isWorking) handleGoalTaskNext()
                    }}
                  />
                </div>

                {/* Task templates */}
                <div className="mb-5">
                  <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-2 px-1">
                    Первый квест — выбери шаблон
                  </p>
                  <div className="space-y-2">
                    {selectedArea.tasks.map(task => {
                      const sel = selectedTask === task
                      return (
                        <button
                          key={task}
                          onClick={() => setSelectedTask(sel ? null : task)}
                          className={cn(
                            "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl border text-left text-[13px] transition-all",
                            sel
                              ? "border-emerald-500/50 text-white"
                              : "border-white/[0.09] text-white/65 hover:border-white/[0.18]"
                          )}
                          style={{ backgroundColor: sel ? "rgba(16,185,129,0.10)" : "#1b1b26" }}
                        >
                          <div
                            className={cn(
                              "size-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors",
                              sel ? "border-emerald-500 bg-emerald-500" : "border-white/20"
                            )}
                          >
                            {sel && <CheckCircle2 className="size-3 text-white" />}
                          </div>
                          <span className="flex-1">{task}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <button
                  onClick={handleGoalTaskNext}
                  disabled={isWorking}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-[13px] transition-colors flex items-center justify-center gap-2"
                >
                  {isWorking ? "Создаём..." : "Продолжить"}
                  {!isWorking && <ArrowRight className="size-4" />}
                </button>
                <div className="mt-3 text-center">
                  <button
                    onClick={() => { setGoalTitle(""); setSelectedTask(null); handleGoalTaskNext() }}
                    className="text-[12px] text-white/30 hover:text-white/50 transition-colors"
                  >
                    Пропустить этот шаг
                  </button>
                </div>
              </>
            )}

            {/* ── STEP 4: Complete ─────────────────────────────────── */}
            {step === 4 && (
              <>
                <ScreenIcon emoji="🏆" />
                <ScreenTitle
                  title="Персонаж создан!"
                  subtitle="Ты начинаешь на 1-м уровне. Выполняй задачи, прокачивай навыки и получай XP"
                />
                <div className="grid grid-cols-3 gap-2 mb-5">
                  {[
                    { icon: "⚡", label: "Уровень", value: "1" },
                    { icon: "✨", label: "XP", value: "0" },
                    { icon: "🪙", label: "Монеты", value: "100" },
                  ].map(stat => (
                    <div
                      key={stat.label}
                      className="flex flex-col items-center py-3.5 rounded-2xl border border-white/[0.09]"
                      style={{ backgroundColor: "#1b1b26" }}
                    >
                      <span className="text-[22px] leading-none mb-1.5">{stat.icon}</span>
                      <span className="text-[17px] font-bold text-white leading-none">{stat.value}</span>
                      <span className="text-[10px] text-white/35 mt-1">{stat.label}</span>
                    </div>
                  ))}
                </div>
                {selectedTask && (
                  <div
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-emerald-500/25 mb-4"
                    style={{ backgroundColor: "rgba(16,185,129,0.08)" }}
                  >
                    <span className="text-base leading-none">⚔️</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-emerald-400/70 font-medium">Первый квест создан</p>
                      <p className="text-[12px] text-white/70 truncate">{selectedTask}</p>
                    </div>
                  </div>
                )}
                <button
                  onClick={finish}
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Sparkles className="size-4" />
                  Начать игру
                </button>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
