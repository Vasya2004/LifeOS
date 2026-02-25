import { describe, it, expect, beforeEach, vi } from "vitest"
import {
  getIdentity,
  updateIdentity,
  getStats,
  addXp,
  addCoins,
  getLevelName,
} from "../lib/store"
import {
  calculateXpNeeded,
  getSkillTier,
} from "../lib/types"

// Mock SWR
vi.mock("swr", () => ({
  mutate: vi.fn(),
}))

describe("Store", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe("Identity", () => {
    it("should return default identity", () => {
      const identity = getIdentity()
      expect(identity.name).toBe("Игрок 1")
      expect(identity.vision).toBe("")
      expect(identity.mission).toBe("")
    })

    it("should update identity", () => {
      updateIdentity({ name: "Test User", vision: "Test Vision" })
      const identity = getIdentity()
      expect(identity.name).toBe("Test User")
      expect(identity.vision).toBe("Test Vision")
    })
  })

  describe("Stats & Gamification", () => {
    it("should return default stats", () => {
      const stats = getStats()
      expect(stats.level).toBe(1)
      expect(stats.xp).toBe(0)
      expect(stats.coins).toBe(0)
    })

    it("should add XP", () => {
      addXp(500)
      const stats = getStats()
      expect(stats.xp).toBe(500)
    })

    it("should level up when XP exceeds threshold", () => {
      addXp(1000) // xpToNext for level 1
      const stats = getStats()
      expect(stats.level).toBe(2)
      expect(stats.xp).toBe(0)
    })

    it("should add coins", () => {
      addCoins(100)
      const stats = getStats()
      expect(stats.coins).toBe(100)
      expect(stats.totalCoinsEarned).toBe(100)
    })

    it("should return correct level names", () => {
      expect(getLevelName(1)).toBe("Новичок")
      expect(getLevelName(5)).toBe("Ученик")
      expect(getLevelName(10)).toBe("Адепт")
      expect(getLevelName(20)).toBe("Ветеран")
      expect(getLevelName(30)).toBe("Эксперт")
      expect(getLevelName(40)).toBe("Мастер")
      expect(getLevelName(50)).toBe("Легенда")
    })
  })

  describe("Skills", () => {
    it("should calculate XP needed for levels correctly", () => {
      expect(calculateXpNeeded(1)).toBe(3)
      expect(calculateXpNeeded(2)).toBe(5)
      expect(calculateXpNeeded(3)).toBe(8)
      expect(calculateXpNeeded(4)).toBe(12)
      expect(calculateXpNeeded(5)).toBe(15)
      expect(calculateXpNeeded(10)).toBe(20)
    })

    it("should return correct skill tiers", () => {
      const novice = getSkillTier(1)
      expect(novice.title).toBe("Новичок")
      expect(novice.requiresCertificate).toBe(false)

      const expert = getSkillTier(5)
      expect(expert.title).toBe("Эксперт")
      expect(expert.requiresCertificate).toBe(true)

      const legend = getSkillTier(10)
      expect(legend.title).toBe("Легенда")
      expect(legend.requiresCertificate).toBe(true)
    })
  })
})
