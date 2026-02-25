// ============================================
// FINANCE VALIDATORS
// ============================================

import { z } from "zod"
import { idSchema, colorSchema } from "./common"

// Account types
export const accountTypeSchema = z.enum(["cash", "bank", "investment", "crypto", "debt"])

// Transaction types
export const transactionTypeSchema = z.enum(["income", "expense", "transfer"])

// Create account schema
export const createAccountSchema = z.object({
  name: z.string().min(1).max(100),
  type: accountTypeSchema,
  balance: z.number().default(0),
  currency: z.string().min(3).max(3).default("USD"),
  color: colorSchema.optional(),
  icon: z.string().max(50).optional(),
  isActive: z.boolean().default(true),
})

// Update account schema
export const updateAccountSchema = createAccountSchema.partial().extend({
  id: idSchema,
})

// Create transaction schema
export const createTransactionSchema = z.object({
  accountId: idSchema,
  type: transactionTypeSchema,
  amount: z.number().positive().max(999999999),
  category: z.string().min(1).max(50),
  description: z.string().max(500).optional(),
  transactionDate: z.string().datetime(),
  relatedGoalId: idSchema.optional(),
})

// Create financial goal schema
export const createFinancialGoalSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  targetAmount: z.number().positive(),
  deadline: z.string().datetime().optional(),
  category: z.enum(["savings", "investment", "debt_payment", "purchase", "emergency_fund"]),
})

// Contribute to goal schema
export const contributeToGoalSchema = z.object({
  goalId: idSchema,
  amount: z.number().positive(),
  accountId: idSchema.optional(), // Source account
})

// Create budget schema
export const createBudgetSchema = z.object({
  category: z.string().min(1).max(50),
  limit: z.number().positive(),
  period: z.enum(["weekly", "monthly", "yearly"]).default("monthly"),
  startDate: z.string().datetime(),
  isActive: z.boolean().default(true),
})

// Transaction filters
export const transactionFiltersSchema = z.object({
  accountId: idSchema.optional(),
  type: transactionTypeSchema.optional(),
  category: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  minAmount: z.number().optional(),
  maxAmount: z.number().optional(),
})

// Export types
export type CreateAccountInput = z.infer<typeof createAccountSchema>
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>
export type CreateFinancialGoalInput = z.infer<typeof createFinancialGoalSchema>
export type ContributeToGoalInput = z.infer<typeof contributeToGoalSchema>
export type CreateBudgetInput = z.infer<typeof createBudgetSchema>
export type TransactionFilters = z.infer<typeof transactionFiltersSchema>
