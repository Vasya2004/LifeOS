// ============================================
// SKILLS MODULE - Lazy Loading Wrapper
// ============================================
//
// This module provides async access to skills store functions.
// The actual module is loaded on first use via dynamic import.
//
// Usage:
//   import { getSkills, addSkillActivity } from "@/lib/store/lazy/skills"
//   const skills = await getSkills()
//
// ============================================

import type { Skill, SkillActivity, SkillCertificate, SkillDecayLog } from "@/lib/types"
import { StoreRegistry } from "./registry"

// ============================================
// Skills CRUD
// ============================================

export async function getSkills(): Promise<Skill[]> {
  const mod = await StoreRegistry.skills()
  return mod.getSkills()
}

export async function getSkillById(id: string): Promise<Skill | undefined> {
  const mod = await StoreRegistry.skills()
  return mod.getSkillById(id)
}

export async function addSkill(
  skill: Omit<
    Skill,
    | "id"
    | "userId"
    | "currentLevel"
    | "currentXp"
    | "xpNeeded"
    | "totalXpEarned"
    | "lastActivityDate"
    | "isDecaying"
    | "activities"
    | "certificates"
    | "decayLogs"
    | "createdAt"
    | "updatedAt"
  >
): Promise<Skill> {
  const mod = await StoreRegistry.skills()
  return mod.addSkill(skill)
}

export async function updateSkill(id: string, updates: Partial<Skill>): Promise<void> {
  const mod = await StoreRegistry.skills()
  return mod.updateSkill(id, updates)
}

export async function deleteSkill(id: string): Promise<void> {
  const mod = await StoreRegistry.skills()
  return mod.deleteSkill(id)
}

// ============================================
// Skill Activities & XP
// ============================================

export async function addSkillActivity(
  skillId: string,
  activity: Omit<SkillActivity, "id" | "skillId" | "createdAt">
): Promise<{
  success: boolean
  leveledUp: boolean
  newLevel?: number
  certificate?: SkillCertificate
}> {
  const mod = await StoreRegistry.skills()
  return mod.addSkillActivity(skillId, activity)
}

export async function getSkillActivities(skillId: string): Promise<SkillActivity[]> {
  const mod = await StoreRegistry.skills()
  return mod.getSkillActivities(skillId)
}

export async function getSkillCertificates(skillId: string): Promise<SkillCertificate[]> {
  const mod = await StoreRegistry.skills()
  return mod.getSkillCertificates(skillId)
}

// ============================================
// Skill Decay System
// ============================================

export async function checkSkillDecay(): Promise<SkillDecayLog[]> {
  const mod = await StoreRegistry.skills()
  return mod.checkSkillDecay()
}

export async function getDecayLogs(skillId?: string): Promise<SkillDecayLog[]> {
  const mod = await StoreRegistry.skills()
  return mod.getDecayLogs(skillId)
}

// ============================================
// Skill Statistics
// ============================================

export async function getSkillStats(): Promise<{
  totalSkills: number
  avgLevel: number
  maxLevel: number
  expertOrAbove: number
  legends: number
  decaying: number
  totalXpEarned: number
}> {
  const mod = await StoreRegistry.skills()
  return mod.getSkillStats()
}

export async function getSkillsByCategory(categoryId: string): Promise<Skill[]> {
  const mod = await StoreRegistry.skills()
  return mod.getSkillsByCategory(categoryId)
}

export async function getTopSkills(limit?: number): Promise<Skill[]> {
  const mod = await StoreRegistry.skills()
  return mod.getTopSkills(limit)
}

export async function getRecentlyActiveSkills(limit?: number): Promise<Skill[]> {
  const mod = await StoreRegistry.skills()
  return mod.getRecentlyActiveSkills(limit)
}

export async function getSkillsNeedingAttention(): Promise<Skill[]> {
  const mod = await StoreRegistry.skills()
  return mod.getSkillsNeedingAttention()
}

// ============================================
// Loading State
// ============================================

export function getLoadingState() {
  return StoreRegistry.getSkillsState()
}
