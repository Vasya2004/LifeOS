// ============================================
// CONSTANTS & ENUMS
// ============================================

import type { SkillTierLevel } from './skills'

// Life Areas
export const LIFE_AREAS = [
  { id: 'health', name: 'Health & Fitness', icon: 'heart', color: '#22c55e' },
  { id: 'career', name: 'Career & Business', icon: 'briefcase', color: '#8b5cf6' },
  { id: 'finance', name: 'Finance & Wealth', icon: 'wallet', color: '#eab308' },
  { id: 'relationships', name: 'Relationships', icon: 'users', color: '#ec4899' },
  { id: 'growth', name: 'Personal Growth', icon: 'brain', color: '#8b5cf6' },
  { id: 'recreation', name: 'Recreation & Fun', icon: 'gamepad', color: '#f97316' },
  { id: 'environment', name: 'Environment', icon: 'home', color: '#14b8a6' },
  { id: 'spirituality', name: 'Spirituality', icon: 'sparkles', color: '#6366f1' },
] as const

// Difficulty multipliers for gamification
export const DIFFICULTY_MULTIPLIERS = {
  easy: { xp: 10, coins: 5, energy: -5 },
  medium: { xp: 25, coins: 15, energy: -10 },
  hard: { xp: 50, coins: 30, energy: -20 },
  epic: { xp: 100, coins: 75, energy: -40 },
} as const

// Finance categories
export const FINANCE_CATEGORIES = {
  income: [
    { id: 'salary', name: 'Зарплата', icon: 'briefcase' },
    { id: 'freelance', name: 'Фриланс', icon: 'laptop' },
    { id: 'investment', name: 'Инвестиции', icon: 'trending-up' },
    { id: 'gift', name: 'Подарки', icon: 'gift' },
    { id: 'other_income', name: 'Другое', icon: 'plus' },
  ],
  expense: [
    { id: 'food', name: 'Еда', icon: 'utensils' },
    { id: 'transport', name: 'Транспорт', icon: 'car' },
    { id: 'housing', name: 'Жильё', icon: 'home' },
    { id: 'health', name: 'Здоровье', icon: 'heart' },
    { id: 'entertainment', name: 'Развлечения', icon: 'gamepad' },
    { id: 'education', name: 'Образование', icon: 'book' },
    { id: 'shopping', name: 'Покупки', icon: 'shopping-bag' },
    { id: 'subscriptions', name: 'Подписки', icon: 'credit-card' },
    { id: 'other_expense', name: 'Другое', icon: 'minus' },
  ],
} as const

// Health defaults
export const BODY_ZONES_DEFAULT = [
  { name: 'head', displayName: 'Голова', icon: 'brain', status: 'green' as const, notes: '', position: { x: 50, y: 8 } },
  { name: 'chest', displayName: 'Грудная клетка', icon: 'heart', status: 'green' as const, notes: '', position: { x: 50, y: 30 } },
  { name: 'stomach', displayName: 'Живот', icon: 'activity', status: 'green' as const, notes: '', position: { x: 50, y: 45 } },
  { name: 'back', displayName: 'Спина', icon: 'bone', status: 'green' as const, notes: '', position: { x: 50, y: 35 } },
  { name: 'left_arm', displayName: 'Левая рука', icon: 'arm', status: 'green' as const, notes: '', position: { x: 20, y: 40 } },
  { name: 'right_arm', displayName: 'Правая рука', icon: 'arm', status: 'green' as const, notes: '', position: { x: 80, y: 40 } },
  { name: 'left_leg', displayName: 'Левая нога', icon: 'leg', status: 'green' as const, notes: '', position: { x: 35, y: 75 } },
  { name: 'right_leg', displayName: 'Правая нога', icon: 'leg', status: 'green' as const, notes: '', position: { x: 65, y: 75 } },
]

export const MEDICAL_DOCUMENT_TYPES = [
  { id: 'blood' as const, name: 'Анализ крови', icon: 'droplet' },
  { id: 'xray' as const, name: 'Рентген', icon: 'scan' },
  { id: 'mri' as const, name: 'МРТ', icon: 'scan-line' },
  { id: 'ultrasound' as const, name: 'УЗИ', icon: 'waves' },
  { id: 'prescription' as const, name: 'Рецепт', icon: 'file-text' },
  { id: 'other' as const, name: 'Другое', icon: 'file' },
]

export const HEALTH_METRIC_UNITS = {
  weight: 'кг',
  sleep: 'ч',
  water: 'мл',
  steps: 'шагов',
  mood: '/10',
  heart_rate: 'уд/мин',
  blood_pressure: 'мм рт.ст.',
} as const

