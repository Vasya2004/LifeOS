"use client"

import { useState, useEffect } from "react"
import { HeroSection } from "@/components/dashboard/HeroSection"
import { TasksToday } from "@/components/dashboard/TasksToday"
import { BossBattle } from "@/components/dashboard/BossBattle"
import { QuickActions } from "@/components/dashboard/QuickActions"
import { MiniMetrics } from "@/components/dashboard/MiniMetrics"
import { AIAdvisor } from "@/components/dashboard/AIAdvisor"
import { CollapsibleSections } from "@/components/dashboard/CollapsibleSections"
import { DayWidget } from "@/components/dashboard/DayWidget"
import { DailyQuests } from "@/components/gamification/daily-quests"
import { FloatingActions } from "@/components/dashboard/FloatingActions"
import { FadeIn } from "@/components/animations"
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard"
import { GuidedStart } from "@/components/dashboard/GuidedStart"
import { useAuth } from "@/lib/auth/context"
import { useAreas } from "@/hooks/modules/use-areas"
import { useQuests } from "@/hooks"
import { cn } from "@/lib/utils"

// Row 1: Профиль + Календарь (выровнены по высоте)
function ProfileCalendarRow() {
  return (
    <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-[1fr_1fr]">
      <FadeIn className="h-full">
        <div className="h-full">
          <HeroSection />
        </div>
      </FadeIn>
      <FadeIn delay={0.05} className="h-full">
        <div className="h-full">
          <DayWidget />
        </div>
      </FadeIn>
    </div>
  )
}

function useShowOnboarding() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const { data: areas, isLoading: areasLoading } = useAreas()
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (authLoading || !isAuthenticated || user?.isGuest) return
    if (typeof window === "undefined") return

    if (localStorage.getItem("lifeos_onboarding_done")) return

    if (user?.profile?.onboardingCompleted) {
      localStorage.setItem("lifeos_onboarding_done", "true")
      return
    }

    if (!areasLoading && Array.isArray(areas) && areas.length === 0) {
      setShow(true)
    }
  }, [isAuthenticated, user, authLoading, areas, areasLoading])

  return { show, dismiss: () => setShow(false) }
}

// Row 2: Tasks + Daily Quests
function FocusRow() {
  const { quests } = useQuests()
  const hasQuests = Array.isArray(quests) && quests.length > 0

  return (
    <div className={cn(
      "grid grid-cols-1 items-stretch gap-4",
      hasQuests && "lg:grid-cols-[2fr_1fr]"
    )}>
      <TasksToday />
      {hasQuests && (
        <FadeIn delay={0.05} className="h-full">
          <DailyQuests />
        </FadeIn>
      )}
    </div>
  )
}

export default function DashboardContent() {
  const { show, dismiss } = useShowOnboarding()

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 lg:p-8">
      {show && <OnboardingWizard onComplete={dismiss} />}

      {/* Guided start — shows only for empty accounts */}
      <GuidedStart />

      {/* Row 1: Профиль + Календарь */}
      <ProfileCalendarRow />

      {/* Row 2: Задачи сегодня + Ежедневные квесты */}
      <FocusRow />

      {/* Row 3: Босс-Битва + Быстрые действия */}
      <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-[2fr_1fr]">
        <BossBattle />
        <QuickActions />
      </div>

      {/* Row 4: Статус модулей */}
      <MiniMetrics />

      {/* Row 5: AI Наставник */}
      <AIAdvisor />

      {/* Row 6: Баланс жизни, достижения, прогресс */}
      <CollapsibleSections />

      {/* Floating action button */}
      <FloatingActions />
    </div>
  )
}
