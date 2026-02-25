// ============================================
// HABITS VALIDATORS
// ============================================

import { z } from "zod"
import { idSchema, dateOnlySchema, energyTypeSchema } from "./common"

// Habit entry schema
export const habitEntrySchema = z.object({
  date: dateOnlySchema,
  completed: z.boolean(),
  note: z.string().max(500).optional(),
})

// Create habit schema
export const createHabitSchema = z.object({
  areaId: idSchema,
  title: z.string().min(1).max(200),
  description: z.string().max(1000).default(""),
  frequency: z.enum(["daily", "weekly", "custom"]).default("daily"),
  targetDays: z.array(z.number().int().min(0).max(6)).default([0, 1, 2, 3, 4, 5, 6]),
  targetCount: z.number().int().min(1).max(7).optional(),
  energyImpact: z.number().int().min(-50).max(50).default(0),
  energyType: energyTypeSchema.default("physical"),
  xpReward: z.number().int().min(1).max(100).default(10),
})

// Update habit schema
export const updateHabitSchema = createHabitSchema.partial().extend({
  id: idSchema,
})

// Toggle entry schema
export const toggleHabitEntrySchema = z.object({
  habitId: idSchema,
  date: dateOnlySchema,
  completed: z.boolean(),
  note: z.string().max(500).optional(),
})

// Habit filters
export const habitFiltersSchema = z.object({
  areaId: idSchema.optional(),
  frequency: z.enum(["daily", "weekly", "custom"]).optional(),
  active: z.boolean().optional(),
})

// Export types
export type CreateHabitInput = z.infer<typeof createHabitSchema>
export type UpdateHabitInput = z.infer<typeof updateHabitSchema>
export type ToggleHabitEntryInput = z.infer<typeof toggleHabitEntrySchema>
export type HabitFilters = z.infer<typeof habitFiltersSchema>