// Skill system constants
export const SKILL_TIERS: Record<SkillTierLevel, {
  title: string
  titleEn: string
  color: string
  borderColor: string
  bgColor: string
  glowEffect: string
  requiresCertificate: boolean
}> = {
  1: { 
    title: 'Новичок', 
    titleEn: 'Novice',
    color: 'text-gray-400', 
    borderColor: 'border-gray-600',
    bgColor: 'bg-gray-500/10',
    glowEffect: 'none',
    requiresCertificate: false
  },
  2: { 
    title: 'Любитель', 
    titleEn: 'Amateur',
    color: 'text-green-500', 
    borderColor: 'border-green-500',
    bgColor: 'bg-green-500/10',
    glowEffect: 'soft',
    requiresCertificate: false
  },
  3: { 
    title: 'Практик', 
    titleEn: 'Practitioner',
    color: 'text-[#8b5cf6]', 
    borderColor: 'border-[#8b5cf6]',
    bgColor: 'bg-[#8b5cf6]/10',
    glowEffect: 'glow',
    requiresCertificate: false
  },
  4: { 
    title: 'Профи', 
    titleEn: 'Professional',
    color: 'text-purple-500', 
    borderColor: 'border-purple-500',
    bgColor: 'bg-purple-500/10',
    glowEffect: 'pulse',
    requiresCertificate: false
  },
  5: { 
    title: 'Эксперт', 
    titleEn: 'Expert',
    color: 'text-orange-500', 
    borderColor: 'border-orange-500',
    bgColor: 'bg-gradient-to-br from-orange-500/20 to-yellow-500/20',
    glowEffect: 'gold',
    requiresCertificate: true
  },
  10: { 
    title: 'Легенда', 
    titleEn: 'Legend',
    color: 'text-red-500', 
    borderColor: 'border-red-500',
    bgColor: 'bg-gradient-to-br from-red-500/20 via-orange-500/20 to-yellow-500/20',
    glowEffect: 'fire',
    requiresCertificate: true
  },
}

// XP Formula: Each level requires 20% more XP than previous
export function calculateXpNeeded(level: number): number {
  if (level >= 10) return 20
  if (level >= 5) return 15
  if (level >= 4) return 12
  if (level >= 3) return 8
  if (level >= 2) return 5
  return 3
}

// Get tier config for any level
export function getSkillTier(level: number) {
  if (level >= 10) return SKILL_TIERS[10]
  if (level >= 5) return SKILL_TIERS[5]
  if (level >= 4) return SKILL_TIERS[4]
  if (level >= 3) return SKILL_TIERS[3]
  if (level >= 2) return SKILL_TIERS[2]
  return SKILL_TIERS[1]
}

// Activity type multipliers
export const SKILL_ACTIVITY_XP = {
  theory: 1,      // Reading, watching videos
  practice: 2,    // Exercises, training
  result: 3       // Real-world application, project completion
} as const

// Skill categories
export const SKILL_CATEGORIES = [
  { id: 'technical', name: 'Технические', icon: 'code', color: '#8b5cf6' },
  { id: 'creative', name: 'Творческие', icon: 'palette', color: '#ec4899' },
  { id: 'physical', name: 'Физические', icon: 'dumbbell', color: '#22c55e' },
  { id: 'mental', name: 'Ментальные', icon: 'brain', color: '#8b5cf6' },
  { id: 'social', name: 'Социальные', icon: 'users', color: '#f97316' },
  { id: 'professional', name: 'Профессиональные', icon: 'briefcase', color: '#14b8a6' },
  { id: 'languages', name: 'Языки', icon: 'languages', color: '#eab308' },
  { id: 'other', name: 'Другие', icon: 'star', color: '#6b7280' },
] as const

// Decay settings
export const SKILL_DECAY = {
  inactiveDays: 7,        // Start decay after 7 days
  decayAmount: 1,         // Lose 1 XP per day after threshold
  minLevel: 1,            // Cannot go below level 1
  gracePeriod: 3,         // 3 days grace before decay starts
} as const

// Certificate templates for Expert (5) and Legend (10+) levels
export const CERTIFICATE_TEMPLATES = {
  expert: {
    borderColor: '#f97316',
    gradient: 'from-orange-400 via-yellow-400 to-orange-500',
    badge: '🏆',
    title: 'Сертификат Эксперта'
  },
  legend: {
    borderColor: '#ef4444',
    gradient: 'from-red-500 via-orange-500 to-yellow-500',
    badge: '👑',
    title: 'Сертификат Легенды'
  }
} as const
