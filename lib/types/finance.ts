// ============================================
// FINANCE TYPES - Financial Discipline Tracker
// ============================================

export type AccountType = 'cash' | 'bank' | 'investment' | 'crypto' | 'debt'
export type TransactionType = 'income' | 'expense' | 'transfer'

export interface Account {
  id: string
  userId: string
  name: string
  type: AccountType
  balance: number
  currency: string
  color?: string
  icon?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Transaction {
  id: string
  userId: string
  accountId: string
  type: TransactionType
  amount: number
  category: string
  description?: string
  transactionDate: string
  relatedGoalId?: string
  createdAt: string
}

export interface FinancialGoal {
  id: string
  userId: string
  title: string
  description?: string
  targetAmount: number
  currentAmount: number
  deadline?: string
  category: 'savings' | 'investment' | 'debt_payment' | 'purchase' | 'emergency_fund'
  isCompleted: boolean
  completedAt?: string
  createdAt: string
  updatedAt: string
}

export interface Budget {
  id: string
  userId: string
  category: string
  limit: number
  period: 'weekly' | 'monthly' | 'yearly'
  startDate: string
  isActive: boolean
}

export interface FinancialStats {
  totalAssets: number
  totalLiabilities: number
  netWorth: number
  monthlyIncome: number
  monthlyExpenses: number
  monthlySavings: number
  savingsRate: number // percentage
}
