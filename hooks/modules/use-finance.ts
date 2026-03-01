// ============================================
// FINANCE HOOKS
// ============================================

"use client"

import useSWR from "swr"
import { useMemo } from "react"
import * as localStore from "@/lib/store"
import * as db from "@/lib/api/database"
import { addToQueue } from "@/lib/sync/offline-first"
import { setStore } from "@/lib/store/utils/storage"
import { useOfflineFirst } from "@/hooks/core/use-offline-first"
import { useAuth } from "@/lib/auth/context"
import type { Account, Transaction, FinancialGoal, Budget, FinancialStats } from "@/lib/types"

const ACCOUNTS_KEY = "accounts"
const TRANSACTIONS_KEY = "transactions"
const FINANCIAL_GOALS_KEY = "financialGoals"
const BUDGETS_KEY = "budgets"

// ============================================
// ACCOUNTS
// ============================================

export function useAccounts() {
  const { isAuthenticated, isGuest } = useAuth()

  return useOfflineFirst<Account[]>(ACCOUNTS_KEY, {
    storageKey: ACCOUNTS_KEY,
    getLocal: localStore.getAccounts,
    getServer: isAuthenticated && !isGuest ? db.getAccounts : undefined,
    setLocal: (data) => setStore(ACCOUNTS_KEY, data),
  })
}

export function useCreateAccount() {
  const { isAuthenticated, isGuest } = useAuth()

  return async (account: Omit<Account, "id" | "userId" | "createdAt" | "updatedAt">) => {
    const newAccount = localStore.addAccount(account)

    if (isAuthenticated && !isGuest) {
      addToQueue({ table: "accounts", operation: "insert", recordId: newAccount.id, data: newAccount as unknown as Record<string, unknown> })
    }

    return newAccount
  }
}

export function useUpdateAccount() {
  const { isAuthenticated, isGuest } = useAuth()

  return async (id: string, updates: Partial<Account>) => {
    localStore.updateAccount(id, updates)

    if (isAuthenticated && !isGuest) {
      const updated = { ...localStore.getAccounts().find(a => a.id === id), ...updates, id }
      addToQueue({ table: "accounts", operation: "update", recordId: id, data: updated as unknown as Record<string, unknown> })
    }
  }
}

export function useDeleteAccount() {
  const { isAuthenticated, isGuest } = useAuth()

  return async (id: string) => {
    localStore.deleteAccount(id)

    if (isAuthenticated && !isGuest) {
      addToQueue({ table: "accounts", operation: "delete", recordId: id })
    }
  }
}

// ============================================
// TRANSACTIONS
// ============================================

export function useTransactions() {
  const { isAuthenticated, isGuest } = useAuth()

  return useOfflineFirst<Transaction[]>(TRANSACTIONS_KEY, {
    storageKey: TRANSACTIONS_KEY,
    getLocal: localStore.getTransactions,
    getServer: isAuthenticated && !isGuest ? db.getTransactions : undefined,
    setLocal: (data) => setStore(TRANSACTIONS_KEY, data),
  })
}

export function useCreateTransaction() {
  const { isAuthenticated, isGuest } = useAuth()

  return async (transaction: Omit<Transaction, "id" | "userId" | "createdAt">) => {
    const newTransaction = localStore.addTransaction(transaction)

    if (isAuthenticated && !isGuest) {
      addToQueue({ table: "transactions", operation: "insert", recordId: newTransaction.id, data: newTransaction as unknown as Record<string, unknown> })
    }

    return newTransaction
  }
}

export function useDeleteTransaction() {
  const { isAuthenticated, isGuest } = useAuth()

  return async (id: string) => {
    localStore.deleteTransaction(id)

    if (isAuthenticated && !isGuest) {
      addToQueue({ table: "transactions", operation: "delete", recordId: id })
    }
  }
}

export function useTransactionsByAccount(accountId: string) {
  const { data: transactions } = useTransactions()

  return useMemo(
    () => ({ data: (transactions || []).filter(t => t.accountId === accountId) }),
    [transactions, accountId]
  )
}

// ============================================
// FINANCIAL GOALS
// ============================================

export function useFinancialGoals() {
  const { isAuthenticated, isGuest } = useAuth()

  return useOfflineFirst<FinancialGoal[]>(FINANCIAL_GOALS_KEY, {
    storageKey: FINANCIAL_GOALS_KEY,
    getLocal: localStore.getFinancialGoals,
    getServer: isAuthenticated && !isGuest ? db.getFinancialGoals : undefined,
    setLocal: (data) => setStore(FINANCIAL_GOALS_KEY, data),
  })
}

