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
import { FadeIn } from "@/components/animations"
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard"
import { useAuth } from "@/lib/auth/context"
import { useAreas } from "@/hooks/modules/use-areas"

function useShowOnboarding() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const { data: areas, isLoading: areasLoading } = useAreas()
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (authLoading || !isAuthenticated || user?.isGuest) return
    if (typeof window === "undefined") return

    // Check local storage first for quick response
    if (localStorage.getItem("lifeos_onboarding_done")) return

    // Check server-side profile flag
    if (user?.profile?.onboardingCompleted) {
      localStorage.setItem("lifeos_onboarding_done", "true")
      return
    }

    // Only show if everything is loaded and we have no areas
    if (!areasLoading && Array.isArray(areas) && areas.length === 0) {
      setShow(true)
    }
  }, [isAuthenticated, user, authLoading, areas, areasLoading])

  return { show, dismiss: () => setShow(false) }
}

export default function DashboardContent() {
  const { show, dismiss } = useShowOnboarding()

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 lg:p-8">
      {show && <OnboardingWizard onComplete={dismiss} />}

      {/* Row 1: Hero */}
      <HeroSection />

      {/* Row 2: Календарь + Задачи сегодня */}
      <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-[1fr_2fr]">
        <DayWidget />
        <TasksToday />
      </div>

      {/* Row 3: Босс-Битва + Быстрые действия */}
      <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-[2fr_1fr]">
        <BossBattle />
        <QuickActions />
      </div>

      {/* Row 4: Статус модулей + Ежедневные квесты */}
      <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-[2fr_1fr]">
        <MiniMetrics />
        <FadeIn delay={0.1} className="h-full">
          <DailyQuests />
        </FadeIn>
      </div>

      {/* Row 5: AI Наставник */}
      <AIAdvisor />

      {/* Row 6: Сворачиваемые секции */}
      <CollapsibleSections />

    </div>
  )
}
