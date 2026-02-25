// ============================================
// API CLIENT - Typed API wrapper
// ============================================

import type { 
  CreateGoalInput, UpdateGoalInput, GoalFilters,
  CreateTaskInput, UpdateTaskInput, TaskFilters,
  CreateHabitInput, UpdateHabitInput, ToggleHabitEntryInput, HabitFilters,
  CreateSkillInput, UpdateSkillInput, AddSkillActivityInput, SkillFilters,
  CreateAccountInput, CreateTransactionInput, CreateFinancialGoalInput,
  ContributeToGoalInput, CreateBudgetInput, TransactionFilters
} from "@/lib/validators"

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: unknown
  ) {
    super(message)
    this.name = "ApiError"
  }
}

async function fetchApi<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }))
    throw new ApiError(
      error.error || `HTTP ${response.status}`,
      response.status,
      error.details
    )
  }

  return response.json()
}

// Goals API
export const goalsApi = {
  getAll: (filters?: GoalFilters) => {
    const params = filters ? new URLSearchParams(filters as Record<string, string>).toString() : ""
    return fetchApi(`/api/goals${params ? `?${params}` : ""}`)
  },
  
  create: (data: CreateGoalInput) => 
    fetchApi("/api/goals", { method: "POST", body: JSON.stringify(data) }),
  
  update: (data: UpdateGoalInput) =>
    fetchApi("/api/goals", { method: "PATCH", body: JSON.stringify(data) }),
  
  delete: (id: string) =>
    fetchApi(`/api/goals?id=${id}`, { method: "DELETE" }),
}

// Tasks API
export const tasksApi = {
  getAll: (filters?: TaskFilters) => {
    const params = filters ? new URLSearchParams(filters as Record<string, string>).toString() : ""
    return fetchApi(`/api/tasks${params ? `?${params}` : ""}`)
  },
  
  create: (data: CreateTaskInput) =>
    fetchApi("/api/tasks", { method: "POST", body: JSON.stringify(data) }),
  
  update: (data: UpdateTaskInput) =>
    fetchApi("/api/tasks", { method: "PATCH", body: JSON.stringify(data) }),
  
  complete: (id: string, actualDuration?: number, notes?: string) =>
    fetchApi("/api/tasks", { 
      method: "PATCH", 
      body: JSON.stringify({ action: "complete", id, actualDuration, notes }) 
    }),
  
  delete: (id: string) =>
    fetchApi(`/api/tasks?id=${id}`, { method: "DELETE" }),
}

// Habits API
export const habitsApi = {
  getAll: (filters?: HabitFilters) => {
    const params = filters ? new URLSearchParams(filters as Record<string, string>).toString() : ""
    return fetchApi(`/api/habits${params ? `?${params}` : ""}`)
  },
  
  create: (data: CreateHabitInput) =>
    fetchApi("/api/habits", { method: "POST", body: JSON.stringify(data) }),
  
  update: (data: UpdateHabitInput) =>
    fetchApi("/api/habits", { method: "PATCH", body: JSON.stringify(data) }),
  
  toggleEntry: (data: ToggleHabitEntryInput) =>
    fetchApi("/api/habits/toggle", { method: "POST", body: JSON.stringify(data) }),
  
  delete: (id: string) =>
    fetchApi(`/api/habits?id=${id}`, { method: "DELETE" }),
}

// Skills API
export const skillsApi = {
  getAll: (filters?: SkillFilters) => {
    const params = filters ? new URLSearchParams(filters as Record<string, string>).toString() : ""
    return fetchApi(`/api/skills${params ? `?${params}` : ""}`)
  },
  
  create: (data: CreateSkillInput) =>
    fetchApi("/api/skills", { method: "POST", body: JSON.stringify(data) }),
  
  update: (data: UpdateSkillInput) =>
    fetchApi("/api/skills", { method: "PATCH", body: JSON.stringify(data) }),
  
  addActivity: (data: AddSkillActivityInput) =>
    fetchApi("/api/skills/activity", { method: "POST", body: JSON.stringify(data) }),
  
  delete: (id: string) =>
    fetchApi(`/api/skills?id=${id}`, { method: "DELETE" }),
}

// Finance API
export const financeApi = {
  accounts: {
    getAll: () => fetchApi("/api/finance/accounts"),
    create: (data: CreateAccountInput) =>
      fetchApi("/api/finance/accounts", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<CreateAccountInput>) =>
      fetchApi("/api/finance/accounts", { method: "PATCH", body: JSON.stringify({ id, ...data }) }),
    delete: (id: string) =>
      fetchApi(`/api/finance/accounts?id=${id}`, { method: "DELETE" }),
  },
  
  transactions: {
    getAll: (filters?: TransactionFilters) => {
      const params = filters ? new URLSearchParams(filters as Record<string, string>).toString() : ""
      return fetchApi(`/api/finance/transactions${params ? `?${params}` : ""}`)
    },
    create: (data: CreateTransactionInput) =>
      fetchApi("/api/finance/transactions", { method: "POST", body: JSON.stringify(data) }),
    delete: (id: string) =>
      fetchApi(`/api/finance/transactions?id=${id}`, { method: "DELETE" }),
  },
  
  goals: {
    getAll: () => fetchApi("/api/finance/goals"),
    create: (data: CreateFinancialGoalInput) =>
      fetchApi("/api/finance/goals", { method: "POST", body: JSON.stringify(data) }),
    contribute: (data: ContributeToGoalInput) =>
      fetchApi("/api/finance/goals/contribute", { method: "POST", body: JSON.stringify(data) }),
    delete: (id: string) =>
      fetchApi(`/api/finance/goals?id=${id}`, { method: "DELETE" }),
  },
  
  stats: () => fetchApi("/api/finance/stats"),
}

export { ApiError }
