// ============================================
// GOALS VALIDATORS
// ============================================

import { z } from "zod"
import { idSchema, dateOnlySchema, priorityNumberSchema, goalStatusSchema, colorSchema } from "./common"

// Milestone schema
export const milestoneSchema = z.object({
  id: idSchema,
  title: z.string().min(1).max(200),
  targetDate: dateOnlySchema,
  isCompleted: z.boolean(),
  completedAt: dateOnlySchema.optional(),
})

// Create goal schema
export const createGoalSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).default(""),
  areaId: idSchema,
  type: z.enum(["outcome", "process"]).default("outcome"),
  status: goalStatusSchema.default("active"),
  priority: priorityNumberSchema.default(3),
  targetDate: dateOnlySchema,
  startedAt: dateOnlySchema.default(() => new Date().toISOString().split("T")[0]),
  progress: z.number().int().min(0).max(100).default(0),
  milestones: z.array(milestoneSchema).default([]),
  relatedValues: z.array(idSchema).default([]),
  relatedRoles: z.array(idSchema).default([]),
})

// Update goal schema
export const updateGoalSchema = createGoalSchema.partial().extend({
  id: idSchema,
})

// Update progress schema
export const updateProgressSchema = z.object({
  id: idSchema,
  progress: z.number().int().min(0).max(100),
})

// Goal filters schema
export const goalFiltersSchema = z.object({
  status: goalStatusSchema.optional(),
  areaId: idSchema.optional(),
  priority: priorityNumberSchema.optional(),
  search: z.string().optional(),
})

// Export types
export type CreateGoalInput = z.infer<typeof createGoalSchema>
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>
export type GoalFilters = z.infer<typeof goalFiltersSchema>
