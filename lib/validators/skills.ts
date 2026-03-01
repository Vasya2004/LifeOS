// ============================================
// SKILLS VALIDATORS
// ============================================

import { z } from "zod"
import { idSchema, colorSchema } from "./common"

// Activity type
export const skillActivityTypeSchema = z.enum(["theory", "practice", "result"])

// Create skill schema
export const createSkillSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(1000).default(""),
  icon: z.string().min(1).max(50),
  color: colorSchema.default("#8b5cf6"),
  category: z.enum(["technical", "creative", "physical", "mental", "social", "professional", "languages", "other"]),
})

// Update skill schema
export const updateSkillSchema = createSkillSchema.partial().extend({
  id: idSchema,
})

// Add activity schema
export const addSkillActivitySchema = z.object({
  skillId: idSchema,
  description: z.string().min(1).max(500),
  xpAmount: z.number().int().min(1).max(3).default(1),
  activityType: skillActivityTypeSchema,
  proofUrl: z.string().url().optional(),
  proofRequired: z.boolean().default(false),
})

// Skill filters
export const skillFiltersSchema = z.object({
  category: z.string().optional(),
  minLevel: z.number().int().min(1).optional(),
  maxLevel: z.number().int().min(1).optional(),
  isDecaying: z.boolean().optional(),
})

// Export types
export type CreateSkillInput = z.infer<typeof createSkillSchema>
export type UpdateSkillInput = z.infer<typeof updateSkillSchema>
export type AddSkillActivityInput = z.infer<typeof addSkillActivitySchema>
export type SkillFilters = z.infer<typeof skillFiltersSchema>
