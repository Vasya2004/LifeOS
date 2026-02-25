// ============================================
// SKILLS MODULE - RPG-style Skill System
// ============================================

import type { Skill, SkillActivity, SkillCertificate, SkillDecayLog } from "@/lib/types"
import { getCurrentUserId } from "@/lib/auth/user-id"
import { 
  calculateXpNeeded, 
  getSkillTier, 
  SKILL_DECAY, 
  SKILL_ACTIVITY_XP 
} from "@/lib/types"
import { getStore, setStore, KEYS, mutateKey, genId, now, today } from "./core"
import { addXp, addCoins } from "./gamification"

// Skills CRUD
export function getSkills(): Skill[] {
  return getStore(KEYS.skills, [])
}

export function getSkillById(id: string): Skill | undefined {
  const skills = getSkills()
  return skills.find(s => s.id === id)
}

export function addSkill(skill: Omit<Skill, "id" | "userId" | "currentLevel" | "currentXp" | "xpNeeded" | "totalXpEarned" | "lastActivityDate" | "isDecaying" | "activities" | "certificates" | "decayLogs" | "createdAt" | "updatedAt">) {
  const skills = getSkills()
  const newSkill: Skill = {
    ...skill,
    id: genId(),
    userId: getCurrentUserId(),
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
  setStore(KEYS.skills, [...skills, newSkill])
  mutateKey(KEYS.skills)
  addXp(25, "skill_created")
  return newSkill
}

export function updateSkill(id: string, updates: Partial<Skill>) {
  const skills = getSkills()
  setStore(KEYS.skills, skills.map(s => 
    s.id === id ? { ...s, ...updates, updatedAt: now() } : s
  ))
  mutateKey(KEYS.skills)
}

export function deleteSkill(id: string) {
  const skills = getSkills()
  setStore(KEYS.skills, skills.filter(s => s.id !== id))
  mutateKey(KEYS.skills)
}

// Skill Activities & XP
export function addSkillActivity(
  skillId: string, 
  activity: Omit<SkillActivity, "id" | "skillId" | "createdAt">
): { success: boolean; leveledUp: boolean; newLevel?: number; certificate?: SkillCertificate } {
  const skills = getSkills()
  const skill = skills.find(s => s.id === skillId)
  if (!skill) return { success: false, leveledUp: false }

  // Create activity record
  const newActivity: SkillActivity = {
    ...activity,
    id: genId(),
    skillId,
    createdAt: now(),
  }

  // Calculate XP with activity type multiplier
  const baseXp = activity.xpAmount
  const multiplier = SKILL_ACTIVITY_XP[activity.activityType]
  const xpGained = baseXp * multiplier

  // Update skill
  let newXp = skill.currentXp + xpGained
  let newLevel = skill.currentLevel
  let newXpNeeded = skill.xpNeeded
  let leveledUp = false
  let certificate: SkillCertificate | undefined

  // Check for level up
  while (newXp >= newXpNeeded) {
    newXp -= newXpNeeded
    newLevel++
    newXpNeeded = calculateXpNeeded(newLevel)
    leveledUp = true

    // Generate certificate for Expert (5) and Legend (10+) levels
    if (newLevel === 5 || newLevel >= 10) {
      certificate = generateCertificate(skillId, newLevel)
    }

    // Award global XP for leveling up
    const levelUpXp = newLevel >= 10 ? 200 : newLevel >= 5 ? 100 : 50
    const levelUpCoins = newLevel >= 10 ? 50 : newLevel >= 5 ? 25 : 10
    addXp(levelUpXp, `skill_level_up_${newLevel}`)
    addCoins(levelUpCoins)
  }

  const updatedSkill: Skill = {
    ...skill,
    currentLevel: newLevel,
    currentXp: newXp,
    xpNeeded: newXpNeeded,
    totalXpEarned: skill.totalXpEarned + xpGained,
    lastActivityDate: today(),
    isDecaying: false,
    activities: [...skill.activities, newActivity],
    certificates: certificate ? [...skill.certificates, certificate] : skill.certificates,
    updatedAt: now(),
  }

  setStore(KEYS.skills, skills.map(s => s.id === skillId ? updatedSkill : s))
  mutateKey(KEYS.skills)

  return { success: true, leveledUp, newLevel: leveledUp ? newLevel : undefined, certificate }
}

function generateCertificate(skillId: string, level: number): SkillCertificate {
  const certificate: SkillCertificate = {
    id: genId(),
    skillId,
    levelAchieved: level,
    issuedAt: now(),
  }
  
  const certificates = getStore<SkillCertificate[]>(KEYS.skillCertificates, [])
  setStore(KEYS.skillCertificates, [...certificates, certificate])
  mutateKey(KEYS.skillCertificates)
  
  return certificate
}

export function getSkillActivities(skillId: string): SkillActivity[] {
  const skill = getSkillById(skillId)
  return skill?.activities || []
}

export function getSkillCertificates(skillId: string): SkillCertificate[] {
  const skill = getSkillById(skillId)
  return skill?.certificates || []
}

// Skill Decay System
export function checkSkillDecay(): SkillDecayLog[] {
  const skills = getSkills()
  const decayLogs: SkillDecayLog[] = []
  const todayDate = new Date(today())

  for (const skill of skills) {
    const lastActivity = new Date(skill.lastActivityDate)
    const daysInactive = Math.floor((todayDate.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))

    // Check if decay should start (after grace period)
    if (daysInactive > SKILL_DECAY.gracePeriod) {
      const decayDays = daysInactive - SKILL_DECAY.gracePeriod
      const totalDecayXp = decayDays * SKILL_DECAY.decayAmount

      if (totalDecayXp > 0 && skill.currentXp > 0) {
        const actualDecay = Math.min(totalDecayXp, skill.currentXp)
        
        // Apply decay
        const newXp = Math.max(0, skill.currentXp - actualDecay)
        
        // Create decay log
        const decayLog: SkillDecayLog = {
          id: genId(),
          skillId: skill.id,
          xpLost: actualDecay,
          reason: `Неактивность ${daysInactive} дней`,
          createdAt: now(),
        }

        // Update skill
        updateSkill(skill.id, {
          currentXp: newXp,
          isDecaying: true,
          decayLogs: [...skill.decayLogs, decayLog],
        })

        decayLogs.push(decayLog)
      }
    }
  }

  if (decayLogs.length > 0) {
    const existingLogs = getStore<SkillDecayLog[]>(KEYS.skillDecayLogs, [])
    setStore(KEYS.skillDecayLogs, [...existingLogs, ...decayLogs])
    mutateKey(KEYS.skillDecayLogs)
  }

  return decayLogs
}

export function getDecayLogs(skillId?: string): SkillDecayLog[] {
  const logs = getStore<SkillDecayLog[]>(KEYS.skillDecayLogs, [])
  if (skillId) {
    return logs.filter(l => l.skillId === skillId)
  }
  return logs
}

// Skill Statistics
export function getSkillStats() {
  const skills = getSkills()
  
  const totalSkills = skills.length
  const avgLevel = totalSkills > 0 
    ? Math.round(skills.reduce((sum, s) => sum + s.currentLevel, 0) / totalSkills * 10) / 10
    : 0
  const maxLevel = totalSkills > 0 
    ? Math.max(...skills.map(s => s.currentLevel))
    : 0
  const expertOrAbove = skills.filter(s => s.currentLevel >= 5).length
  const legends = skills.filter(s => s.currentLevel >= 10).length
  const decaying = skills.filter(s => s.isDecaying).length

  // Calculate total XP across all skills
  const totalXpEarned = skills.reduce((sum, s) => sum + s.totalXpEarned, 0)

  return {
    totalSkills,
    avgLevel,
    maxLevel,
    expertOrAbove,
    legends,
    decaying,
    totalXpEarned,
  }
}

// Get skills by category
export function getSkillsByCategory(categoryId: string): Skill[] {
  const skills = getSkills()
  return skills.filter(s => s.category === categoryId)
}

// Get top skills (by level)
export function getTopSkills(limit: number = 5): Skill[] {
  const skills = getSkills()
  return [...skills]
    .sort((a, b) => b.currentLevel - a.currentLevel || b.currentXp - a.currentXp)
    .slice(0, limit)
}

// Get recently active skills
export function getRecentlyActiveSkills(limit: number = 5): Skill[] {
  const skills = getSkills()
  return [...skills]
    .sort((a, b) => new Date(b.lastActivityDate).getTime() - new Date(a.lastActivityDate).getTime())
    .slice(0, limit)
}

// Get skills needing attention (decaying or inactive)
export function getSkillsNeedingAttention(): Skill[] {
  const skills = getSkills()
  const todayDate = new Date(today())
  
  return skills.filter(skill => {
    if (skill.isDecaying) return true
    const lastActivity = new Date(skill.lastActivityDate)
    const daysInactive = Math.floor((todayDate.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
    return daysInactive >= SKILL_DECAY.gracePeriod - 2 // Warning 2 days before decay
  })
}
