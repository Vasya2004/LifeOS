// ============================================
// SKILLS TYPES - RPG-style Skill Progression
// ============================================

export type SkillActivityType = 'theory' | 'practice' | 'result'

export interface SkillActivity {
  id: string
  skillId: string
  description: string
  xpAmount: number // 1-3
  activityType: SkillActivityType
  proofUrl?: string
  proofRequired: boolean
  createdAt: string
}

export interface SkillCertificate {
  id: string
  skillId: string
  levelAchieved: number
  certificateUrl?: string
  issuedAt: string
}

export interface SkillDecayLog {
  id: string
  skillId: string
  xpLost: number
  reason: string
  createdAt: string
}

export interface Skill {
  id: string
  userId: string
  name: string
  description: string
  icon: string
  color: string
  category: string
  currentLevel: number // 1-50+
  currentXp: number
  xpNeeded: number // XP needed for next level
  totalXpEarned: number
  lastActivityDate: string
  isDecaying: boolean
  activities: SkillActivity[]
  certificates: SkillCertificate[]
  decayLogs: SkillDecayLog[]
  createdAt: string
  updatedAt: string
}

export type SkillTierLevel = 1 | 2 | 3 | 4 | 5 | 10
