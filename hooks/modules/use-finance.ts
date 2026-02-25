// ============================================
// FINANCE HOOKS
// ============================================

"use client"

import useSWR from "swr"
import * as localStore from "@/lib/store"
import type { Account, Transaction, FinancialGoal, Budget, FinancialStats } from "@/lib/types"

const ACCOUNTS_KEY = "accounts"
const TRANSACTIONS_KEY = "transactions"
const FINANCIAL_GOALS_KEY = "financialGoals"
const BUDGETS_KEY = "budgets"

// Accounts
export function useAccounts() {
  return useSWR(ACCOUNTS_KEY, localStore.getAccounts, { revalidateOnFocus: false })
}

export function useCreateAccount() {
  return async (account: Omit<Account, "id" | "userId" | "createdAt" | "updatedAt">) => {
    return localStore.addAccount(account)
  }
}

export function useUpdateAccount() {
  return async (id: string, updates: Partial<Account>) => {
    localStore.updateAccount(id, updates)
  }
}

export function useDeleteAccount() {
  return async (id: string) => {
    localStore.deleteAccount(id)
  }
}

// Transactions
export function useTransactions() {
  return useSWR(TRANSACTIONS_KEY, localStore.getTransactions, { revalidateOnFocus: false })
}

export function useCreateTransaction() {
  return async (transaction: Omit<Transaction, "id" | "userId" | "createdAt">) => {
    return localStore.addTransaction(transaction)
  }
}

export function useDeleteTransaction() {
  return async (id: string) => {
    localStore.deleteTransaction(id)
  }
}

export function useTransactionsByAccount(accountId: string) {
  return useSWR(
    `${TRANSACTIONS_KEY}/account/${accountId}`,
    () => localStore.getTransactionsByAccount(accountId),
    { revalidateOnFocus: false }
  )
}

// Financial Goals
export function useFinancialGoals() {
  return useSWR(FINANCIAL_GOALS_KEY, localStore.getFinancialGoals, { revalidateOnFocus: false })
}

export function useCreateFinancialGoal() {
  return async (goal: Omit<FinancialGoal, "id" | "userId" | "currentAmount" | "isCompleted" | "completedAt" | "createdAt" | "updatedAt">) => {
    return localStore.addFinancialGoal(goal)
  }
}

export function useUpdateFinancialGoal() {
  return async (id: string, updates: Partial<FinancialGoal>) => {
    localStore.updateFinancialGoal(id, updates)
  }
}

export function useDeleteFinancialGoal() {
  return async (id: string) => {
    localStore.deleteFinancialGoal(id)
  }
}

export function useContributeToGoal() {
  return async (goalId: string, amount: number) => {
    return localStore.contributeToGoal(goalId, amount)
  }
}

// Budgets
export function useBudgets() {
  return useSWR(BUDGETS_KEY, localStore.getBudgets, { revalidateOnFocus: false })
}

export function useCreateBudget() {
  return async (budget: Omit<Budget, "id" | "userId">) => {
    return localStore.addBudget(budget)
  }
}

export function useUpdateBudget() {
  return async (id: string, updates: Partial<Budget>) => {
    localStore.updateBudget(id, updates)
  }
}

export function useDeleteBudget() {
  return async (id: string) => {
    localStore.deleteBudget(id)
  }
}

// Stats
export function useFinancialStats() {
  return useSWR("financialStats", localStore.getFinancialStats, { revalidateOnFocus: false })
}

export function useExpensesByCategory() {
  return useSWR("expensesByCategory", localStore.getExpensesByCategory, { revalidateOnFocus: false })
}
