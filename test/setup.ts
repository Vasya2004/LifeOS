import { expect, afterEach, vi } from "vitest"
// import { cleanup } from "@testing-library/react"
// import * as matchers from "@testing-library/jest-dom/matchers"

// expect.extend(matchers)

// Working localStorage mock with in-memory storage
const localStorageStore = new Map<string, string>()

const localStorageMock = {
  getItem: vi.fn((key: string) => localStorageStore.get(key) || null),
  setItem: vi.fn((key: string, value: string) => localStorageStore.set(key, value)),
  removeItem: vi.fn((key: string) => localStorageStore.delete(key)),
  clear: vi.fn(() => localStorageStore.clear()),
}

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
})

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

afterEach(() => {
  // cleanup()
  localStorageStore.clear()
  vi.clearAllMocks()
})
