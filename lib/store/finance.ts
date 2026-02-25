// ============================================
// FINANCE MODULE
// ============================================

import type { Account, Transaction, FinancialGoal, Budget, FinancialStats } from "@/lib/types"
import { getCurrentUserId } from "@/lib/auth/user-id"
import { getStore, setStore, KEYS, mutateKey, genId, now } from "./core"
import { addXp, addCoins } from "./gamification"

// Accounts
export function getAccounts(): Account[] {
  return getStore(KEYS.accounts, [])
}

export function getAccountById(id: string): Account | undefined {
  return getAccounts().find(a => a.id === id)
}

export function addAccount(account: Omit<Account, "id" | "userId" | "createdAt" | "updatedAt">) {
  const accounts = getAccounts()
  const newAccount: Account = {
    ...account,
    id: genId(),
    userId: getCurrentUserId(),
    createdAt: now(),
    updatedAt: now(),
  }
  setStore(KEYS.accounts, [...accounts, newAccount])
  mutateKey(KEYS.accounts)
  addXp(20, "account_created")
  return newAccount
}

export function updateAccount(id: string, updates: Partial<Account>) {
  const accounts = getAccounts()
  setStore(KEYS.accounts, accounts.map(a => a.id === id ? { ...a, ...updates, updatedAt: now() } : a))
  mutateKey(KEYS.accounts)
}

export function deleteAccount(id: string) {
  const accounts = getAccounts()
  setStore(KEYS.accounts, accounts.filter(a => a.id !== id))
  mutateKey(KEYS.accounts)
}

// Transactions
export function getTransactions(): Transaction[] {
  return getStore(KEYS.transactions, [])
}

export function getTransactionById(id: string): Transaction | undefined {
  return getTransactions().find(t => t.id === id)
}

export function addTransaction(transaction: Omit<Transaction, "id" | "userId" | "createdAt">) {
  const transactions = getTransactions()
  const accounts = getAccounts()
  
  const newTransaction: Transaction = {
    ...transaction,
    id: genId(),
    userId: getCurrentUserId(),
    createdAt: now(),
  }
  
  // Update account balance
  const account = accounts.find(a => a.id === transaction.accountId)
  if (account) {
    const multiplier = transaction.type === "income" ? 1 : -1
    updateAccount(account.id, { balance: account.balance + transaction.amount * multiplier })
  }
  
  setStore(KEYS.transactions, [...transactions, newTransaction])
  mutateKey(KEYS.transactions)
  
  // XP rewards for financial discipline
  const xpReward = transaction.type === "expense" ? 5 : 10
  addXp(xpReward, "transaction_created")
  
  // Bonus XP for tracking expenses (financial discipline)
  if (transaction.type === "expense" && transaction.category !== "other_expense") {
    addCoins(1)
  }
  
  return newTransaction
}

export function updateTransaction(id: string, updates: Partial<Transaction>) {
  const transactions = getTransactions()
  const transaction = transactions.find(t => t.id === id)
  if (!transaction) return
  
  // Revert old balance change if account changed
  if (updates.accountId && updates.accountId !== transaction.accountId) {
    const accounts = getAccounts()
    const oldAccount = accounts.find(a => a.id === transaction.accountId)
    const newAccount = accounts.find(a => a.id === updates.accountId)
    
    if (oldAccount) {
      const oldMultiplier = transaction.type === "income" ? -1 : 1
      updateAccount(oldAccount.id, { balance: oldAccount.balance + transaction.amount * oldMultiplier })
    }
    if (newAccount && updates.amount) {
      const newMultiplier = (updates.type || transaction.type) === "income" ? 1 : -1
      updateAccount(newAccount.id, { balance: newAccount.balance + updates.amount * newMultiplier })
    }
  }
  
  setStore(KEYS.transactions, transactions.map(t => t.id === id ? { ...t, ...updates } : t))
  mutateKey(KEYS.transactions)
}

export function deleteTransaction(id: string) {
  const transactions = getTransactions()
  const transaction = transactions.find(t => t.id === id)
  
  if (transaction) {
    // Revert account balance
    const accounts = getAccounts()
    const account = accounts.find(a => a.id === transaction.accountId)
    if (account) {
      const multiplier = transaction.type === "income" ? -1 : 1
      updateAccount(account.id, { balance: account.balance + transaction.amount * multiplier })
    }
  }
  
  setStore(KEYS.transactions, transactions.filter(t => t.id !== id))
  mutateKey(KEYS.transactions)
}

export function getTransactionsByAccount(accountId: string): Transaction[] {
  return getTransactions().filter(t => t.accountId === accountId)
}

