// ============================================
// REFLECTION - Daily Reviews & Journal
// ============================================

import type { DailyReview, WeeklyReview, JournalEntry } from "@/lib/types"
import { getStore, setStore, KEYS, mutateKey, genId, now } from "./core"

// Daily Reviews
export function getDailyReviews(): DailyReview[] {
  return getStore<DailyReview[]>(KEYS.dailyReviews, [])
}

export function getDailyReview(date: string): DailyReview | undefined {
  const reviews = getDailyReviews()
  return reviews.find(r => r.date === date)
}

export function saveDailyReview(review: DailyReview) {
  const reviews = getDailyReviews()
  const existingIndex = reviews.findIndex(r => r.date === review.date)
  
  if (existingIndex >= 0) {
    reviews[existingIndex] = review
  } else {
    reviews.push(review)
  }
  
  setStore(KEYS.dailyReviews, reviews)
  mutateKey(KEYS.dailyReviews)
}

export function deleteDailyReview(date: string) {
  const reviews = getDailyReviews()
  setStore(KEYS.dailyReviews, reviews.filter(r => r.date !== date))
  mutateKey(KEYS.dailyReviews)
}

// Weekly Reviews
export function getWeeklyReviews(): WeeklyReview[] {
  return getStore<WeeklyReview[]>(KEYS.weeklyReviews, [])
}

export function getWeeklyReview(weekStart: string): WeeklyReview | undefined {
  const reviews = getWeeklyReviews()
  return reviews.find(r => r.weekStart === weekStart)
}

export function saveWeeklyReview(review: WeeklyReview) {
  const reviews = getWeeklyReviews()
  const existingIndex = reviews.findIndex(r => r.weekStart === review.weekStart)
  
  if (existingIndex >= 0) {
    reviews[existingIndex] = review
  } else {
    reviews.push(review)
  }
  
  setStore(KEYS.weeklyReviews, reviews)
  mutateKey(KEYS.weeklyReviews)
}

// Journal
export function getJournal(): JournalEntry[] {
  return getStore(KEYS.journal, [])
}

export function getJournalEntryById(id: string): JournalEntry | undefined {
  return getJournal().find(e => e.id === id)
}

export function addJournalEntry(entry: Omit<JournalEntry, "id" | "timestamp">) {
  const entries = getJournal()
  const newEntry: JournalEntry = {
    ...entry,
    id: genId(),
    timestamp: now(),
  }
  setStore(KEYS.journal, [...entries, newEntry])
  mutateKey(KEYS.journal)
  return newEntry
}

export function updateJournalEntry(id: string, updates: Partial<JournalEntry>) {
  const entries = getJournal()
  setStore(KEYS.journal, entries.map(e => e.id === id ? { ...e, ...updates } : e))
  mutateKey(KEYS.journal)
}

export function deleteJournalEntry(id: string) {
  const entries = getJournal()
  setStore(KEYS.journal, entries.filter(e => e.id !== id))
  mutateKey(KEYS.journal)
}

export function getJournalEntriesByGoal(goalId: string): JournalEntry[] {
  return getJournal().filter(e => e.linkedGoalId === goalId)
}

export function getJournalEntriesByType(type: JournalEntry["type"]): JournalEntry[] {
  return getJournal().filter(e => e.type === type)
}
