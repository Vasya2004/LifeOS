// ============================================
// USE AI ADVICE HOOK
// ============================================

import { useState, useEffect, useCallback, useMemo } from "react"
import { useStats } from "./use-data"
import { useAreas } from "./modules/use-areas"
import { useGoals } from "./modules/use-goals"
import { useTasks } from "./modules/use-tasks"
import { useHabits } from "./modules/use-habits"
import { useSkills } from "./modules/use-skills"
import { useFinanceData } from "./modules/use-finance"
import { useHealthData } from "./modules/use-health"
import { generateAdvice, generateLocalAdvice } from "@/lib/ai/client"
import type { AIAdvice, AIAdviceType } from "@/lib/types/dashboard.types"
import type { UserContext } from "@/lib/ai/prompts"

interface UseAIAdviceOptions {
  enabled?: boolean
  type?: 'general' | 'habits' | 'goals' | 'finance' | 'health' | 'skills'
  refreshInterval?: number // minutes
}

export function useAIAdvice(options: UseAIAdviceOptions = {}): AIAdvice[] {
  const { enabled = true, type = 'general', refreshInterval = 5 } = options
  
  const { data: stats } = useStats()
  const { data: areas } = useAreas()
  const { data: goals } = useGoals()
  const { data: tasks } = useTasks()
  const { data: habits } = useHabits()
  const { data: skills } = useSkills()
  const { data: finance } = useFinanceData()
  const { data: health } = useHealthData()
  
  const [advice, setAdvice] = useState<AIAdvice[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Build context from all data sources
  const context = useMemo<Partial<UserContext>>(() => {
    const today = new Date().toISOString().split('T')[0]
    
    return {
      stats: stats ? {
        level: stats.level,
        xp: stats.xp,
        xpToNext: stats.xpToNext,
        currentStreak: stats.currentStreak,
        coins: stats.coins,
      } : undefined,
      activeGoals: goals?.filter(g => g.status === 'active').map(g => ({
        title: g.title,
        progress: g.progress,
        targetDate: g.targetDate,
      })) || [],
      todaysTasks: tasks?.filter(t => t.scheduledDate === today).map(t => ({
        title: t.title,
        status: t.status,
      })) || [],
      overdueTasks: tasks?.filter(t => {
        if (t.status === 'completed' || t.status === 'cancelled') return false
        return t.scheduledDate < today
      }).map(t => ({ title: t.title })) || [],
      habits: habits?.map(h => ({
        title: h.title,
        streak: h.streak,
        totalCompletions: h.totalCompletions,
      })) || [],
      todaysHabits: habits?.filter(h => {
        const today = new Date().getDay()
        return h.targetDays.includes(today)
      }) || [],
      skills: skills?.map(s => ({
        name: s.name,
        currentLevel: s.currentLevel,
        currentXp: s.currentXp,
        xpNeeded: s.xpNeeded,
        lastActivityDate: s.lastActivityDate,
      })) || [],
      accounts: finance?.accounts.map(a => ({
        name: a.name,
        balance: a.balance,
        currency: a.currency,
      })) || [],
      recentTransactions: finance?.transactions.slice(0, 5) || [],
      budgets: finance?.budgets || [],
      healthMetrics: health?.metrics.slice(0, 5).map(m => ({
        type: m.type,
        value: m.value,
        unit: m.unit,
        date: m.date,
      })) || [],
      bodyZones: health?.bodyZones.map(z => ({
        displayName: z.displayName,
        status: z.status,
      })) || [],
    }
  }, [stats, goals, tasks, habits, skills, finance, health])

  // Generate advice
  const generate = useCallback(async () => {
    if (!enabled) return
    
    setIsLoading(true)
    try {
      const responses = await generateAdvice(context, { type })
      
      // Convert to AIAdvice format
      const newAdvice: AIAdvice[] = responses.map((r, index) => ({
        id: `ai-${type}-${Date.now()}-${index}`,
        type: r.type as AIAdviceType,
        category: r.category || "productivity",
        title: r.title,
        message: r.message,
        actionLabel: r.actionLabel,
        actionHref: getActionHref(r.actionLabel),
        dismissible: true,
        priority: r.priority,
      }))
      
      setAdvice(newAdvice)
    } catch (error) {
      console.error("Failed to generate AI advice:", error)
      // Fallback to local
      const fallback = generateLocalAdvice(context)
      setAdvice(fallback)
    } finally {
      setIsLoading(false)
    }
  }, [context, enabled, type])

  // Initial generation
  useEffect(() => {
    generate()
  }, [generate])

  // Periodic refresh
  useEffect(() => {
    if (!enabled || refreshInterval <= 0) return
    
    const interval = setInterval(generate, refreshInterval * 60 * 1000)
    return () => clearInterval(interval)
  }, [generate, enabled, refreshInterval])

  return advice
}

// Helper to determine action href from label
function getActionHref(actionLabel?: string): string | undefined {
  if (!actionLabel) return undefined
  
  const label = actionLabel.toLowerCase()
  
  if (label.includes('задач')) return '/tasks'
  if (label.includes('привыч')) return '/habits'
  if (label.includes('цел')) return '/goals'
  if (label.includes('навык')) return '/skills'
  if (label.includes('финанс') || label.includes('магазин')) return '/finance'
  if (label.includes('здоров')) return '/health'
  if (label.includes('обзор') || label.includes('дневник')) return '/review'
  
  return undefined
}

// Hook for specific advice types
export function useHabitAdvice(): AIAdvice[] {
  return useAIAdvice({ type: 'habits' })
}

export function useGoalAdvice(): AIAdvice[] {
  return useAIAdvice({ type: 'goals' })
}

export function useFinanceAdvice(): AIAdvice[] {
  return useAIAdvice({ type: 'finance' })
}

export function useHealthAdvice(): AIAdvice[] {
  return useAIAdvice({ type: 'health' })
}

export function useSkillAdvice(): AIAdvice[] {
  return useAIAdvice({ type: 'skills' })
}
