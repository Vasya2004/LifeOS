// ============================================
// REFLECTION HOOKS
// ============================================

"use client"

import useSWR from "swr"
import * as localStore from "@/lib/store"
import type { DailyReview, WeeklyReview, JournalEntry } from "@/lib/types"

const DAILY_REVIEWS_KEY = "dailyReviews"
const WEEKLY_REVIEWS_KEY = "weeklyReviews"
const JOURNAL_KEY = "journal"

// Daily Reviews
export function useDailyReviews() {
  return useSWR(DAILY_REVIEWS_KEY, localStore.getDailyReviews, { revalidateOnFocus: false })
}

export function useDailyReview(date: string) {
  return useSWR(
    `${DAILY_REVIEWS_KEY}/${date}`,
    () => localStore.getDailyReview(date),
    { revalidateOnFocus: false }
  )
}

export function useSaveDailyReview() {
  return async (review: DailyReview) => {
    localStore.saveDailyReview(review)
  }
}

export function useDeleteDailyReview() {
  return async (date: string) => {
    localStore.deleteDailyReview(date)
  }
}

// Weekly Reviews
export function useWeeklyReviews() {
  return useSWR(WEEKLY_REVIEWS_KEY, localStore.getWeeklyReviews, { revalidateOnFocus: false })
}

export function useWeeklyReview(weekStart: string) {
  return useSWR(
    `${WEEKLY_REVIEWS_KEY}/${weekStart}`,
    () => localStore.getWeeklyReview(weekStart),
    { revalidateOnFocus: false }
  )
}

export function useSaveWeeklyReview() {
  return async (review: WeeklyReview) => {
    localStore.saveWeeklyReview(review)
  }
}

// Journal
export function useJournal() {
  return useSWR(JOURNAL_KEY, localStore.getJournal, { revalidateOnFocus: false })
}

export function useCreateJournalEntry() {
  return async (entry: Omit<JournalEntry, "id" | "timestamp">) => {
    return localStore.addJournalEntry(entry)
  }
}

export function useUpdateJournalEntry() {
  return async (id: string, updates: Partial<JournalEntry>) => {
    localStore.updateJournalEntry(id, updates)
  }
}

export function useDeleteJournalEntry() {
  return async (id: string) => {
    localStore.deleteJournalEntry(id)
  }
}

export function useJournalEntriesByGoal(goalId: string) {
  return useSWR(
    `${JOURNAL_KEY}/goal/${goalId}`,
    () => localStore.getJournalEntriesByGoal(goalId),
    { revalidateOnFocus: false }
  )
}
