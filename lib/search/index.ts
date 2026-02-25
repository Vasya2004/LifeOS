// ============================================
// SEARCH ENGINE - Global Search Implementation
// ============================================

import type { 
  SearchIndex, 
  SearchOptions, 
  SearchResult, 
  SearchSuggestion,
  SearchableModule,
  SearchFilters 
} from "@/lib/types/search"
import type { Task, Goal, Skill, Habit, Account, Transaction, BodyZone, MedicalDocument } from "@/lib/types"
import { getStore, setStore } from "@/lib/store/utils/storage"
import { getCurrentUserIdSync } from "@/lib/store/modules/auth"

const SEARCH_INDEX_KEY = "search_index"
const SEARCH_HISTORY_KEY = "search_history"

// ============================================
// Search Index Management
// ============================================

export function getSearchIndex(): SearchIndex[] {
  return getStore<SearchIndex[]>(SEARCH_INDEX_KEY, [])
}

export function buildSearchIndex(): SearchIndex[] {
  const userId = getCurrentUserIdSync() || "anonymous"
  const index: SearchIndex[] = []
  
  // Import modules dynamically to avoid circular deps
  const { 
    tasksModule, 
    goalsModule, 
    skillsModule, 
    habitsModule,
    accountsModule,
    transactionsModule,
    bodyZonesModule,
    medicalDocumentsModule,
  } = require("@/lib/store")
  
  // Index Tasks
  const tasks: Task[] = tasksModule.getAll()
  tasks.forEach((task: Task) => {
    index.push({
      id: task.id,
      userId,
      module: 'tasks',
      title: task.title,
      description: task.description,
      content: `${task.title} ${task.description || ''}`,
      tags: [task.status, task.priority, task.energyType],
      status: task.status,
      priority: task.priority,
      createdAt: task.scheduledDate,
      updatedAt: task.completedAt || task.scheduledDate,
      metadata: {
        scheduledDate: task.scheduledDate,
        priority: task.priority,
        status: task.status,
        energyCost: task.energyCost,
      }
    })
  })
  
  // Index Goals
  const goals: Goal[] = goalsModule.getAll()
  goals.forEach((goal: Goal) => {
    index.push({
      id: goal.id,
      userId,
      module: 'goals',
      title: goal.title,
      description: goal.description,
      content: `${goal.title} ${goal.description}`,
      tags: [goal.status, `priority-${goal.priority}`],
      status: goal.status,
      priority: String(goal.priority),
      createdAt: goal.startedAt,
      updatedAt: goal.completedAt || goal.startedAt,
      metadata: {
        progress: goal.progress,
        targetDate: goal.targetDate,
        priority: goal.priority,
        type: goal.type,
      }
    })
  })
  
  // Index Skills
  const skills: Skill[] = skillsModule.getAll()
  skills.forEach((skill: Skill) => {
    index.push({
      id: skill.id,
      userId,
      module: 'skills',
      title: skill.name,
      description: skill.description,
      content: `${skill.name} ${skill.description}`,
      tags: [skill.category, `level-${skill.currentLevel}`],
      category: skill.category,
      createdAt: skill.createdAt,
      updatedAt: skill.updatedAt,
      metadata: {
        currentLevel: skill.currentLevel,
        category: skill.category,
        totalXp: skill.totalXpEarned,
      }
    })
  })
  
  // Index Habits
  const habits: Habit[] = habitsModule.getAll()
  habits.forEach((habit: Habit) => {
    index.push({
      id: habit.id,
      userId,
      module: 'habits',
      title: habit.title,
      description: habit.description,
      content: `${habit.title} ${habit.description}`,
      tags: [habit.frequency, habit.energyType],
      createdAt: habit.entries[0]?.date || new Date().toISOString(),
      updatedAt: habit.entries[habit.entries.length - 1]?.date || new Date().toISOString(),
      metadata: {
        streak: habit.streak,
        frequency: habit.frequency,
        totalCompletions: habit.totalCompletions,
      }
    })
  })
  
  // Index Finance - Accounts
  const accounts: Account[] = accountsModule.getAll()
  accounts.forEach((account: Account) => {
    index.push({
      id: account.id,
      userId,
      module: 'finance',
      title: account.name,
      description: `${account.type} - ${account.balance} ${account.currency}`,
      content: account.name,
      tags: [account.type, 'account'],
      category: account.type,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
      metadata: {
        balance: account.balance,
        type: account.type,
        currency: account.currency,
      }
    })
  })
  
  // Index Finance - Transactions
  const transactions: Transaction[] = transactionsModule.getAll()
  transactions.forEach((transaction: Transaction) => {
    index.push({
      id: transaction.id,
      userId,
      module: 'finance',
      title: `${transaction.type === 'income' ? 'Доход' : 'Расход'}: ${transaction.category}`,
      description: transaction.description,
      content: `${transaction.description || ''} ${transaction.category} ${transaction.amount}`,
      tags: [transaction.type, transaction.category],
      category: transaction.category,
      createdAt: transaction.createdAt,
      updatedAt: transaction.createdAt,
      metadata: {
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        transactionDate: transaction.transactionDate,
      }
    })
  })
  
  // Index Health - Body Zones
  const bodyZones: BodyZone[] = bodyZonesModule.getAll()
  bodyZones.forEach((zone: BodyZone) => {
    index.push({
      id: zone.id,
      userId,
      module: 'health',
      title: zone.displayName,
      description: zone.notes,
      content: `${zone.displayName} ${zone.notes}`,
      tags: [zone.status, 'body-zone'],
      status: zone.status,
      createdAt: zone.lastCheckup || new Date().toISOString(),
      updatedAt: zone.lastCheckup || new Date().toISOString(),
      metadata: {
        status: zone.status,
        name: zone.name,
      }
    })
  })
  
  // Index Health - Medical Documents
  const documents: MedicalDocument[] = medicalDocumentsModule.getAll()
  documents.forEach((doc: MedicalDocument) => {
    index.push({
      id: doc.id,
      userId,
      module: 'health',
      title: doc.title,
      description: doc.summary,
      content: `${doc.title} ${doc.summary || ''} ${doc.doctorName || ''} ${doc.clinic || ''}`,
      tags: [doc.documentType, 'document'],
      category: doc.documentType,
      createdAt: doc.createdAt,
      updatedAt: doc.createdAt,
      metadata: {
        documentType: doc.documentType,
        date: doc.date,
        doctorName: doc.doctorName,
        clinic: doc.clinic,
      }
    })
  })
  
  // Save index
  setStore(SEARCH_INDEX_KEY, index)
  return index
}

