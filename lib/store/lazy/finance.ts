// ============================================
// FINANCE MODULE - Lazy Loading Wrapper
// ============================================
//
// This module provides async access to finance store functions.
// The actual module is loaded on first use via dynamic import.
//
// Usage:
//   import { getAccounts, addAccount } from "@/lib/store/lazy/finance"
//   const accounts = await getAccounts()
//
// ============================================

import type { Account, Transaction, FinancialGoal, Budget, FinancialStats } from "@/lib/types"
import { StoreRegistry } from "./registry"

// ============================================
// Accounts
// ============================================

export async function getAccounts(): Promise<Account[]> {
  const mod = await StoreRegistry.finance()
  return mod.getAccounts()
}

export async function getAccountById(id: string): Promise<Account | undefined> {
  const mod = await StoreRegistry.finance()
  return mod.getAccountById(id)
}

export async function addAccount(
  account: Omit<Account, "id" | "userId" | "createdAt" | "updatedAt">
): Promise<Account> {
  const mod = await StoreRegistry.finance()
  return mod.addAccount(account)
}

export async function updateAccount(id: string, updates: Partial<Account>): Promise<void> {
  const mod = await StoreRegistry.finance()
  return mod.updateAccount(id, updates)
}

export async function deleteAccount(id: string): Promise<void> {
  const mod = await StoreRegistry.finance()
  return mod.deleteAccount(id)
}

// ============================================
// Transactions
// ============================================

export async function getTransactions(): Promise<Transaction[]> {
  const mod = await StoreRegistry.finance()
  return mod.getTransactions()
}

export async function getTransactionById(id: string): Promise<Transaction | undefined> {
  const mod = await StoreRegistry.finance()
  return mod.getTransactionById(id)
}

export async function addTransaction(
  transaction: Omit<Transaction, "id" | "userId" | "createdAt">
): Promise<Transaction> {
  const mod = await StoreRegistry.finance()
  return mod.addTransaction(transaction)
}

export async function updateTransaction(id: string, updates: Partial<Transaction>): Promise<void> {
  const mod = await StoreRegistry.finance()
  return mod.updateTransaction(id, updates)
}

export async function deleteTransaction(id: string): Promise<void> {
  const mod = await StoreRegistry.finance()
  return mod.deleteTransaction(id)
}

export async function getTransactionsByAccount(accountId: string): Promise<Transaction[]> {
  const mod = await StoreRegistry.finance()
  return mod.getTransactionsByAccount(accountId)
}

export async function getTransactionsByDateRange(
  startDate: string,
  endDate: string
): Promise<Transaction[]> {
  const mod = await StoreRegistry.finance()
  return mod.getTransactionsByDateRange(startDate, endDate)
}

// ============================================
// Financial Goals
// ============================================

export async function getFinancialGoals(): Promise<FinancialGoal[]> {
  const mod = await StoreRegistry.finance()
  return mod.getFinancialGoals()
}

export async function getFinancialGoalById(id: string): Promise<FinancialGoal | undefined> {
  const mod = await StoreRegistry.finance()
  return mod.getFinancialGoalById(id)
}

export async function addFinancialGoal(
  goal: Omit<FinancialGoal, "id" | "userId" | "currentAmount" | "isCompleted" | "completedAt" | "createdAt" | "updatedAt">
): Promise<FinancialGoal> {
  const mod = await StoreRegistry.finance()
  return mod.addFinancialGoal(goal)
}

export async function updateFinancialGoal(id: string, updates: Partial<FinancialGoal>): Promise<void> {
  const mod = await StoreRegistry.finance()
  return mod.updateFinancialGoal(id, updates)
}

export async function deleteFinancialGoal(id: string): Promise<void> {
  const mod = await StoreRegistry.finance()
  return mod.deleteFinancialGoal(id)
}

export async function contributeToGoal(
  goalId: string,
  amount: number
): Promise<{ success: boolean; error?: string; newAmount?: number }> {
  const mod = await StoreRegistry.finance()
  return mod.contributeToGoal(goalId, amount)
}

// ============================================
// Budgets
// ============================================

export async function getBudgets(): Promise<Budget[]> {
  const mod = await StoreRegistry.finance()
  return mod.getBudgets()
}

export async function addBudget(
  budget: Omit<Budget, "id" | "userId">
): Promise<Budget> {
  const mod = await StoreRegistry.finance()
  return mod.addBudget(budget)
}

export async function updateBudget(id: string, updates: Partial<Budget>): Promise<void> {
  const mod = await StoreRegistry.finance()
  return mod.updateBudget(id, updates)
}

export async function deleteBudget(id: string): Promise<void> {
  const mod = await StoreRegistry.finance()
  return mod.deleteBudget(id)
}

// ============================================
// Statistics
// ============================================

export async function getFinancialStats(): Promise<FinancialStats> {
  const mod = await StoreRegistry.finance()
  return mod.getFinancialStats()
}

export async function getExpensesByCategory(): Promise<Record<string, number>> {
  const mod = await StoreRegistry.finance()
  return mod.getExpensesByCategory()
}

// ============================================
// Loading State
// ============================================

export function getLoadingState() {
  return StoreRegistry.getFinanceState()
}
