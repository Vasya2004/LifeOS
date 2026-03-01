// ============================================
// REFLECTION FEATURE MODULE
// ============================================

import type { DailyReview, WeeklyReview, JournalEntry } from "@/lib/types"
import { getStore, setStore, KEYS, mutateKey, genId, now } from "@/lib/store/core"

// ============================================
// DAILY REVIEWS
// ============================================

export function getDailyReviews(): DailyReview[] {
  return getStore(KEYS.dailyReviews, [])
}

export function getDailyReview(date: string): DailyReview | undefined {
  return getDailyReviews().find(r => r.date === date)
}

export function saveDailyReview(review: DailyReview): DailyReview {
  const reviews = getDailyReviews()
  const existingIndex = reviews.findIndex(r => r.date === review.date)
  
  let updated: DailyReview[]
  if (existingIndex >= 0) {
    updated = reviews.map(r => r.date === review.date ? review : r)
  } else {
    updated = [...reviews, review]
  }
  
  setStore(KEYS.dailyReviews, updated)
  mutateKey(KEYS.dailyReviews, updated)
  return review
}

export function deleteDailyReview(date: string) {
  const reviews = getDailyReviews()
  const updated = reviews.filter(r => r.date !== date)
  setStore(KEYS.dailyReviews, updated)
  mutateKey(KEYS.dailyReviews, updated)
}

// ============================================
// WEEKLY REVIEWS
// ============================================

export function getWeeklyReviews(): WeeklyReview[] {
  return getStore(KEYS.weeklyReviews, [])
}

export function getWeeklyReview(weekStart: string): WeeklyReview | undefined {
  return getWeeklyReviews().find(r => r.weekStart === weekStart)
}

export function saveWeeklyReview(review: WeeklyReview): WeeklyReview {
  const reviews = getWeeklyReviews()
  const existingIndex = reviews.findIndex(r => r.weekStart === review.weekStart)
  
  let updated: WeeklyReview[]
  if (existingIndex >= 0) {
    updated = reviews.map(r => r.weekStart === review.weekStart ? review : r)
  } else {
    updated = [...reviews, review]
  }
  
  setStore(KEYS.weeklyReviews, updated)
  mutateKey(KEYS.weeklyReviews, updated)
  return review
}

// ============================================
// JOURNAL
// ============================================

export function getJournal(): JournalEntry[] {
  return getStore(KEYS.journal, [])
}

export function getJournalEntryById(id: string): JournalEntry | undefined {
  return getJournal().find(e => e.id === id)
}

export function addJournalEntry(entry: Omit<JournalEntry, "id" | "timestamp">): JournalEntry {
  const entries = getJournal()
  const newEntry: JournalEntry = {
    ...entry,
    id: genId(),
    timestamp: now(),
  }
  const updated = [...entries, newEntry]
  setStore(KEYS.journal, updated)
  mutateKey(KEYS.journal, updated)
  return newEntry
}

export function updateJournalEntry(id: string, updates: Partial<JournalEntry>) {
  const entries = getJournal()
  const updated = entries.map(e => e.id === id ? { ...e, ...updates } : e)
  setStore(KEYS.journal, updated)
  mutateKey(KEYS.journal, updated)
}

export function deleteJournalEntry(id: string) {
  const entries = getJournal()
  const updated = entries.filter(e => e.id !== id)
  setStore(KEYS.journal, updated)
  mutateKey(KEYS.journal, updated)
}

export function getJournalEntriesByGoal(goalId: string): JournalEntry[] {
  return getJournal().filter(e => e.linkedGoalId === goalId)
}

export function getJournalEntriesByType(type: JournalEntry["type"]): JournalEntry[] {
  return getJournal().filter(e => e.type === type)
}