export function addToSearchIndex(item: SearchIndex): void {
  const index = getSearchIndex()
  const existingIndex = index.findIndex(i => i.id === item.id && i.module === item.module)
  
  if (existingIndex >= 0) {
    index[existingIndex] = item
  } else {
    index.push(item)
  }
  
  setStore(SEARCH_INDEX_KEY, index)
}

export function removeFromSearchIndex(id: string, module: SearchableModule): void {
  const index = getSearchIndex()
  setStore(SEARCH_INDEX_KEY, index.filter(i => !(i.id === id && i.module === module)))
}

// ============================================
// Search Engine
// ============================================

export function search(options: SearchOptions): SearchResult {
  const { 
    query, 
    filters = {}, 
    sortBy = 'relevance', 
    sortOrder = 'desc',
    page = 1, 
    pageSize = 20 
  } = options
  
  let index = getSearchIndex()
  
  // Filter by modules
  if (filters.modules && filters.modules.length > 0) {
    index = index.filter(item => filters.modules!.includes(item.module))
  }
  
  // Filter by status
  if (filters.status && filters.status.length > 0) {
    index = index.filter(item => item.status && filters.status!.includes(item.status))
  }
  
  // Filter by priority
  if (filters.priority && filters.priority.length > 0) {
    index = index.filter(item => item.priority && filters.priority!.includes(item.priority))
  }
  
  // Filter by category
  if (filters.category && filters.category.length > 0) {
    index = index.filter(item => item.category && filters.category!.includes(item.category))
  }
  
  // Filter by date range
  if (filters.dateFrom) {
    index = index.filter(item => item.createdAt >= filters.dateFrom!)
  }
  if (filters.dateTo) {
    index = index.filter(item => item.createdAt <= filters.dateTo!)
  }
  
  // Filter by tags
  if (filters.tags && filters.tags.length > 0) {
    index = index.filter(item => 
      filters.tags!.some(tag => item.tags.includes(tag))
    )
  }
  
  // Search query
  if (query.trim()) {
    const searchTerms = query.toLowerCase().split(' ').filter(Boolean)
    index = index.filter(item => {
      const searchableText = `${item.title} ${item.description || ''} ${item.content || ''} ${item.tags.join(' ')}`.toLowerCase()
      return searchTerms.every(term => searchableText.includes(term))
    })
    
    // Calculate relevance score for sorting
    if (sortBy === 'relevance') {
      index = index.map(item => {
        const searchableText = `${item.title} ${item.description || ''}`.toLowerCase()
        let score = 0
        
        searchTerms.forEach(term => {
          // Title match = higher score
          if (item.title.toLowerCase().includes(term)) score += 10
          // Description match = medium score
          if (item.description?.toLowerCase().includes(term)) score += 5
          // Content match = lower score
          if (item.content?.toLowerCase().includes(term)) score += 2
          // Tag match = bonus score
          if (item.tags.some(tag => tag.toLowerCase().includes(term))) score += 3
        })
        
        return { ...item, _score: score }
      }).sort((a: any, b: any) => sortOrder === 'desc' ? b._score - a._score : a._score - b._score)
    }
  }
  
  // Sort results
  if (sortBy !== 'relevance') {
    index.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        case 'title':
          comparison = a.title.localeCompare(b.title)
          break
        case 'priority':
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
          const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0
          const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0
          comparison = aPriority - bPriority
          break
      }
      
      return sortOrder === 'desc' ? -comparison : comparison
    })
  }
  
  // Paginate
  const total = index.length
  const totalPages = Math.ceil(total / pageSize)
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const items = index.slice(start, end)
  
  return {
    items,
    total,
    page,
    pageSize,
    totalPages,
    hasMore: page < totalPages,
  }
}

