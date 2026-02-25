// ============================================
// VALIDATORS INDEX
// ============================================

// Common
export * from "./common"

// Feature validators
export * from "./goals"
export * from "./tasks"
export * from "./habits"
export * from "./skills"
export * from "./finance"

// Helper function for consistent error responses
import { ZodError } from "zod"

export function formatZodError(error: ZodError) {
  return error.errors.map(err => ({
    path: err.path.join("."),
    message: err.message,
  }))
}
