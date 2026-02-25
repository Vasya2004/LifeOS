import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getIdentity,
  updateIdentity,
  getValues,
  addValue,
  updateValue,
  deleteValue,
  getAreas,
  addArea,
  updateArea,
  getGoals,
  addGoal,
  updateGoal,
  deleteGoal,
  getTasks,
  addTask,
  completeTask,
  updateTask,
  deleteTask,
  getHabits,
  addHabit,
  toggleHabitEntry,
  deleteHabit,
  getStats,
  addXp,
  addCoins,
  getLevelName,
  exportAllData,
  importAllData,
  clearAllData,
  KEYS,
} from './store'
import type { CoreValue, LifeArea, Goal, Task, Habit } from './types'

// Mock localStorage with Proxy to support Object.keys
const mockStorage: Record<string, string> = {}

const mockLocalStorage = new Proxy({} as Storage, {
  get(target, prop: string) {
    if (prop === 'getItem') return (key: string) => mockStorage[key] || null
    if (prop === 'setItem') return (key: string, value: string) => { mockStorage[key] = value }
    if (prop === 'removeItem') return (key: string) => { delete mockStorage[key] }
    if (prop === 'clear') return () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]) }
    if (prop === 'key') return (index: number) => Object.keys(mockStorage)[index] || null
    if (prop === 'length') return Object.keys(mockStorage).length
    return mockStorage[prop]
  },
  set(target, prop: string, value) {
    mockStorage[prop] = value
    return true
  },
  ownKeys() {
    return Object.keys(mockStorage)
  },
  getOwnPropertyDescriptor() {
    return { enumerable: true, configurable: true }
  },
})

Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
})

// Mock window
Object.defineProperty(global, 'window', {
  value: { localStorage: global.localStorage },
  writable: true,
})