// ============================================
// Search Suggestions
// ============================================

export function getSearchSuggestions(query: string, limit: number = 5): SearchSuggestion[] {
  if (!query.trim() || query.length < 2) return []
  
  const index = getSearchIndex()
  const searchTerm = query.toLowerCase()
  
  const matches = index
    .filter(item => item.title.toLowerCase().includes(searchTerm))
    .slice(0, limit)
    .map(item => ({
      id: item.id,
      title: item.title,
      module: item.module,
      highlight: highlightMatch(item.title, searchTerm),
    }))
  
  return matches
}

function highlightMatch(text: string, query: string): string {
  const regex = new RegExp(`(${query})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

// ============================================
// Search History
// ============================================

export function getSearchHistory(): string[] {
  return getStore<string[]>(SEARCH_HISTORY_KEY, [])
}

export function addToSearchHistory(query: string): void {
  if (!query.trim()) return
  
  const history = getSearchHistory()
  const filtered = history.filter(h => h.toLowerCase() !== query.toLowerCase())
  const newHistory = [query, ...filtered].slice(0, 10)
  
  setStore(SEARCH_HISTORY_KEY, newHistory)
}

export function clearSearchHistory(): void {
  setStore(SEARCH_HISTORY_KEY, [])
}

// ============================================
// Quick Search by Module
// ============================================

export function searchInModule(
  module: SearchableModule, 
  query: string, 
  limit: number = 10
): SearchIndex[] {
  const result = search({
    query,
    filters: { modules: [module] },
    pageSize: limit,
  })
  return result.items
}
