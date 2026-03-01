// ============================================
// HABITS FEATURE MODULE
// ============================================

import type { Habit } from "@/lib/types"
import { getStore, setStore, KEYS, mutateKey, genId, today } from "@/lib/store/core"
import { addXp, updateStats, getStats } from "@/lib/store/features/gamification"

const STREAK_MILESTONES = [7, 14, 30, 100]

// ============================================
// CRUD
// ============================================

export function getHabits(): Habit[] {
  return getStore(KEYS.habits, [])
}

export function getHabitById(id: string): Habit | undefined {
  return getHabits().find(h => h.id === id)
}

export function createHabit(
  habit: Omit<Habit, "id" | "streak" | "bestStreak" | "totalCompletions" | "entries">
): Habit {
  const habits = getHabits()
  const newHabit: Habit = {
    ...habit,
    id: genId(),
    streak: 0,
    bestStreak: 0,
    totalCompletions: 0,
    entries: [],
  }
  const updatedHabits = [...habits, newHabit]
  setStore(KEYS.habits, updatedHabits)
  mutateKey(KEYS.habits, updatedHabits)
  
  return newHabit
}

export function updateHabit(id: string, updates: Partial<Habit>) {
  const habits = getHabits()
  const habit = habits.find(h => h.id === id)
  if (!habit) return
  
  const updatedHabit = { ...habit, ...updates }
  const updatedHabits = habits.map(h => h.id === id ? updatedHabit : h)
  setStore(KEYS.habits, updatedHabits)
  mutateKey(KEYS.habits, updatedHabits)
}

export function deleteHabit(id: string) {
  const habits = getHabits()
  const updatedHabits = habits.filter(h => h.id !== id)
  setStore(KEYS.habits, updatedHabits)
  mutateKey(KEYS.habits, updatedHabits)
}

// ============================================
// ENTRIES & STREAKS
// ============================================

export function toggleHabitEntry(habitId: string, date: string, completed: boolean) {
  const habits = getHabits()
  const habit = habits.find(h => h.id === habitId)
  if (!habit) return
  
  const entries = [...habit.entries]
  const existingIndex = entries.findIndex(e => e.date === date)
  
  if (existingIndex >= 0) {
    entries[existingIndex] = { ...entries[existingIndex], completed }
  } else {
    entries.push({ date, completed })
  }
  
  // Calculate streak
  const streak = calculateStreak(entries)
  const bestStreak = Math.max(habit.bestStreak, streak)
  const totalCompletions = entries.filter(e => e.completed).length
  
  const updatedHabit = {
    ...habit,
    entries,
    streak,
    bestStreak,
    totalCompletions
  }
  
  const updatedHabits = habits.map(h =>
    h.id === habitId ? updatedHabit : h
  )
  setStore(KEYS.habits, updatedHabits)
  mutateKey(KEYS.habits, updatedHabits)
  
  if (completed) {
    addXp(habit.xpReward || 10, "habit_completed")
    updateStats({ totalHabitCompletions: getStats().totalHabitCompletions + 1 })
  }
}

export function calculateStreak(entries: { date: string; completed: boolean }[]): number {
  const sorted = [...entries]
    .filter(e => e.completed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  
  if (sorted.length === 0) return 0
  
  let streak = 0
  const todayStr = today()
  let checkDate = new Date(todayStr)
  
  for (const entry of sorted) {
    const entryDate = new Date(entry.date)
    const diffDays = Math.floor((checkDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === streak) {
      streak++
      checkDate.setDate(checkDate.getDate() - 1)
    } else if (diffDays > streak) {
      break
    }
  }
  
  return streak
}

// ============================================
// QUERIES
// ============================================

export function getHabitsByArea(areaId: string): Habit[] {
  return getHabits().filter(h => h.areaId === areaId)
}

export function getHabitsForDate(date: string): Habit[] {
  const dayOfWeek = new Date(date).getDay()
  return getHabits().filter(h => h.targetDays.includes(dayOfWeek))
}

export function getTodaysHabits(): Habit[] {
  return getHabitsForDate(today())
}

export function getActiveHabits(): Habit[] {
  return getHabits().filter(h => h.streak > 0)
}

export function getHabitsStats() {
  const habits = getHabits()
  return {
    total: habits.length,
    active: habits.filter(h => h.streak > 0).length,
    totalCompletions: habits.reduce((sum, h) => sum + h.totalCompletions, 0),
    bestStreak: Math.max(...habits.map(h => h.bestStreak), 0),
  }
}