describe('Store', () => {
  beforeEach(() => {
    // Clear storage before each test
    Object.keys(mockStorage).forEach(key => delete mockStorage[key])
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  // ============================================
  // IDENTITY TESTS
  // ============================================
  describe('Identity', () => {
    it('should return default identity when no data exists', () => {
      const identity = getIdentity()
      expect(identity.name).toBe('Игрок 1')
      expect(identity.vision).toBe('')
      expect(identity.mission).toBe('')
    })

    it('should update identity', () => {
      updateIdentity({ name: 'Test User', vision: 'My vision' })
      const identity = getIdentity()
      expect(identity.name).toBe('Test User')
      expect(identity.vision).toBe('My vision')
    })

    it('should update updatedAt timestamp on identity change', () => {
      const before = Date.now()
      updateIdentity({ name: 'New Name' })
      const after = Date.now()
      const identity = getIdentity()
      const updatedAtTime = new Date(identity.updatedAt).getTime()
      expect(updatedAtTime).toBeGreaterThanOrEqual(before)
      expect(updatedAtTime).toBeLessThanOrEqual(after)
    })
  })

  // ============================================
  // VALUES TESTS
  // ============================================
  describe('Values', () => {
    it('should return empty array when no values exist', () => {
      const values = getValues()
      expect(values).toEqual([])
    })

    it('should add a new value', () => {
      const value = addValue({
        name: 'Honesty',
        description: 'Being truthful',
        importance: 5,
        color: '#ff0000',
      })
      expect(value.name).toBe('Honesty')
      expect(value.importance).toBe(5)
      expect(value.id).toBeDefined()
    })

    it('should update a value', () => {
      const value = addValue({
        name: 'Honesty',
        description: 'Being truthful',
        importance: 5,
        color: '#ff0000',
      })
      updateValue(value.id, { name: 'Truth' })
      const values = getValues()
      expect(values[0].name).toBe('Truth')
    })

    it('should delete a value', () => {
      const value = addValue({
        name: 'Honesty',
        description: 'Being truthful',
        importance: 5,
        color: '#ff0000',
      })
      expect(getValues()).toHaveLength(1)
      deleteValue(value.id)
      expect(getValues()).toHaveLength(0)
    })
  })

  // ============================================
  // AREAS TESTS
  // ============================================
  describe('Areas', () => {
    it('should return empty array when no areas exist', () => {
      const areas = getAreas()
      expect(areas).toEqual([])
    })

    it('should add a new area', () => {
      const area = addArea({
        name: 'Health',
        icon: 'heart',
        color: '#22c55e',
        vision: 'Be healthy',
        currentLevel: 5,
        targetLevel: 8,
        isActive: true,
      })
      expect(area.name).toBe('Health')
      expect(area.color).toBe('#22c55e')
      expect(area.id).toBeDefined()
    })

    it('should update an area', () => {
      const area = addArea({
        name: 'Health',
        icon: 'heart',
        color: '#22c55e',
        vision: 'Be healthy',
        currentLevel: 5,
        targetLevel: 8,
        isActive: true,
      })
      updateArea(area.id, { currentLevel: 7 })
      const areas = getAreas()
      expect(areas[0].currentLevel).toBe(7)
    })
  })

  // ============================================
  // GOALS TESTS
  // ============================================
  describe('Goals', () => {
    it('should return empty array when no goals exist', () => {
      const goals = getGoals()
      expect(goals).toEqual([])
    })

    it('should add a new goal', () => {
      const goal = addGoal({
        title: 'Run a marathon',
        description: 'Complete 42km',
        areaId: 'area-1',
        type: 'outcome',
        priority: 4,
        targetDate: '2024-12-31',
        startedAt: new Date().toISOString(),
        status: 'active',
        progress: 0,
        milestones: [],
        relatedValues: [],
        relatedRoles: [],
      })
      expect(goal.title).toBe('Run a marathon')
      expect(goal.status).toBe('active')
      expect(goal.milestones).toEqual([])
    })

    it('should update a goal', () => {
      const goal = addGoal({
        title: 'Run a marathon',
        description: 'Complete 42km',
        areaId: 'area-1',
        type: 'outcome',
        priority: 4,
        targetDate: '2024-12-31',
        startedAt: new Date().toISOString(),
        status: 'active',
        progress: 0,
        milestones: [],
        relatedValues: [],
        relatedRoles: [],
      })
      updateGoal(goal.id, { progress: 50 })
      const goals = getGoals()
      expect(goals[0].progress).toBe(50)
    })

    it('should auto-complete goal when progress reaches 100', () => {
      const goal = addGoal({
        title: 'Run a marathon',
        description: 'Complete 42km',
        areaId: 'area-1',
        type: 'outcome',
        priority: 4,
        targetDate: '2024-12-31',
        startedAt: new Date().toISOString(),
        status: 'active',
        progress: 0,
        milestones: [],
        relatedValues: [],
        relatedRoles: [],
      })
      updateGoal(goal.id, { progress: 100 })
      const goals = getGoals()
      expect(goals[0].status).toBe('completed')
      expect(goals[0].completedAt).toBeDefined()
    })

    it('should delete a goal', () => {
      const goal = addGoal({
        title: 'Run a marathon',
        description: 'Complete 42km',
        areaId: 'area-1',
        type: 'outcome',
        priority: 4,
        targetDate: '2024-12-31',
        startedAt: new Date().toISOString(),
        status: 'active',
        progress: 0,
        milestones: [],
        relatedValues: [],
        relatedRoles: [],
      })
      expect(getGoals()).toHaveLength(1)
      deleteGoal(goal.id)
      expect(getGoals()).toHaveLength(0)
    })
  })

  // ============================================
  // TASKS TESTS
  // ============================================
  describe('Tasks', () => {
    it('should return empty array when no tasks exist', () => {
      const tasks = getTasks()
      expect(tasks).toEqual([])
    })

    it('should add a new task', () => {
      const task = addTask({
        title: 'Morning run',
        scheduledDate: '2024-01-01',
        status: 'todo',
        priority: 'high',
        energyCost: 'medium',
        energyType: 'physical',
      })
      expect(task.title).toBe('Morning run')
      expect(task.status).toBe('todo')
    })

    it('should complete a task', () => {
      const task = addTask({
        title: 'Morning run',
        scheduledDate: '2024-01-01',
        status: 'todo',
        priority: 'high',
        energyCost: 'medium',
        energyType: 'physical',
      })
      completeTask(task.id)
      const tasks = getTasks()
      expect(tasks[0].status).toBe('completed')
      expect(tasks[0].completedAt).toBeDefined()
    })

    it('should not complete an already completed task', () => {
      const task = addTask({
        title: 'Morning run',
        scheduledDate: '2024-01-01',
        status: 'completed',
        priority: 'high',
        energyCost: 'medium',
        energyType: 'physical',
        completedAt: new Date().toISOString(),
      })
      const beforeStats = getStats()
      completeTask(task.id)
      const afterStats = getStats()
      // Stats should not change since task was already completed
      expect(afterStats.totalTasksCompleted).toBe(beforeStats.totalTasksCompleted)
    })

    it('should delete a task', () => {
      const task = addTask({
        title: 'Morning run',
        scheduledDate: '2024-01-01',
        status: 'todo',
        priority: 'high',
        energyCost: 'medium',
        energyType: 'physical',
      })
      expect(getTasks()).toHaveLength(1)
      deleteTask(task.id)
      expect(getTasks()).toHaveLength(0)
    })
  })

  // ============================================
  // HABITS TESTS
  // ============================================
  describe('Habits', () => {
    it('should return empty array when no habits exist', () => {
      const habits = getHabits()
      expect(habits).toEqual([])
    })

    it('should add a new habit', () => {
      const habit = addHabit({
        areaId: 'area-1',
        title: 'Meditation',
        description: 'Daily meditation practice',
        frequency: 'daily',
        targetDays: [0, 1, 2, 3, 4, 5, 6],
        energyImpact: 10,
        energyType: 'mental',
        xpReward: 10,
      })
      expect(habit.title).toBe('Meditation')
      expect(habit.streak).toBe(0)
      expect(habit.bestStreak).toBe(0)
    })

    it('should toggle habit entry', () => {
      const habit = addHabit({
        areaId: 'area-1',
        title: 'Meditation',
        description: 'Daily meditation practice',
        frequency: 'daily',
        targetDays: [0, 1, 2, 3, 4, 5, 6],
        energyImpact: 10,
        energyType: 'mental',
        xpReward: 10,
      })
      const today = new Date().toISOString().split('T')[0]
      toggleHabitEntry(habit.id, today, true)
      const habits = getHabits()
      expect(habits[0].totalCompletions).toBe(1)
      expect(habits[0].entries).toHaveLength(1)
    })

    it('should calculate streak correctly', () => {
      const habit = addHabit({
        areaId: 'area-1',
        title: 'Meditation',
        description: 'Daily meditation practice',
        frequency: 'daily',
        targetDays: [0, 1, 2, 3, 4, 5, 6],
        energyImpact: 10,
        energyType: 'mental',
        xpReward: 10,
      })
      
      // Complete for 3 consecutive days
      const today = new Date()
      for (let i = 2; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        toggleHabitEntry(habit.id, dateStr, true)
      }
      
      const habits = getHabits()
      expect(habits[0].streak).toBe(3)
      expect(habits[0].bestStreak).toBe(3)
    })

    it('should delete a habit', () => {
      const habit = addHabit({
        areaId: 'area-1',
        title: 'Meditation',
        description: 'Daily meditation practice',
        frequency: 'daily',
        targetDays: [0, 1, 2, 3, 4, 5, 6],
        energyImpact: 10,
        energyType: 'mental',
        xpReward: 10,
      })
      expect(getHabits()).toHaveLength(1)
      deleteHabit(habit.id)
      expect(getHabits()).toHaveLength(0)
    })
  })

  // ============================================
  // STATS TESTS
  // ============================================
  describe('Stats', () => {
    it('should return default stats', () => {
      const stats = getStats()
      expect(stats.level).toBe(1)
      expect(stats.xp).toBe(0)
      expect(stats.xpToNext).toBe(1000)
      expect(stats.coins).toBe(0)
    })

    it('should add XP', () => {
      addXp(500)
      const stats = getStats()
      expect(stats.xp).toBe(500)
    })

    it('should level up when XP reaches threshold', () => {
      addXp(1000)
      const stats = getStats()
      expect(stats.level).toBe(2)
      expect(stats.xp).toBe(0)
      expect(stats.xpToNext).toBeGreaterThan(1000)
    })

    it('should add coins', () => {
      addCoins(100)
      const stats = getStats()
      expect(stats.coins).toBe(100)
      expect(stats.totalCoinsEarned).toBe(100)
    })
  })

  // ============================================
  // LEVEL NAME TESTS
  // ============================================
  describe('Level Names', () => {
    it('should return correct level names', () => {
      expect(getLevelName(1)).toBe('Новичок')
      expect(getLevelName(5)).toBe('Ученик')
      expect(getLevelName(10)).toBe('Адепт')
      expect(getLevelName(20)).toBe('Ветеран')
      expect(getLevelName(30)).toBe('Эксперт')
      expect(getLevelName(40)).toBe('Мастер')
      expect(getLevelName(50)).toBe('Легенда')
      expect(getLevelName(60)).toBe('Легенда')
    })
  })

  // ============================================
  // EXPORT/IMPORT TESTS
  // ============================================
  describe('Export/Import', () => {
    it('should export all data', () => {
      // Add some data
      addArea({
        name: 'Health',
        icon: 'heart',
        color: '#22c55e',
        vision: 'Be healthy',
        currentLevel: 5,
        targetLevel: 8,
        isActive: true,
      })
      
      const data = exportAllData()
      expect(data.version).toBe('2.3')
      expect(data.areas).toHaveLength(1)
      expect(data.exportDate).toBeDefined()
      // Check finance properties exist
      expect(data.accounts).toEqual([])
      expect(data.transactions).toEqual([])
      expect(data.financialGoals).toEqual([])
      expect(data.budgets).toEqual([])
    })

    it('should import data successfully', () => {
      const testData = {
        version: '2.0',
        exportDate: new Date().toISOString(),
        identity: {
          id: 'test-id',
          name: 'Test User',
          vision: 'Test vision',
          mission: 'Test mission',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        values: [],
        areas: [{
          id: 'area-1',
          name: 'Health',
          icon: 'heart',
          color: '#22c55e',
          vision: 'Be healthy',
          currentLevel: 5,
          targetLevel: 8,
          isActive: true,
        }],
        roles: [],
        goals: [],
        projects: [],
        tasks: [],
        habits: [],
        challenges: [],
        energyHistory: [],
        timeBlocks: [],
        dailyReviews: [],
        weeklyReviews: [],
        journal: [],
        stats: {
          level: 5,
          xp: 100,
          xpToNext: 2000,
          coins: 50,
          totalCoinsEarned: 100,
          totalCoinsSpent: 50,
          currentStreak: 3,
          longestStreak: 5,
          lastActiveDate: new Date().toISOString().split('T')[0],
          totalTasksCompleted: 10,
          totalGoalsAchieved: 2,
          totalProjectsCompleted: 1,
          totalHabitCompletions: 20,
          totalDeepWorkHours: 10,
          totalFocusSessions: 5,
          avgDailyTasks: 3,
        },
        rewards: [],
        wishes: [],
        achievements: [],
        accounts: [],
        transactions: [],
        financialGoals: [],
        budgets: [],
        skills: [],
        bodyZones: [],
        medicalDocuments: [],
        healthMetrics: [],
        healthProfile: { allergies: [], chronicConditions: [], medications: [] },
        settings: {
          theme: 'dark' as const,
          soundEnabled: true,
          notificationsEnabled: false,
          weekStartsOn: 1 as const,
          defaultWorkingHours: { start: '09:00', end: '18:00' },
        },
      }
      
      const result = importAllData(testData)
      expect(result.success).toBe(true)
      
      const identity = getIdentity()
      expect(identity.name).toBe('Test User')
      
      const areas = getAreas()
      expect(areas).toHaveLength(1)
      
      const stats = getStats()
      expect(stats.level).toBe(5)
      expect(stats.coins).toBe(50)
    })

    it('should clear all data', () => {
      // Add some data with prefixed keys
      mockStorage['lifeos_areas'] = JSON.stringify([{
        id: 'test-area',
        name: 'Health',
        icon: 'heart',
        color: '#22c55e',
        vision: 'Be healthy',
        currentLevel: 5,
        targetLevel: 8,
        isActive: true,
      }])
      mockStorage['lifeos_values'] = JSON.stringify([{
        id: 'test-value',
        name: 'Honesty',
        description: 'Being truthful',
        importance: 5,
        color: '#ff0000',
      }])
      mockStorage['other_key'] = 'should remain'
      
      expect(getAreas()).toHaveLength(1)
      expect(getValues()).toHaveLength(1)
      
      clearAllData()
      
      // Only prefixed keys should be cleared
      expect(getAreas()).toHaveLength(0)
      expect(getValues()).toHaveLength(0)
      // Other keys should remain
      expect(mockStorage['other_key']).toBe('should remain')
    })
  })
})
