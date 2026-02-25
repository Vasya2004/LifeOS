// ============================================
// SEARCH TYPES - Global Search & Indexing
// ============================================

export type SearchableModule = 
  | 'tasks' 
  | 'goals' 
  | 'skills' 
  | 'finance' 
  | 'health' 
  | 'habits'
  | 'journal'
  | 'achievements'

export interface SearchIndex {
  id: string
  userId: string
  module: SearchableModule
  title: string
  description?: string
  content?: string
  tags: string[]
  status?: string
  priority?: string
  category?: string
  createdAt: string
  updatedAt: string
  metadata: Record<string, any>
}

export interface SearchFilters {
  modules?: SearchableModule[]
  status?: string[]
  priority?: string[]
  category?: string[]
  dateFrom?: string
  dateTo?: string
  tags?: string[]
}

export interface SearchOptions {
  query: string
  filters?: SearchFilters
  sortBy?: 'relevance' | 'date' | 'title' | 'priority'
  sortOrder?: 'asc' | 'desc'
  page?: number
  pageSize?: number
}

export interface SearchResult {
  items: SearchIndex[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  hasMore: boolean
}

export interface SearchSuggestion {
  id: string
  title: string
  module: SearchableModule
  highlight: string
}

// Pagination types
export interface PaginationOptions {
  page: number
  pageSize: number
}

export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  hasMore: boolean
}
