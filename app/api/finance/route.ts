// ============================================
// FINANCE API - Accounts, Transactions, Goals, Budgets
// ============================================

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { checkRateLimit, rateLimitPresets } from "@/lib/api/rate-limit-middleware"
import { ZodError } from "zod"
import {
  createAccountSchema,
  createTransactionSchema,
  createFinancialGoalSchema,
  createBudgetSchema,
  transactionFiltersSchema,
  type CreateAccountInput,
  type CreateTransactionInput,
  type CreateFinancialGoalInput,
  type CreateBudgetInput,
} from "@/lib/validators/finance"

// GET /api/finance?type=accounts|transactions|goals|budgets
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    switch (type) {
      case "accounts":
        return getAccounts(supabase, user.id)
      case "transactions":
        return getTransactions(supabase, user.id, searchParams)
      case "goals":
        return getFinancialGoals(supabase, user.id)
      case "budgets":
        return getBudgets(supabase, user.id)
      case "stats":
        return getStats(supabase, user.id)
      default:
        return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 })
    }
  } catch (error) {
    console.error("GET /api/finance error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function getAccounts(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("created_at", { ascending: true })

  if (error) throw error
  return NextResponse.json({ data: data || [] })
}

async function getTransactions(supabase: any, userId: string, searchParams: URLSearchParams) {
  const filters = transactionFiltersSchema.parse({
    accountId: searchParams.get("accountId") || undefined,
    type: searchParams.get("transactionType") || undefined,
    category: searchParams.get("category") || undefined,
    dateFrom: searchParams.get("dateFrom") || undefined,
    dateTo: searchParams.get("dateTo") || undefined,
  })

  let query = supabase
    .from("transactions")
    .select("*, accounts(name, type)")
    .eq("user_id", userId)
    .order("transaction_date", { ascending: false })

  if (filters.accountId) query = query.eq("account_id", filters.accountId)
  if (filters.type) query = query.eq("type", filters.type)
  if (filters.category) query = query.eq("category", filters.category)
  if (filters.dateFrom) query = query.gte("transaction_date", filters.dateFrom)
  if (filters.dateTo) query = query.lte("transaction_date", filters.dateTo)

  const { data, error } = await query

  if (error) throw error
  return NextResponse.json({ data: data || [] })
}

async function getFinancialGoals(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from("financial_goals")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return NextResponse.json({ data: data || [] })
}

async function getBudgets(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from("budgets")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  if (error) throw error
  return NextResponse.json({ data: data || [] })
}

async function getStats(supabase: any, userId: string) {
  // Get accounts
  const { data: accounts } = await supabase
    .from("accounts")
    .select("type, balance")
    .eq("user_id", userId)
    .eq("is_active", true)

  // Get current month transactions
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0]
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0]

  const { data: transactions } = await supabase
    .from("transactions")
    .select("type, amount")
    .eq("user_id", userId)
    .gte("transaction_date", startOfMonth)
    .lte("transaction_date", endOfMonth)

  const totalAssets = accounts
    ?.filter((a: { type: string }) => a.type !== "debt")
    .reduce((sum: number, a: { balance: number }) => sum + Number(a.balance), 0) || 0

  const totalLiabilities = accounts
    ?.filter((a: { type: string }) => a.type === "debt")
    .reduce((sum: number, a: { balance: number }) => sum + Number(a.balance), 0) || 0

  const monthlyIncome = transactions
    ?.filter((t: { type: string }) => t.type === "income")
    .reduce((sum: number, t: { amount: number }) => sum + Number(t.amount), 0) || 0

  const monthlyExpenses = transactions
    ?.filter((t: { type: string }) => t.type === "expense")
    .reduce((sum: number, t: { amount: number }) => sum + Number(t.amount), 0) || 0

  const monthlySavings = monthlyIncome - monthlyExpenses
  const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0

  return NextResponse.json({
    data: {
      totalAssets,
      totalLiabilities,
      netWorth: totalAssets - totalLiabilities,
      monthlyIncome,
      monthlyExpenses,
      monthlySavings,
      savingsRate: Math.round(savingsRate * 10) / 10,
    },
  })
}

