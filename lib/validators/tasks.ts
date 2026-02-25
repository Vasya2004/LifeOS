// ============================================
// TASKS VALIDATORS
// ============================================

import { z } from "zod"
import { idSchema, dateOnlySchema, priorityStringSchema, taskStatusSchema, energyLevelSchema, energyTypeSchema } from "./common"

// Create task schema
export const createTaskSchema = z.object({
  projectId: idSchema.optional(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  scheduledDate: dateOnlySchema,
  scheduledTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  duration: z.number().int().min(1).max(1440).optional(), // minutes
  status: taskStatusSchema.default("todo"),
  priority: priorityStringSchema.default("medium"),
  energyCost: energyLevelSchema.default("medium"),
  energyType: energyTypeSchema.default("mental"),
  notes: z.string().max(1000).optional(),
})

// Update task schema
export const updateTaskSchema = createTaskSchema.partial().extend({
  id: idSchema,
})

// Complete task schema
export const completeTaskSchema = z.object({
  id: idSchema,
  actualDuration: z.number().int().min(1).optional(),
  notes: z.string().max(1000).optional(),
})

// Task filters schema
export const taskFiltersSchema = z.object({
  status: taskStatusSchema.optional(),
  priority: priorityStringSchema.optional(),
  dateFrom: dateOnlySchema.optional(),
  dateTo: dateOnlySchema.optional(),
  projectId: idSchema.optional(),
  search: z.string().optional(),
})

// Bulk update schema
export const bulkUpdateTasksSchema = z.object({
  ids: z.array(idSchema).min(1),
  updates: z.object({
    status: taskStatusSchema.optional(),
    priority: priorityStringSchema.optional(),
    scheduledDate: dateOnlySchema.optional(),
  }).refine(data => Object.keys(data).length > 0, "At least one field must be provided"),
})

// Export types
export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>
export type TaskFilters = z.infer<typeof taskFiltersSchema>
export type BulkUpdateTasksInput = z.infer<typeof bulkUpdateTasksSchema>
