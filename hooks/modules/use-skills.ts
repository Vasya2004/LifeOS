// ============================================
// SKILLS HOOKS
// ============================================

"use client"

import { useOfflineFirst } from "@/hooks/core/use-offline-first"
import * as localStore from "@/lib/store"
import * as db from "@/lib/api/database"
import { syncToServer } from "@/lib/sync/offline-first"
import { setStore } from "@/lib/store/utils/storage"
import { useAuth } from "@/lib/auth/context"
import type { Skill, SkillActivity } from "@/lib/types"

const SKILLS_KEY = "skills"

export function useSkills() {
  const { isAuthenticated } = useAuth()

  return useOfflineFirst<Skill[]>(SKILLS_KEY, {
    storageKey: SKILLS_KEY,
    getLocal: localStore.getSkills,
    getServer: isAuthenticated ? db.getSkills : undefined,
    setLocal: (data) => setStore(SKILLS_KEY, data),
  })
}

export function useSkill(skillId: string) {
  const { data: skills, error, isLoading } = useSkills()
  return {
    data: skills?.find(s => s.id === skillId),
    error,
    isLoading,
  }
}

export function useCreateSkill() {
  const { isAuthenticated } = useAuth()

  return async (skill: Omit<Skill, "id" | "userId" | "currentLevel" | "currentXp" | "xpNeeded" | "totalXpEarned" | "lastActivityDate" | "isDecaying" | "activities" | "certificates" | "decayLogs" | "createdAt" | "updatedAt">) => {
    const newSkill = localStore.addSkill(skill)

    if (isAuthenticated) {
      await syncToServer("insert", "skills", newSkill, () => { })
    }

    return newSkill
  }
}

export function useUpdateSkill() {
  const { isAuthenticated } = useAuth()

  return async (id: string, updates: Partial<Skill>) => {
    localStore.updateSkill(id, updates)

    if (isAuthenticated) {
      const updated = { ...localStore.getSkills().find(s => s.id === id), ...updates, id }
      await syncToServer("update", "skills", updated, () => { })
    }
  }
}

export function useDeleteSkill() {
  const { isAuthenticated } = useAuth()

  return async (id: string) => {
    localStore.deleteSkill(id)

    if (isAuthenticated) {
      await syncToServer("delete", "skills", id, () => { })
    }
  }
}

export function useAddSkillActivity() {
  return async (skillId: string, activity: Omit<SkillActivity, "id" | "skillId" | "createdAt">) => {
    return localStore.addSkillActivity(skillId, activity)
  }
}

export function useSkillStats() {
  const { data: skills } = useSkills()

  const totalSkills = skills?.length || 0
  const avgLevel = totalSkills > 0
    ? Math.round((skills?.reduce((sum, s) => sum + s.currentLevel, 0) || 0) / totalSkills * 10) / 10
    : 0
  const maxLevel = totalSkills > 0
    ? Math.max(...(skills?.map(s => s.currentLevel) || [0]))
    : 0
  const expertOrAbove = skills?.filter(s => s.currentLevel >= 5).length || 0
  const legends = skills?.filter(s => s.currentLevel >= 10).length || 0
  const decaying = skills?.filter(s => s.isDecaying).length || 0
  const totalXpEarned = skills?.reduce((sum, s) => sum + s.totalXpEarned, 0) || 0

  return {
    data: {
      totalSkills,
      avgLevel,
      maxLevel,
      expertOrAbove,
      legends,
      decaying,
      totalXpEarned,
    }
  }
}

export function useTopSkills(limit: number = 5) {
  const { data: skills } = useSkills()

  const sorted = skills
    ? [...skills].sort((a, b) => b.currentLevel - a.currentLevel || b.currentXp - a.currentXp)
    : []

  return { data: sorted.slice(0, limit) }
}

export function useRecentlyActiveSkills(limit: number = 5) {
  const { data: skills } = useSkills()

  const sorted = skills
    ? [...skills].sort((a, b) => new Date(b.lastActivityDate).getTime() - new Date(a.lastActivityDate).getTime())
    : []

  return { data: sorted.slice(0, limit) }
}

export function useSkillsByCategory(categoryId: string) {
  const { data: skills } = useSkills()
  return {
    data: skills?.filter(s => s.category === categoryId) || []
  }
}
