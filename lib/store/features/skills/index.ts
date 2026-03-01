// ============================================
// SKILLS FEATURE MODULE
// ============================================

import type { Skill, SkillActivity, SkillCertificate } from "@/lib/types"
import { calculateXpNeeded, getSkillTier } from "@/lib/types"
import { getStore, setStore, KEYS, mutateKey, genId, now, today, daysBetween } from "@/lib/store/core"

// ============================================
// CRUD
// ============================================

export function getSkills(): Skill[] {
  return getStore(KEYS.skills, [])
}

export function getSkillById(id: string): Skill | undefined {
  return getSkills().find(s => s.id === id)
}

export function addSkill(
  skill: Omit<Skill, "id" | "createdAt" | "updatedAt" | "currentLevel" | "currentXp" | "xpNeeded" | "totalXpEarned" | "activities" | "certificates" | "decayLogs" | "isDecaying" | "lastActivityDate" | "userId"> 
    & { userId?: string }
): Skill {
  const skills = getSkills()
  const newSkill: Skill = {
    ...skill,
    id: genId(),
    userId: skill.userId || "",
    currentLevel: 1,
    currentXp: 0,
    xpNeeded: calculateXpNeeded(1),
    totalXpEarned: 0,
    lastActivityDate: today(),
    isDecaying: false,
    activities: [],
    certificates: [],
    decayLogs: [],
    createdAt: now(),
    updatedAt: now(),
  }
  const updated = [...skills, newSkill]
  setStore(KEYS.skills, updated)
  mutateKey(KEYS.skills, updated)
  return newSkill
}

export function updateSkill(id: string, updates: Partial<Skill>) {
  const skills = getSkills()
  const updated = skills.map(s => s.id === id ? { ...s, ...updates, updatedAt: now() } : s)
  setStore(KEYS.skills, updated)
  mutateKey(KEYS.skills, updated)
}

export function deleteSkill(id: string) {
  const skills = getSkills()
  const updated = skills.filter(s => s.id !== id)
  setStore(KEYS.skills, updated)
  mutateKey(KEYS.skills, updated)
}

// ============================================
// ACTIVITIES & XP
// ============================================

export interface AddActivityResult {
  success: boolean
  skill?: Skill
  leveledUp?: boolean
  newLevel?: number
}

export function addSkillActivity(
  skillId: string,
  activity: Omit<SkillActivity, "id" | "skillId" | "createdAt">
): AddActivityResult {
  const skill = getSkillById(skillId)
  if (!skill) return { success: false }
  
  const newActivity: SkillActivity = {
    ...activity,
    id: genId(),
    skillId,
    createdAt: now(),
  }
  
  let newLevel = skill.currentLevel
  let newXp = skill.currentXp + activity.xpAmount
  let newXpNeeded = skill.xpNeeded
  let leveledUp = false
  
  // Level up logic
  while (newXp >= newXpNeeded) {
    newXp -= newXpNeeded
    newLevel++
    newXpNeeded = calculateXpNeeded(newLevel)
    leveledUp = true
  }
  
  const updatedSkill: Skill = {
    ...skill,
    currentLevel: newLevel,
    currentXp: newXp,
    xpNeeded: newXpNeeded,
    totalXpEarned: skill.totalXpEarned + activity.xpAmount,
    lastActivityDate: today(),
    isDecaying: false,
    activities: [...skill.activities, newActivity],
  }
  
  // Add certificate if leveled up to milestone
  if (leveledUp && (newLevel === 5 || newLevel === 10)) {
    const certificate: SkillCertificate = {
      id: genId(),
      skillId,
      levelAchieved: newLevel,
      issuedAt: now(),
    }
    updatedSkill.certificates = [...updatedSkill.certificates, certificate]
  }
  
  const skills = getSkills()
  const updated = skills.map(s => s.id === skillId ? updatedSkill : s)
  setStore(KEYS.skills, updated)
  mutateKey(KEYS.skills, updated)
  
  return {
    success: true,
    skill: updatedSkill,
    leveledUp,
    newLevel: leveledUp ? newLevel : undefined,
  }
}

export function getSkillActivities(skillId: string): SkillActivity[] {
  const skill = getSkillById(skillId)
  return skill?.activities ?? []
}

export function getSkillCertificates(skillId: string): SkillCertificate[] {
  const skill = getSkillById(skillId)
  return skill?.certificates ?? []
}

// ============================================
// DECAY
// ============================================

export function checkSkillDecay(): Skill[] {
  const skills = getSkills()
  const decayed: Skill[] = []
  
  skills.forEach(skill => {
    if (skill.currentLevel <= 1) return
    
    const daysInactive = daysBetween(skill.lastActivityDate, today())
    if (daysInactive > 7) {
      const decayAmount = Math.floor((daysInactive - 7) / 7)
      let newXp = skill.currentXp - decayAmount
      let newLevel = skill.currentLevel
      
      if (newXp < 0) {
        newLevel = Math.max(1, newLevel - 1)
        newXp = calculateXpNeeded(newLevel) + newXp
      }
      
      updateSkill(skill.id, {
        currentLevel: newLevel,
        currentXp: Math.max(0, newXp),
        isDecaying: true,
      })
      
      decayed.push(getSkillById(skill.id)!)
    }
  })
  
  return decayed
}

export function getDecayLogs(skillId: string) {
  const skill = getSkillById(skillId)
  return skill?.decayLogs ?? []
}

// ============================================
// QUERIES
// ============================================

export function getSkillStats() {
  const skills = getSkills()
  return {
    total: skills.length,
    averageLevel: skills.length > 0 
      ? skills.reduce((sum, s) => sum + s.currentLevel, 0) / skills.length 
      : 0,
    maxLevel: Math.max(...skills.map(s => s.currentLevel), 0),
    totalActivities: skills.reduce((sum, s) => sum + s.activities.length, 0),
    decaying: skills.filter(s => s.isDecaying).length,
  }
}

export function getSkillsByCategory(category: string): Skill[] {
  return getSkills().filter(s => s.category === category)
}

export function getTopSkills(limit: number = 5): Skill[] {
  return getSkills()
    .sort((a, b) => b.currentLevel - a.currentLevel || b.totalXpEarned - a.totalXpEarned)
    .slice(0, limit)
}

export function getRecentlyActiveSkills(limit: number = 5): Skill[] {
  return getSkills()
    .sort((a, b) => new Date(b.lastActivityDate).getTime() - new Date(a.lastActivityDate).getTime())
    .slice(0, limit)
}

export function getSkillsNeedingAttention(): Skill[] {
  return getSkills().filter(s => {
    const daysInactive = daysBetween(s.lastActivityDate, today())
    return daysInactive > 5 && !s.isDecaying
  })
}
