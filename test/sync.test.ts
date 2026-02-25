import { describe, it, expect, beforeEach, vi } from "vitest"
import { hasPendingChanges, getLastSyncAt, markPendingChanges } from "../lib/sync"

// Mock localStorage with in-memory storage
const mockStorage: Record<string, string> = {}

Object.defineProperty(window, "localStorage", {
  value: {
    getItem: (key: string) => mockStorage[key] || null,
    setItem: (key: string, value: string) => { mockStorage[key] = value },
    removeItem: (key: string) => { delete mockStorage[key] },
    clear: () => { Object.keys(mockStorage).forEach(key => delete mockStorage[key]) },
  },
})

describe("Sync", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("should return no pending changes by default", () => {
    expect(hasPendingChanges()).toBe(false)
  })

  it("should return no last sync by default", () => {
    expect(getLastSyncAt()).toBeNull()
  })

  it("should mark pending changes", () => {
    markPendingChanges()
    expect(hasPendingChanges()).toBe(true)
  })
})