export function useCreateFinancialGoal() {
  const { isAuthenticated, isGuest } = useAuth()

  return async (goal: Omit<FinancialGoal, "id" | "userId" | "currentAmount" | "isCompleted" | "completedAt" | "createdAt" | "updatedAt">) => {
    const newGoal = localStore.addFinancialGoal(goal)

    if (isAuthenticated && !isGuest) {
      addToQueue({ table: "financial_goals", operation: "insert", recordId: newGoal.id, data: newGoal as unknown as Record<string, unknown> })
    }

    return newGoal
  }
}

export function useUpdateFinancialGoal() {
  const { isAuthenticated, isGuest } = useAuth()

  return async (id: string, updates: Partial<FinancialGoal>) => {
    localStore.updateFinancialGoal(id, updates)

    if (isAuthenticated && !isGuest) {
      const updated = { ...localStore.getFinancialGoals().find(g => g.id === id), ...updates, id }
      addToQueue({ table: "financial_goals", operation: "update", recordId: id, data: updated as unknown as Record<string, unknown> })
    }
  }
}

export function useDeleteFinancialGoal() {
  const { isAuthenticated, isGuest } = useAuth()

  return async (id: string) => {
    localStore.deleteFinancialGoal(id)

    if (isAuthenticated && !isGuest) {
      addToQueue({ table: "financial_goals", operation: "delete", recordId: id })
    }
  }
}

export function useContributeToGoal() {
  const { isAuthenticated, isGuest } = useAuth()

  return async (goalId: string, amount: number) => {
    const result = localStore.contributeToGoal(goalId, amount)

    if (isAuthenticated && !isGuest) {
      const updated = localStore.getFinancialGoals().find(g => g.id === goalId)
      if (updated) {
        addToQueue({ table: "financial_goals", operation: "update", recordId: goalId, data: updated as unknown as Record<string, unknown> })
      }
    }

    return result
  }
}

// ============================================
// BUDGETS
// ============================================

export function useBudgets() {
  const { isAuthenticated, isGuest } = useAuth()

  return useOfflineFirst<Budget[]>(BUDGETS_KEY, {
    storageKey: BUDGETS_KEY,
    getLocal: localStore.getBudgets,
    getServer: isAuthenticated && !isGuest ? db.getBudgets : undefined,
    setLocal: (data) => setStore(BUDGETS_KEY, data),
  })
}

export function useCreateBudget() {
  const { isAuthenticated, isGuest } = useAuth()

  return async (budget: Omit<Budget, "id" | "userId">) => {
    const newBudget = localStore.addBudget(budget)

    if (isAuthenticated && !isGuest) {
      addToQueue({ table: "budgets", operation: "insert", recordId: newBudget.id, data: newBudget as unknown as Record<string, unknown> })
    }

    return newBudget
  }
}

export function useUpdateBudget() {
  const { isAuthenticated, isGuest } = useAuth()

  return async (id: string, updates: Partial<Budget>) => {
    localStore.updateBudget(id, updates)

    if (isAuthenticated && !isGuest) {
      const updated = { ...localStore.getBudgets().find(b => b.id === id), ...updates, id }
      addToQueue({ table: "budgets", operation: "update", recordId: id, data: updated as unknown as Record<string, unknown> })
    }
  }
}

export function useDeleteBudget() {
  const { isAuthenticated, isGuest } = useAuth()

  return async (id: string) => {
    localStore.deleteBudget(id)

    if (isAuthenticated && !isGuest) {
      addToQueue({ table: "budgets", operation: "delete", recordId: id })
    }
  }
}

// ============================================
// COMPUTED STATS (client-side only — derived from local data)
// ============================================

export function useFinancialStats() {
  return useSWR("financialStats", localStore.getFinancialStats, { revalidateOnFocus: false })
}

export function useExpensesByCategory() {
  return useSWR("expensesByCategory", localStore.getExpensesByCategory, { revalidateOnFocus: false })
}

// Combined hook for AI advice and dashboard consumers
export function useFinanceData() {
  const { data: accounts } = useAccounts()
  const { data: transactions } = useTransactions()
  const { data: budgets } = useBudgets()

  const data = useMemo(() => ({
    accounts: accounts || [],
    transactions: transactions || [],
    budgets: budgets || [],
  }), [accounts, transactions, budgets])

  return { data }
}