export function getTransactionsByDateRange(startDate: string, endDate: string): Transaction[] {
  return getTransactions().filter(t => 
    t.transactionDate >= startDate && t.transactionDate <= endDate
  )
}

// Financial Goals
export function getFinancialGoals(): FinancialGoal[] {
  return getStore(KEYS.financialGoals, [])
}

export function getFinancialGoalById(id: string): FinancialGoal | undefined {
  return getFinancialGoals().find(g => g.id === id)
}

export function addFinancialGoal(goal: Omit<FinancialGoal, "id" | "userId" | "currentAmount" | "isCompleted" | "completedAt" | "createdAt" | "updatedAt">) {
  const goals = getFinancialGoals()
  const newGoal: FinancialGoal = {
    ...goal,
    id: genId(),
    userId: getCurrentUserId(),
    currentAmount: 0,
    isCompleted: false,
    createdAt: now(),
    updatedAt: now(),
  }
  setStore(KEYS.financialGoals, [...goals, newGoal])
  mutateKey(KEYS.financialGoals)
  addXp(50, "financial_goal_created")
  return newGoal
}

export function updateFinancialGoal(id: string, updates: Partial<FinancialGoal>) {
  const goals = getFinancialGoals()
  const goal = goals.find(g => g.id === id)
  if (!goal) return
  
  const updated = { ...goal, ...updates, updatedAt: now() }
  
  // Check if goal is completed
  if (updated.currentAmount >= updated.targetAmount && !updated.isCompleted) {
    updated.isCompleted = true
    updated.completedAt = now()
    addXp(200, "financial_goal_completed")
    addCoins(50)
  }
  
  setStore(KEYS.financialGoals, goals.map(g => g.id === id ? updated : g))
  mutateKey(KEYS.financialGoals)
}

export function deleteFinancialGoal(id: string) {
  const goals = getFinancialGoals()
  setStore(KEYS.financialGoals, goals.filter(g => g.id !== id))
  mutateKey(KEYS.financialGoals)
}

export function contributeToGoal(goalId: string, amount: number): { success: boolean; error?: string; newAmount?: number } {
  const goal = getFinancialGoalById(goalId)
  if (!goal) return { success: false, error: "Goal not found" }
  
  const newAmount = goal.currentAmount + amount
  updateFinancialGoal(goalId, { currentAmount: newAmount })
  
  return { success: true, newAmount }
}

// Budgets
export function getBudgets(): Budget[] {
  return getStore(KEYS.budgets, [])
}

export function addBudget(budget: Omit<Budget, "id" | "userId">) {
  const budgets = getBudgets()
  const newBudget: Budget = {
    ...budget,
    id: genId(),
    userId: getCurrentUserId(),
  }
  setStore(KEYS.budgets, [...budgets, newBudget])
  mutateKey(KEYS.budgets)
  return newBudget
}

export function updateBudget(id: string, updates: Partial<Budget>) {
  const budgets = getBudgets()
  setStore(KEYS.budgets, budgets.map(b => b.id === id ? { ...b, ...updates } : b))
  mutateKey(KEYS.budgets)
}

export function deleteBudget(id: string) {
  const budgets = getBudgets()
  setStore(KEYS.budgets, budgets.filter(b => b.id !== id))
  mutateKey(KEYS.budgets)
}

// Statistics
export function getFinancialStats(): FinancialStats {
  const accounts = getAccounts()
  const transactions = getTransactions()
  
  const totalAssets = accounts
    .filter(a => a.type !== "debt")
    .reduce((sum, a) => sum + a.balance, 0)
  
  const totalLiabilities = accounts
    .filter(a => a.type === "debt")
    .reduce((sum, a) => sum + a.balance, 0)
  
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()
  
  const monthlyTransactions = transactions.filter(t => {
    const date = new Date(t.transactionDate)
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear
  })
  
  const monthlyIncome = monthlyTransactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0)
  
  const monthlyExpenses = monthlyTransactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0)
  
  const monthlySavings = monthlyIncome - monthlyExpenses
  const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0
  
  return {
    totalAssets,
    totalLiabilities,
    netWorth: totalAssets - totalLiabilities,
    monthlyIncome,
    monthlyExpenses,
    monthlySavings,
    savingsRate: Math.round(savingsRate * 10) / 10,
  }
}

export function getExpensesByCategory(): Record<string, number> {
  const transactions = getTransactions().filter(t => t.type === "expense")
  return transactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount
    return acc
  }, {} as Record<string, number>)
}
