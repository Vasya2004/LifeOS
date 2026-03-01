// ============================================
// USE LAZY STORE - React Hook for Lazy Loading
// ============================================
//
// Provides a convenient way to use lazy-loaded store modules in React components.
// Automatically handles loading states and errors.
//
// Usage:
//   const { data: accounts, loading, error } = useLazyFinance(getAccounts)
//   const { data: skills, loading } = useLazySkills(getSkills)
//
// ============================================

import { useState, useEffect, useCallback, useRef } from "react"
import type { LoadingState } from "@/lib/store/lazy/registry"

// ============================================
// Types
// ============================================

interface LazyStoreResult<T> {
  data: T | null
  loading: boolean
  error: Error | null
  state: LoadingState
  reload: () => void
}

// ============================================
// Finance Hook
// ============================================

export function useLazyFinance<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = []
): LazyStoreResult<T> {
  return useLazyModule(fetcher, deps)
}

// ============================================
// Health Hook
// ============================================

export function useLazyHealth<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = []
): LazyStoreResult<T> {
  return useLazyModule(fetcher, deps)
}

// ============================================
// Skills Hook
// ============================================

export function useLazySkills<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = []
): LazyStoreResult<T> {
  return useLazyModule(fetcher, deps)
}

// ============================================
// Generic Lazy Hook
// ============================================

function useLazyModule<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = []
): LazyStoreResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [state, setState] = useState<LoadingState>("idle")
  const fetcherRef = useRef(fetcher)

  // Update fetcher ref when it changes
  useEffect(() => {
    fetcherRef.current = fetcher
  }, [fetcher])

  const loadData = useCallback(async () => {
    setLoading(true)
    setState("loading")

    try {
      const result = await fetcherRef.current()
      setData(result)
      setError(null)
      setState("loaded")
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      setState("error")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, deps)

  const reload = useCallback(() => {
    loadData()
  }, [loadData])

  return { data, loading, error, state, reload }
}

// ============================================
// Preload Hook
// ============================================

/**
 * Hook to preload heavy modules after initial render
 * Use this in your app layout or root component
 */
export function usePreloadHeavyModules(delay = 2000): {
  preloading: boolean
  preloaded: boolean
} {
  const [preloading, setPreloading] = useState(false)
  const [preloaded, setPreloaded] = useState(false)

  useEffect(() => {
    let cancelled = false

    const preload = async () => {
      // Wait for initial render to complete
      await new Promise((resolve) => setTimeout(resolve, delay))

      if (cancelled) return

      setPreloading(true)

      try {
        const { preloadHeavyModules } = await import("@/lib/store/lazy")
        await preloadHeavyModules()
        if (!cancelled) {
          setPreloaded(true)
        }
      } catch {
        // Silent fail - modules will load on demand
      } finally {
        if (!cancelled) {
          setPreloading(false)
        }
      }
    }

    preload()

    return () => {
      cancelled = true
    }
  }, [delay])

  return { preloading, preloaded }
}

// ============================================
// Eager Loading Hook
// ============================================

/**
 * Hook to preload a specific module when component mounts
 * Useful for route-level preloading
 */
export function useEagerLoadFinance(): { ready: boolean } {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const { StoreRegistry } = await import("@/lib/store/lazy")
        await StoreRegistry.finance()
        if (!cancelled) {
          setReady(true)
        }
      } catch {
        if (!cancelled) {
          setReady(false)
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [])

  return { ready }
}

export function useEagerLoadHealth(): { ready: boolean } {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const { StoreRegistry } = await import("@/lib/store/lazy")
        await StoreRegistry.health()
        if (!cancelled) {
          setReady(true)
        }
      } catch {
        if (!cancelled) {
          setReady(false)
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [])

  return { ready }
}

export function useEagerLoadSkills(): { ready: boolean } {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const { StoreRegistry } = await import("@/lib/store/lazy")
        await StoreRegistry.skills()
        if (!cancelled) {
          setReady(true)
        }
      } catch {
        if (!cancelled) {
          setReady(false)
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [])

  return { ready }
}
