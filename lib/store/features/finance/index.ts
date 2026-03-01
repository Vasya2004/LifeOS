// ============================================
// FINANCE FEATURE MODULE
// ============================================

import type { Account, Transaction, FinancialGoal, Budget, FinancialStats } from "@/lib/types"
import { getStore, setStore, KEYS, mutateKey, genId, now } from "@/lib/store/core"

// ============================================
// ACCOUNTS
// ============================================

export function getAccounts(): Account[] {
  return getStore(KEYS.accounts, [])
}

export function getAccountById(id: string): Account | undefined {
  return getAccounts().find(a => a.id === id)
}

export function addAccount(
  account: Omit<Account, "id" | "createdAt" | "updatedAt" | "userId"> & { userId?: string }
): Account {
  const accounts = getAccounts()
  const newAccount: Account = {
    ...account,
    id: genId(),
    userId: account.userId || "",
    createdAt: now(),
    updatedAt: now(),
  }
  const updated = [...accounts, newAccount]
  setStore(KEYS.accounts, updated)
  mutateKey(KEYS.accounts, updated)
  return newAccount
}

export function updateAccount(id: string, updates: Partial<Account>) {
  const accounts = getAccounts()
  const updated = accounts.map(a => a.id === id ? { ...a, ...updates, updatedAt: now() } : a)
  setStore(KEYS.accounts, updated)
  mutateKey(KEYS.accounts, updated)
}

export function deleteAccount(id: string) {
  const accounts = getAccounts()
  const updated = accounts.filter(a => a.id !== id)
  setStore(KEYS.accounts, updated)
  mutateKey(KEYS.accounts, updated)
}

// ============================================
// TRANSACTIONS
// ============================================

export function getTransactions(): Transaction[] {
  return getStore(KEYS.transactions, [])
}

export function getTransactionById(id: string): Transaction | undefined {
  return getTransactions().find(t => t.id === id)
}

export function addTransaction(
  transaction: Omit<Transaction, "id" | "createdAt" | "userId"> & { userId?: string }
): Transaction {
  const transactions = getTransactions()
  const newTransaction: Transaction = {
    ...transaction,
    id: genId(),
    userId: transaction.userId || "",
    createdAt: now(),
  }
  const updated = [...transactions, newTransaction]
  setStore(KEYS.transactions, updated)
  mutateKey(KEYS.transactions, updated)
  
  // Update account balance
  const account = getAccountById(transaction.accountId)
  if (account) {
    const delta = transaction.type === "income" ? transaction.amount : -transaction.amount
    updateAccount(account.id, { balance: account.balance + delta })
  }
  
  return newTransaction
}

export function updateTransaction(id: string, updates: Partial<Transaction>) {
  const transactions = getTransactions()
  const transaction = transactions.find(t => t.id === id)
  if (!transaction) return
  
  const updated = transactions.map(t => t.id === id ? { ...t, ...updates } : t)
  setStore(KEYS.transactions, updated)
  mutateKey(KEYS.transactions, updated)
}

export function deleteTransaction(id: string) {
  const transaction = getTransactionById(id)
  if (transaction) {
    // Revert account balance
    const account = getAccountById(transaction.accountId)
    if (account) {
      const delta = transaction.type === "income" ? -transaction.amount : transaction.amount
      updateAccount(account.id, { balance: account.balance + delta })
    }
  }
  
  const transactions = getTransactions()
  const updated = transactions.filter(t => t.id !== id)
  setStore(KEYS.transactions, updated)
  mutateKey(KEYS.transactions, updated)
}

export function getTransactionsByAccount(accountId: string): Transaction[] {
  return getTransactions().filter(t => t.accountId === accountId)
}

export function getTransactionsByDateRange(from: string, to: string): Transaction[] {
  return getTransactions().filter(t => t.transactionDate >= from && t.transactionDate <= to)
}

// ============================================
// FINANCIAL GOALS
// ============================================

export function getFinancialGoals(): FinancialGoal[] {
  return getStore(KEYS.financialGoals, [])
}

export function getFinancialGoalById(id: string): FinancialGoal | undefined {
  return getFinancialGoals().find(g => g.id === id)
}