// POST /api/finance
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const { allowed, response: rateLimitResponse, headers } = await checkRateLimit(request, rateLimitPresets.api)
    if (!allowed) return rateLimitResponse!
    
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { type, data } = body

    switch (type) {
      case "account":
        return createAccount(supabase, user.id, data)
      case "transaction":
        return createTransaction(supabase, user.id, data)
      case "goal":
        return createFinancialGoal(supabase, user.id, data)
      case "budget":
        return createBudget(supabase, user.id, data)
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 })
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }
    console.error("POST /api/finance error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function createAccount(supabase: any, userId: string, data: CreateAccountInput) {
  const validated = createAccountSchema.parse(data)

  const { data: account, error } = await supabase
    .from("accounts")
    .insert({
      user_id: userId,
      name: validated.name,
      type: validated.type,
      balance: validated.balance,
      currency: validated.currency,
      color: validated.color,
      icon: validated.icon,
      is_active: validated.isActive,
    })
    .select()
    .single()

  if (error) throw error
  return NextResponse.json({ data: account }, { status: 201 })
}

async function createTransaction(supabase: any, userId: string, data: CreateTransactionInput) {
  const validated = createTransactionSchema.parse(data)

  // Verify account ownership
  const { data: account } = await supabase
    .from("accounts")
    .select("id, balance")
    .eq("id", validated.accountId)
    .eq("user_id", userId)
    .single()

  if (!account) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 })
  }

  // Create transaction
  const { data: transaction, error } = await supabase
    .from("transactions")
    .insert({
      user_id: userId,
      account_id: validated.accountId,
      type: validated.type,
      amount: validated.amount,
      category: validated.category,
      description: validated.description,
      transaction_date: validated.transactionDate.split("T")[0],
      related_goal_id: validated.relatedGoalId,
    })
    .select()
    .single()

  if (error) throw error

  // Update account balance
  const multiplier = validated.type === "income" ? 1 : -1
  const newBalance = Number(account.balance) + validated.amount * multiplier

  await supabase
    .from("accounts")
    .update({ balance: newBalance, updated_at: new Date().toISOString() })
    .eq("id", validated.accountId)

  return NextResponse.json({ data: transaction }, { status: 201 })
}

async function createFinancialGoal(supabase: any, userId: string, data: CreateFinancialGoalInput) {
  const validated = createFinancialGoalSchema.parse(data)

  const { data: goal, error } = await supabase
    .from("financial_goals")
    .insert({
      user_id: userId,
      title: validated.title,
      description: validated.description,
      target_amount: validated.targetAmount,
      deadline: validated.deadline?.split("T")[0],
      category: validated.category,
    })
    .select()
    .single()

  if (error) throw error
  return NextResponse.json({ data: goal }, { status: 201 })
}

async function createBudget(supabase: any, userId: string, data: CreateBudgetInput) {
  const validated = createBudgetSchema.parse(data)

  const { data: budget, error } = await supabase
    .from("budgets")
    .insert({
      user_id: userId,
      category: validated.category,
      limit_amount: validated.limit,
      period: validated.period,
      start_date: validated.startDate.split("T")[0],
      is_active: validated.isActive,
    })
    .select()
    .single()

  if (error) throw error
  return NextResponse.json({ data: budget }, { status: 201 })
}

// PATCH /api/finance
export async function PATCH(request: NextRequest) {
  try {
    // Rate limiting
    const { allowed, response: rateLimitResponse, headers } = await checkRateLimit(request, rateLimitPresets.api)
    if (!allowed) return rateLimitResponse!
    
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { type, id, data, action } = body

    switch (type) {
      case "account":
        return updateAccount(supabase, user.id, id, data)
      case "goal":
        if (action === "contribute") {
          return contributeToGoal(supabase, user.id, id, data.amount)
        }
        return updateFinancialGoal(supabase, user.id, id, data)
      case "budget":
        return updateBudget(supabase, user.id, id, data)
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 })
    }
  } catch (error) {
    console.error("PATCH /api/finance error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function updateAccount(supabase: any, userId: string, id: string, data: Partial<CreateAccountInput>) {
  const { data: existing } = await supabase
    .from("accounts")
    .select("id")
    .eq("id", id)
    .eq("user_id", userId)
    .single()

  if (!existing) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 })
  }

  const dbUpdates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }
  if (data.name !== undefined) dbUpdates.name = data.name
  if (data.type !== undefined) dbUpdates.type = data.type
  if (data.balance !== undefined) dbUpdates.balance = data.balance
  if (data.currency !== undefined) dbUpdates.currency = data.currency
  if (data.color !== undefined) dbUpdates.color = data.color
  if (data.icon !== undefined) dbUpdates.icon = data.icon
  if (data.isActive !== undefined) dbUpdates.is_active = data.isActive

  const { data: account, error } = await supabase
    .from("accounts")
    .update(dbUpdates)
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return NextResponse.json({ data: account })
}

