// ============================================
// COMMON VALIDATORS
// ============================================

import { z } from "zod"

// ID schema
export const idSchema = z.string().uuid()

// Date schemas
export const dateSchema = z.string().datetime()
export const dateOnlySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)

// Color schema
export const colorSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/)

// Priority schemas
export const priorityNumberSchema = z.number().int().min(1).max(5)
export const priorityStringSchema = z.enum(["low", "medium", "high", "critical"])

// Status schemas
export const goalStatusSchema = z.enum(["active", "completed", "paused", "dropped"])
export const taskStatusSchema = z.enum(["todo", "in_progress", "completed", "cancelled"])
export const projectStatusSchema = z.enum(["planning", "active", "completed", "on_hold"])

// Energy schemas
export const energyLevelSchema = z.enum(["low", "medium", "high"])
export const energyTypeSchema = z.enum(["physical", "mental", "emotional", "creative"])

// Difficulty schema
export const difficultySchema = z.enum(["easy", "medium", "hard", "epic"])

// Pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

// Sort schema
export const sortSchema = z.object({
  sortBy: z.string().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
})
