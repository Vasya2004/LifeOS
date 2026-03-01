// ============================================
// HYBRID STORAGE - Main Export
// ============================================
// SSR-friendly storage for Next.js 16 App Router
// 
// Architecture:
// - Server: cookies for minimal data (identity, stats, settings)
// - Client: IndexedDB for full data (all entities)
// - Hydration: server state → client storage on first load
//
// Usage:
// 1. Server Component (layout/page):
//    import { getServerState } from '@/lib/storage/server'
//    const serverState = await getServerState()
//    return <Component initialState={serverState} />
//
// 2. Client Component:
//    import { useHybridIdentity } from '@/hooks/use-hybrid-data'
//    const { data, isReady, setData } = useHybridIdentity(serverState)
//
// ============================================

// Types
export type {
  ServerState,
  ClientData,
  HybridDataResult,
  SyncState,
  SyncOptions,
  SyncResult,
} from './types'

// Constants
export { COOKIE_KEYS, IDB_KEYS, SSR_FALLBACKS } from './types'
export { defaultIdentity, defaultStats, defaultSettings } from './types'

// Utilities
export { genId, now, today } from './types'

// Note: Server-only utilities are in './server'
// Note: Client-only utilities are in './client'
// Note: Hooks are in '@/hooks/use-hybrid-data'