async function updateFinancialGoal(supabase: any, userId: string, id: string, data: Partial<CreateFinancialGoalInput>) {
  const { data: existing } = await supabase
    .from("financial_goals")
    .select("id, target_amount")
    .eq("id", id)
    .eq("user_id", userId)
    .single()

  if (!existing) {
    return NextResponse.json({ error: "Goal not found" }, { status: 404 })
  }

  const dbUpdates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }
  if (data.title !== undefined) dbUpdates.title = data.title
  if (data.description !== undefined) dbUpdates.description = data.description
  if (data.targetAmount !== undefined) dbUpdates.target_amount = data.targetAmount
  if (data.deadline !== undefined) dbUpdates.deadline = data.deadline?.split("T")[0]
  if (data.category !== undefined) dbUpdates.category = data.category

  const { data: goal, error } = await supabase
    .from("financial_goals")
    .update(dbUpdates)
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return NextResponse.json({ data: goal })
}

async function contributeToGoal(supabase: any, userId: string, goalId: string, amount: number) {
  const { data: goal } = await supabase
    .from("financial_goals")
    .select("id, current_amount, target_amount")
    .eq("id", goalId)
    .eq("user_id", userId)
    .single()

  if (!goal) {
    return NextResponse.json({ error: "Goal not found" }, { status: 404 })
  }

  const newAmount = Number(goal.current_amount) + amount
  const isCompleted = newAmount >= Number(goal.target_amount)

  const { data: updated, error } = await supabase
    .from("financial_goals")
    .update({
      current_amount: newAmount,
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", goalId)
    .select()
    .single()

  if (error) throw error
  return NextResponse.json({ data: updated })
}

async function updateBudget(supabase: any, userId: string, id: string, data: Partial<CreateBudgetInput>) {
  const { data: existing } = await supabase
    .from("budgets")
    .select("id")
    .eq("id", id)
    .eq("user_id", userId)
    .single()

  if (!existing) {
    return NextResponse.json({ error: "Budget not found" }, { status: 404 })
  }

  const dbUpdates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }
  if (data.category !== undefined) dbUpdates.category = data.category
  if (data.limit !== undefined) dbUpdates.limit_amount = data.limit
  if (data.period !== undefined) dbUpdates.period = data.period
  if (data.startDate !== undefined) dbUpdates.start_date = data.startDate?.split("T")[0]
  if (data.isActive !== undefined) dbUpdates.is_active = data.isActive

  const { data: budget, error } = await supabase
    .from("budgets")
    .update(dbUpdates)
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return NextResponse.json({ data: budget })
}

// DELETE /api/finance?type=xxx&id=xxx
export async function DELETE(request: NextRequest) {
  try {
    // Rate limiting
    const { allowed, response: rateLimitResponse, headers } = await checkRateLimit(request, rateLimitPresets.api)
    if (!allowed) return rateLimitResponse!
    
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const id = searchParams.get("id")

    if (!type || !id) {
      return NextResponse.json({ error: "Type and ID are required" }, { status: 400 })
    }

    let table: string
    switch (type) {
      case "account":
        table = "accounts"
        break
      case "transaction":
        table = "transactions"
        break
      case "goal":
        table = "financial_goals"
        break
      case "budget":
        table = "budgets"
        break
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 })
    }

    const { data: existing } = await supabase
      .from(table)
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const { error } = await supabase.from(table).delete().eq("id", id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/finance error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
