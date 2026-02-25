// ============================================
// RESOURCES TYPES - Energy & Time Management
// ============================================

export interface EnergyState {
  date: string
  physical: number // 0-100
  mental: number
  emotional: number
  creative: number
  overall: number
}

export interface TimeBlock {
  id: string
  date: string
  startTime: string // "09:00"
  endTime: string // "11:00"
  title: string
  type: 'deep_work' | 'admin' | 'meeting' | 'rest' | 'exercise'
  taskId?: string
  isProtected: boolean // Нельзя переносить
}