export function addFinancialGoal(
  goal: Omit<FinancialGoal, "id" | "createdAt" | "updatedAt" | "userId" | "currentAmount" | "isCompleted" | "completedAt"> 
    & { userId?: string; currentAmount?: number; isCompleted?: boolean; completedAt?: string }
): FinancialGoal {
  const goals = getFinancialGoals()
  const newGoal: FinancialGoal = {
    ...goal,
    id: genId(),
    userId: goal.userId || "",
    currentAmount: goal.currentAmount || 0,
    isCompleted: goal.isCompleted || false,
    completedAt: goal.completedAt,
    createdAt: now(),
    updatedAt: now(),
  }
  const updated = [...goals, newGoal]
  setStore(KEYS.financialGoals, updated)
  mutateKey(KEYS.financialGoals, updated)
  return newGoal
}

export function updateFinancialGoal(id: string, updates: Partial<FinancialGoal>) {
  const goals = getFinancialGoals()
  const updated = goals.map(g => g.id === id ? { ...g, ...updates, updatedAt: now() } : g)
  setStore(KEYS.financialGoals, updated)
  mutateKey(KEYS.financialGoals, updated)
}

export function deleteFinancialGoal(id: string) {
  const goals = getFinancialGoals()
  const updated = goals.filter(g => g.id !== id)
  setStore(KEYS.financialGoals, updated)
  mutateKey(KEYS.financialGoals, updated)
}

export interface ContributeGoalResult {
  success: boolean
  newProgress: number
  error?: string
}

export function contributeToGoal(id: string, amount: number): ContributeGoalResult {
  const goal = getFinancialGoalById(id)
  if (!goal) {
    return { success: false, newProgress: 0, error: "Goal not found" }
  }
  
  const newAmount = Math.min(goal.currentAmount + amount, goal.targetAmount)
  const isCompleted = newAmount >= goal.targetAmount
  
  updateFinancialGoal(id, {
    currentAmount: newAmount,
    isCompleted,
    completedAt: isCompleted && !goal.isCompleted ? now() : goal.completedAt,
  })
  
  return { success: true, newProgress: newAmount }
}

// ============================================
// BUDGETS
// ============================================

export function getBudgets(): Budget[] {
  return getStore(KEYS.budgets, [])
}

export function addBudget(
  budget: Omit<Budget, "id" | "userId"> & { userId?: string }
): Budget {
  const budgets = getBudgets()
  const newBudget: Budget = {
    ...budget,
    id: genId(),
    userId: budget.userId || "",
  }
  const updated = [...budgets, newBudget]
  setStore(KEYS.budgets, updated)
  mutateKey(KEYS.budgets, updated)
  return newBudget
}

export function updateBudget(id: string, updates: Partial<Budget>) {
  const budgets = getBudgets()
  const updated = budgets.map(b => b.id === id ? { ...b, ...updates } : b)
  setStore(KEYS.budgets, updated)
  mutateKey(KEYS.budgets, updated)
}

export function deleteBudget(id: string) {
  const budgets = getBudgets()
  const updated = budgets.filter(b => b.id !== id)
  setStore(KEYS.budgets, updated)
  mutateKey(KEYS.budgets, updated)
}

// ============================================
// STATS
// ============================================

export function getFinancialStats(): FinancialStats {
  const accounts = getAccounts()
  const transactions = getTransactions()
  
  const totalAssets = accounts
    .filter(a => a.type !== "debt")
    .reduce((sum, a) => sum + a.balance, 0)
  
  const totalLiabilities = accounts
    .filter(a => a.type === "debt")
    .reduce((sum, a) => sum + a.balance, 0)
  
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  
  const monthlyTransactions = transactions.filter(t => t.transactionDate >= monthStart)
  const monthlyIncome = monthlyTransactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0)
  const monthlyExpenses = monthlyTransactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0)
  
  return {
    totalAssets,
    totalLiabilities,
    netWorth: totalAssets - totalLiabilities,
    monthlyIncome,
    monthlyExpenses,
    monthlySavings: monthlyIncome - monthlyExpenses,
    savingsRate: monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0,
  }
}

export function getExpensesByCategory(): Record<string, number> {
  const transactions = getTransactions()
  const expenses = transactions.filter(t => t.type === "expense")
  
  return expenses.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount
    return acc
  }, {} as Record<string, number>)
}
