// ============================================
// PAGINATION UTILITIES
// ============================================

import { useState, useCallback, useMemo } from "react"
import type { PaginationOptions, PaginatedResult } from "@/lib/types/search"

// ============================================
// Generic Pagination Hook
// ============================================

export function usePagination<T>(
  items: T[],
  defaultPageSize: number = 20
) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(defaultPageSize)
  
  const result = useMemo<PaginatedResult<T>>(() => {
    const total = items.length
    const totalPages = Math.ceil(total / pageSize)
    const start = (page - 1) * pageSize
    const end = start + pageSize
    
    return {
      items: items.slice(start, end),
      total,
      page,
      pageSize,
      totalPages,
      hasMore: page < totalPages,
    }
  }, [items, page, pageSize])
  
  const goToPage = useCallback((newPage: number) => {
    setPage(Math.max(1, Math.min(newPage, result.totalPages)))
  }, [result.totalPages])
  
  const nextPage = useCallback(() => {
    if (result.hasMore) setPage(p => p + 1)
  }, [result.hasMore])
  
  const prevPage = useCallback(() => {
    if (page > 1) setPage(p => p - 1)
  }, [page])
  
  const changePageSize = useCallback((newSize: number) => {
    setPageSize(newSize)
    setPage(1)
  }, [])
  
  const reset = useCallback(() => {
    setPage(1)
  }, [])
  
  return {
    ...result,
    goToPage,
    nextPage,
    prevPage,
    changePageSize,
    reset,
    setPage,
  }
}

// ============================================
// Infinite Scroll Hook
// ============================================

export function useInfiniteScroll<T>(
  fetchItems: (page: number, pageSize: number) => Promise<{ items: T[]; hasMore: boolean }>,
  pageSize: number = 20
) {
  const [items, setItems] = useState<T[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return
    
    setLoading(true)
    setError(null)
    
    try {
      const result = await fetchItems(page, pageSize)
      setItems(prev => [...prev, ...result.items])
      setHasMore(result.hasMore)
      setPage(p => p + 1)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load items'))
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, loading, hasMore, fetchItems])
  
  const reset = useCallback(() => {
    setItems([])
    setPage(1)
    setHasMore(true)
    setError(null)
  }, [])
  
  const refresh = useCallback(async () => {
    reset()
    await loadMore()
  }, [reset, loadMore])
  
  return {
    items,
    loading,
    hasMore,
    error,
    loadMore,
    reset,
    refresh,
  }
}

// ============================================
// Pagination Component Utils
// ============================================

export interface PageRange {
  start: number
  end: number
}

export function getPageRange(current: number, total: number, maxVisible: number = 7): (number | string)[] {
  if (total <= maxVisible) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  
  const pages: (number | string)[] = []
  
  // Always show first page
  pages.push(1)
  
  // Calculate range
  let start = Math.max(2, current - Math.floor(maxVisible / 2))
  let end = Math.min(total - 1, start + maxVisible - 3)
  
  if (end - start < maxVisible - 3) {
    start = Math.max(2, end - (maxVisible - 3) + 1)
  }
  
  // Add ellipsis after first page if needed
  if (start > 2) {
    pages.push('...')
  }
  
  // Add middle pages
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  // Add ellipsis before last page if needed
  if (end < total - 1) {
    pages.push('...')
  }
  
  // Always show last page
  if (total > 1) {
    pages.push(total)
  }
  
  return pages
}

export function getVisibleRangeText(page: number, pageSize: number, total: number): string {
  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)
  return `${start}–${end} из ${total}`
}

// ============================================
// Common Page Sizes
// ============================================

export const PAGE_SIZES = [10, 20, 50, 100] as const

export type PageSize = typeof PAGE_SIZES[number]
