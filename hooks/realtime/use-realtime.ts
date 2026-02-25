// ============================================
// REALTIME HOOKS - React integration
// ============================================

"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import { useAuth } from "@/lib/auth/context"
import { realtimeManager, subscribeToTable, type ChangeType } from "@/lib/realtime/client"
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js"
import { mutate } from "swr"

/**
 * Hook to subscribe to realtime changes on a table
 */
export function useRealtimeSubscription(
  table: string,
  swrKey: string,
  options?: {
    event?: ChangeType
    filter?: string
    enabled?: boolean
    onChange?: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void
  }
) {
  const { user, isAuthenticated } = useAuth()
  const enabled = options?.enabled !== false && isAuthenticated && user

  useEffect(() => {
    if (!enabled) return

    const userId = user.id
    const channelName = `realtime:${table}:${userId}`
    const filter = options?.filter || `user_id=eq.${userId}`

    const channel = subscribeToTable(
      table,
      (payload) => {
        // Revalidate SWR cache
        mutate(swrKey)
        
        // Call custom handler if provided
        options?.onChange?.(payload)
      },
      {
        event: options?.event,
        filter,
      }
    )

    return () => {
      realtimeManager.unsubscribe(channelName)
    }
  }, [table, swrKey, enabled, user, options?.event, options?.filter, options?.onChange])

  return {
    isSubscribed: enabled,
  }
}

/**
 * Hook to subscribe to multiple tables
 */
export function useRealtimeMulti(
  subscriptions: Array<{
    table: string
    swrKey: string
    event?: ChangeType
  }>,
  options?: { enabled?: boolean }
) {
  const { user, isAuthenticated } = useAuth()
  const enabled = options?.enabled !== false && isAuthenticated && user

  useEffect(() => {
    if (!enabled) return

    const userId = user.id
    const channels: string[] = []

    subscriptions.forEach(({ table, swrKey, event }) => {
      const channelName = `realtime:${table}:${userId}`
      const filter = `user_id=eq.${userId}`

      subscribeToTable(
        table,
        () => {
          mutate(swrKey)
        },
        { event, filter }
      )

      channels.push(channelName)
    })

    return () => {
      channels.forEach((name) => realtimeManager.unsubscribe(name))
    }
  }, [enabled, user, subscriptions])

  return {
    isSubscribed: enabled,
    activeChannels: realtimeManager.getActiveChannelsCount(),
  }
}

/**
 * Hook for realtime status indicator
 */
export function useRealtimeStatus() {
  const [status, setStatus] = useState<"connected" | "disconnected" | "connecting">("disconnected")
  const [activeChannels, setActiveChannels] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveChannels(realtimeManager.getActiveChannelsCount())
      setStatus(activeChannels > 0 ? "connected" : "disconnected")
    }, 1000)

    return () => clearInterval(interval)
  }, [activeChannels])

  return {
    status,
    activeChannels,
    isConnected: status === "connected",
  }
}

/**
 * Hook to sync local changes to server in real-time
 */
export function useRealtimeSync<T extends { id: string }>(
  table: string,
  localData: T[],
  options?: {
    enabled?: boolean
    syncInterval?: number
  }
) {
  const { user, isAuthenticated } = useAuth()
  const lastSyncRef = useRef<Date | null>(null)
  const enabled = options?.enabled !== false && isAuthenticated

  const syncToServer = useCallback(
    async (changes: T[]) => {
      if (!enabled || !user) return

      try {
        const response = await fetch(`/api/${table}/sync`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ changes }),
        })

        if (response.ok) {
          lastSyncRef.current = new Date()
        }
      } catch (error) {
        console.error(`[RealtimeSync] Failed to sync ${table}:`, error)
      }
    },
    [enabled, user, table]
  )

  // Auto-sync on interval
  useEffect(() => {
    if (!enabled) return

    const interval = setInterval(() => {
      if (localData.length > 0) {
        syncToServer(localData)
      }
    }, options?.syncInterval || 5000)

    return () => clearInterval(interval)
  }, [enabled, localData, syncToServer, options?.syncInterval])

  return {
    syncToServer,
    lastSync: lastSyncRef.current,
  }
}
