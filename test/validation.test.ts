import { describe, it, expect } from "vitest"
import { z } from "zod"

// Test schemas from validation.ts
const lifeAreaSchema = z.object({
  name: z.string().min(1).max(100),
  vision: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
})

const goalSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  targetDate: z.string().datetime(),
})

describe("Validation", () => {
  describe("Life Area Schema", () => {
    it("should validate correct life area", () => {
      const result = lifeAreaSchema.safeParse({
        name: "Health",
        vision: "Be healthy",
        color: "#22c55e",
      })
      expect(result.success).toBe(true)
    })

    it("should reject empty name", () => {
      const result = lifeAreaSchema.safeParse({
        name: "",
        color: "#22c55e",
      })
      expect(result.success).toBe(false)
    })

    it("should reject invalid color", () => {
      const result = lifeAreaSchema.safeParse({
        name: "Health",
        color: "invalid",
      })
      expect(result.success).toBe(false)
    })

    it("should reject name too long", () => {
      const result = lifeAreaSchema.safeParse({
        name: "a".repeat(101),
        color: "#22c55e",
      })
      expect(result.success).toBe(false)
    })
  })

  describe("Goal Schema", () => {
    it("should validate correct goal", () => {
      const result = goalSchema.safeParse({
        title: "Learn TypeScript",
        description: "Master TS in 3 months",
        targetDate: "2024-12-31T00:00:00Z",
      })
      expect(result.success).toBe(true)
    })

    it("should reject invalid date", () => {
      const result = goalSchema.safeParse({
        title: "Test Goal",
        targetDate: "not-a-date",
      })
      expect(result.success).toBe(false)
    })
  })
})
