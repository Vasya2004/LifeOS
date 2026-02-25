// ============================================
// REALTIME CLIENT - Supabase Realtime subscriptions
// ============================================

import { createClient } from "@/lib/supabase/client"
import type { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js"

export type ChangeType = "INSERT" | "UPDATE" | "DELETE" | "*"

export interface RealtimeConfig {
  table: string
  event?: ChangeType
  filter?: string
  callback: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void
}

class RealtimeManager {
  private channels = new Map<string, RealtimeChannel>()
  private supabase = createClient()

  /**
   * Subscribe to table changes
   */
  subscribe(channelName: string, config: RealtimeConfig): RealtimeChannel {
    // Unsubscribe existing channel with same name
    this.unsubscribe(channelName)

    const channel = this.supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: config.event || "*",
          schema: "public",
          table: config.table,
          filter: config.filter,
        },
        config.callback
      )
      .subscribe((status) => {
        console.log(`[Realtime] ${channelName}: ${status}`)
      })

    this.channels.set(channelName, channel)
    return channel
  }

  /**
   * Unsubscribe from channel
   */
  unsubscribe(channelName: string): void {
    const channel = this.channels.get(channelName)
    if (channel) {
      channel.unsubscribe()
      this.supabase.removeChannel(channel)
      this.channels.delete(channelName)
      console.log(`[Realtime] ${channelName}: unsubscribed`)
    }
  }

  /**
   * Unsubscribe all channels
   */
  unsubscribeAll(): void {
    this.channels.forEach((channel, name) => {
      channel.unsubscribe()
      this.supabase.removeChannel(channel)
      console.log(`[Realtime] ${name}: unsubscribed`)
    })
    this.channels.clear()
  }

  /**
   * Get active channels count
   */
  getActiveChannelsCount(): number {
    return this.channels.size
  }

  /**
   * Check if channel is active
   */
  isSubscribed(channelName: string): boolean {
    return this.channels.has(channelName)
  }
}

// Singleton instance
export const realtimeManager = new RealtimeManager()

// Helper functions for common use cases

export function subscribeToTable(
  table: string,
  callback: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void,
  options?: { event?: ChangeType; filter?: string }
): RealtimeChannel {
  return realtimeManager.subscribe(`table:${table}`, {
    table,
    event: options?.event,
    filter: options?.filter,
    callback,
  })
}

export function subscribeToUserData(
  userId: string,
  callback: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void
): RealtimeChannel {
  return realtimeManager.subscribe(`user:${userId}:data`, {
    table: "user_data",
    event: "*",
    filter: `user_id=eq.${userId}`,
    callback,
  })
}

export function subscribeToGoals(
  userId: string,
  callback: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void
): RealtimeChannel {
  return realtimeManager.subscribe(`user:${userId}:goals`, {
    table: "goals",
    event: "*",
    filter: `user_id=eq.${userId}`,
    callback,
  })
}

export function subscribeToTasks(
  userId: string,
  callback: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void
): RealtimeChannel {
  return realtimeManager.subscribe(`user:${userId}:tasks`, {
    table: "tasks",
    event: "*",
    filter: `user_id=eq.${userId}`,
    callback,
  })
}

export function subscribeToHabits(
  userId: string,
  callback: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void
): RealtimeChannel {
  return realtimeManager.subscribe(`user:${userId}:habits`, {
    table: "habits",
    event: "*",
    filter: `user_id=eq.${userId}`,
    callback,
  })
}

export function subscribeToSkills(
  userId: string,
  callback: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void
): RealtimeChannel {
  return realtimeManager.subscribe(`user:${userId}:skills`, {
    table: "skills",
    event: "*",
    filter: `user_id=eq.${userId}`,
    callback,
  })
}
