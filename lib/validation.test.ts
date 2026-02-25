import { describe, it, expect } from 'vitest'
import {
  createGoalSchema,
  createTaskSchema,
  createHabitSchema,
  createWishSchema,
  identitySchema,
  coreValueSchema,
  lifeAreaSchema,
  dailyReviewSchema,
} from './validation'

describe('Validation Schemas', () => {
  // ============================================
  // CREATE GOAL SCHEMA
  // ============================================
  describe('createGoalSchema', () => {
    it('should validate valid goal data', () => {
      const validData = {
        title: 'Run a marathon',
        description: 'Complete 42km race',
        areaId: 'area-123',
        type: 'outcome' as const,
        priority: 4,
        targetDate: '2024-12-31',
      }
      const result = createGoalSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject empty title', () => {
      const invalidData = {
        title: '',
        areaId: 'area-123',
        type: 'outcome',
        priority: 4,
        targetDate: '2024-12-31',
      }
      const result = createGoalSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject title too long', () => {
      const invalidData = {
        title: 'a'.repeat(201),
        areaId: 'area-123',
        type: 'outcome',
        priority: 4,
        targetDate: '2024-12-31',
      }
      const result = createGoalSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject invalid date format', () => {
      const invalidData = {
        title: 'Run a marathon',
        areaId: 'area-123',
        type: 'outcome',
        priority: 4,
        targetDate: '31-12-2024',
      }
      const result = createGoalSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject priority out of range', () => {
      const invalidData = {
        title: 'Run a marathon',
        areaId: 'area-123',
        type: 'outcome',
        priority: 6,
        targetDate: '2024-12-31',
      }
      const result = createGoalSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should require all fields without defaults', () => {
      const minimalData = {
        title: 'Run a marathon',
        areaId: 'area-123',
        targetDate: '2024-12-31',
      }
      const result = createGoalSchema.safeParse(minimalData)
      // Now type and priority are required, not optional with defaults
      expect(result.success).toBe(false)
    })
  })

  // ============================================
  // CREATE TASK SCHEMA
  // ============================================
  describe('createTaskSchema', () => {
    it('should validate valid task data', () => {
      const validData = {
        title: 'Morning run',
        description: '5km jog',
        projectId: 'goal-123',
        scheduledDate: '2024-01-15',
        priority: 'high' as const,
        energyCost: 'medium' as const,
        energyType: 'physical' as const,
        duration: 30,
      }
      const result = createTaskSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject duration too low', () => {
      const invalidData = {
        title: 'Morning run',
        scheduledDate: '2024-01-15',
        duration: 3,
      }
      const result = createTaskSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject duration too high', () => {
      const invalidData = {
        title: 'Morning run',
        scheduledDate: '2024-01-15',
        duration: 2000,
      }
      const result = createTaskSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject invalid priority', () => {
      const invalidData = {
        title: 'Morning run',
        scheduledDate: '2024-01-15',
        priority: 'urgent',
        duration: 30,
        energyCost: 'medium',
        energyType: 'mental',
      }
      const result = createTaskSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should accept valid priorities with all required fields', () => {
      const validData1 = {
        title: 'Task',
        scheduledDate: '2024-01-15',
        priority: 'critical' as const,
        duration: 30,
        energyCost: 'medium' as const,
        energyType: 'mental' as const,
      }
      expect(createTaskSchema.safeParse(validData1).success).toBe(true)

      const validData2 = {
        title: 'Task',
        scheduledDate: '2024-01-15',
        priority: 'high' as const,
        duration: 30,
        energyCost: 'medium' as const,
        energyType: 'mental' as const,
      }
      expect(createTaskSchema.safeParse(validData2).success).toBe(true)

      const validData3 = {
        title: 'Task',
        scheduledDate: '2024-01-15',
        priority: 'medium' as const,
        duration: 30,
        energyCost: 'medium' as const,
        energyType: 'mental' as const,
      }
      expect(createTaskSchema.safeParse(validData3).success).toBe(true)

      const validData4 = {
        title: 'Task',
        scheduledDate: '2024-01-15',
        priority: 'low' as const,
        duration: 30,
        energyCost: 'medium' as const,
        energyType: 'mental' as const,
      }
      expect(createTaskSchema.safeParse(validData4).success).toBe(true)
    })
  })

  // ============================================
  // CREATE HABIT SCHEMA
  // ============================================
  describe('createHabitSchema', () => {
    it('should validate valid habit data', () => {
      const validData = {
        areaId: 'area-123',
        title: 'Meditation',
        description: 'Daily practice',
        frequency: 'daily' as const,
        targetDays: [0, 1, 2, 3, 4, 5, 6],
        energyImpact: 10,
        energyType: 'mental' as const,
        xpReward: 15,
      }
      const result = createHabitSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject empty areaId', () => {
      const invalidData = {
        areaId: '',
        title: 'Meditation',
        frequency: 'daily',
      }
      const result = createHabitSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject energyImpact out of range', () => {
      const invalidData = {
        areaId: 'area-123',
        title: 'Meditation',
        frequency: 'daily',
        energyImpact: 200,
      }
      const result = createHabitSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject invalid targetDays', () => {
      const invalidData = {
        areaId: 'area-123',
        title: 'Meditation',
        frequency: 'weekly',
        targetDays: [0, 1, 8], // 8 is invalid
      }
      const result = createHabitSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  // ============================================
  // CREATE WISH SCHEMA
  // ============================================
  describe('createWishSchema', () => {
    it('should validate valid wish data', () => {
      const validData = {
        title: 'New laptop',
        description: 'MacBook Pro',
        cost: 2000,
        linkedGoalId: 'goal-123',
        deadline: '2024-12-31',
      }
      const result = createWishSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject zero cost', () => {
      const invalidData = {
        title: 'New laptop',
        cost: 0,
      }
      const result = createWishSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject negative cost', () => {
      const invalidData = {
        title: 'New laptop',
        cost: -100,
      }
      const result = createWishSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  // ============================================
  // IDENTITY SCHEMA
  // ============================================
  describe('identitySchema', () => {
    it('should validate valid identity', () => {
      const validData = {
        id: 'identity-123',
        name: 'John Doe',
        vision: 'My 5-year vision',
        mission: 'My life mission',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      const result = identitySchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject empty name', () => {
      const invalidData = {
        id: 'identity-123',
        name: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      const result = identitySchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  // ============================================
  // CORE VALUE SCHEMA
  // ============================================
  describe('coreValueSchema', () => {
    it('should validate valid core value', () => {
      const validData = {
        id: 'value-123',
        name: 'Honesty',
        description: 'Being truthful',
        importance: 5 as const,
        color: '#ff0000',
      }
      const result = coreValueSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid color format', () => {
      const invalidData = {
        id: 'value-123',
        name: 'Honesty',
        importance: 5,
        color: 'red',
      }
      const result = coreValueSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject importance out of range', () => {
      const invalidData = {
        id: 'value-123',
        name: 'Honesty',
        importance: 6,
        color: '#ff0000',
      }
      const result = coreValueSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  // ============================================
  // LIFE AREA SCHEMA
  // ============================================
  describe('lifeAreaSchema', () => {
    it('should validate valid life area', () => {
      const validData = {
        id: 'area-123',
        name: 'Health',
        icon: 'heart',
        color: '#22c55e',
        vision: 'Be healthy',
        currentLevel: 5,
        targetLevel: 8,
        isActive: true,
      }
      const result = lifeAreaSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject current level out of range', () => {
      const invalidData = {
        id: 'area-123',
        name: 'Health',
        icon: 'heart',
        color: '#22c55e',
        currentLevel: 15,
        targetLevel: 8,
        isActive: true,
      }
      const result = lifeAreaSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject current level below 1', () => {
      const invalidData = {
        id: 'area-123',
        name: 'Health',
        icon: 'heart',
        color: '#22c55e',
        currentLevel: 0,
        targetLevel: 8,
        isActive: true,
      }
      const result = lifeAreaSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  // ============================================
  // DAILY REVIEW SCHEMA
  // ============================================
  describe('dailyReviewSchema', () => {
    it('should validate valid daily review', () => {
      const validData = {
        date: '2024-01-15',
        dayRating: 4 as const,
        energyLevel: 3 as const,
        focusLevel: 4 as const,
        mood: 'good' as const,
        wins: ['Completed task 1', 'Worked out'],
        struggles: ['Procrastination'],
        lessons: 'Need better planning',
        gratitude: ['Family', 'Health'],
        goalProgress: [],
      }
      const result = dailyReviewSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid mood', () => {
      const invalidData = {
        date: '2024-01-15',
        dayRating: 4,
        energyLevel: 3,
        focusLevel: 4,
        mood: 'okay',
      }
      const result = dailyReviewSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject too many wins', () => {
      const invalidData = {
        date: '2024-01-15',
        dayRating: 4,
        energyLevel: 3,
        focusLevel: 4,
        mood: 'good',
        wins: Array(11).fill('Win'),
      }
      const result = dailyReviewSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })
})
