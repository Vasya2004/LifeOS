// ============================================
// HABITS
// ============================================

import type { Habit } from "@/lib/types"
import { getStore, setStore, KEYS, mutateKey, genId, now } from "./core"
import { addXp, updateStats, getStats } from "./gamification"

export function getHabits(): Habit[] {
  return getStore(KEYS.habits, [])
}

export function getHabitById(id: string): Habit | undefined {
  return getHabits().find(h => h.id === id)
}

export function addHabit(habit: Omit<Habit, "id" | "streak" | "bestStreak" | "totalCompletions" | "entries">) {
  const habits = getHabits()
  const newHabit: Habit = {
    ...habit,
    id: genId(),
    streak: 0,
    bestStreak: 0,
    totalCompletions: 0,
    entries: [],
  }
  setStore(KEYS.habits, [...habits, newHabit])
  mutateKey(KEYS.habits)
  return newHabit
}

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
  
  setStore(KEYS.habits, habits.map(h => 
    h.id === habitId ? { 
      ...h, 
      entries, 
      streak, 
      bestStreak, 
      totalCompletions 
    } : h
  ))
  mutateKey(KEYS.habits)
  
  if (completed) {
    addXp(habit.xpReward || 10, "habit_completed")
    updateStats({ totalHabitCompletions: getStats().totalHabitCompletions + 1 })
  }
}

export function updateHabit(id: string, updates: Partial<Habit>) {
  const habits = getHabits()
  setStore(KEYS.habits, habits.map(h => h.id === id ? { ...h, ...updates } : h))
  mutateKey(KEYS.habits)
}

export function deleteHabit(id: string) {
  const habits = getHabits()
  setStore(KEYS.habits, habits.filter(h => h.id !== id))
  mutateKey(KEYS.habits)
}

export function calculateStreak(entries: { date: string; completed: boolean }[]): number {
  const sorted = entries
    .filter(e => e.completed)
    .map(e => e.date)
    .sort()
    .reverse()
  
  if (sorted.length === 0) return 0
  
  let streak = 1
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1])
    const curr = new Date(sorted[i])
    const diff = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24)
    if (diff === 1) {
      streak++
    } else {
      break
    }
  }
  return streak
}

export function getHabitsByArea(areaId: string): Habit[] {
  return getHabits().filter(h => h.areaId === areaId)
}

export function getHabitsForDate(date: string): Habit[] {
  const dayOfWeek = new Date(date).getDay()
  // Convert Sunday (0) to 7 for easier handling
  const adjustedDay = dayOfWeek === 0 ? 7 : dayOfWeek
  
  return getHabits().filter(habit => {
    if (habit.frequency === "daily") return true
    if (habit.frequency === "weekly" && habit.targetDays?.includes(adjustedDay)) return true
    if (habit.frequency === "custom" && habit.targetDays?.includes(adjustedDay)) return true
    return false
  })
}
