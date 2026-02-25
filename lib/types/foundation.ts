// ============================================
// FOUNDATION TYPES - Identity & Life Structure
// ============================================

export interface Identity {
  id: string
  name: string
  vision: string // Какой я вижу себя через 5 лет
  mission: string // Для чего я живу
  createdAt: string
  updatedAt: string
}

export interface CoreValue {
  id: string
  name: string
  description: string
  importance: 1 | 2 | 3 | 4 | 5 // 5 = критически важно
  color: string
}

export interface LifeArea {
  id: string
  name: string
  icon: string
  color: string
  vision: string // Видение для этой сферы
  currentLevel: number // 1-10
  targetLevel: number // 1-10
  isActive: boolean
}

export interface Role {
  id: string
  name: string
  areaId: string // К какой сфере относится
  description: string
  commitments: string[] // Что я обязуюсь делать в этой роли
}
