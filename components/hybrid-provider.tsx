'use client'

import { useEffect, useState } from 'react'
import type { ServerState } from '@/lib/storage'
import { 
  hydrateFromServer, 
  setupAutoSync,
  setHydrationState,
} from '@/lib/storage/client'

interface HybridProviderProps {
  children: React.ReactNode
  initialState: ServerState
}

/**
 * HybridProvider handles server state hydration and auto-sync setup
 * Place inside ErrorBoundary and outside StorageProvider
 */
export function HybridProvider({ children, initialState }: HybridProviderProps) {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    // Set server state for hooks to access
    setHydrationState(initialState)

    // Hydrate client storage from server state
    hydrateFromServer(initialState)
      .then(() => {
        setIsHydrated(true)
      })
      .catch((error) => {
        console.error('[HybridProvider] Hydration failed:', error)
        // Still mark as hydrated to not block UI
        setIsHydrated(true)
      })

    // Setup automatic sync
    setupAutoSync()
  }, [initialState])

  // Always render children - they handle their own loading states
  return <>{children}</>
}
