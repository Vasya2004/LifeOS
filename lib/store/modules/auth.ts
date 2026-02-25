// ============================================
// AUTH MODULE - User Authentication State
// ============================================

import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

// Singleton client for auth module
const supabase = createClient()

/**
 * Get the current authenticated user ID
 * Returns null if not authenticated
 */
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.user?.id || null
  } catch (error) {
    console.error("[Auth] Failed to get current user:", error)
    return null
  }
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.user || null
  } catch (error) {
    console.error("[Auth] Failed to get current user:", error)
    return null
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const userId = await getCurrentUserId()
  return !!userId
}

/**
 * Synchronous version for non-async contexts
 * Uses localStorage fallback for client-side only
 * NOTE: This should only be used in browser environments
 */
export function getCurrentUserIdSync(): string | null {
  if (typeof window === "undefined") return null
  
  try {
    // Try to get from Supabase session in localStorage
    const sessionKey = Object.keys(localStorage).find(key => 
      key.startsWith('sb-') && key.endsWith('-auth-token')
    )
    
    if (sessionKey) {
      const sessionData = localStorage.getItem(sessionKey)
      if (sessionData) {
        const session = JSON.parse(sessionData)
        return session?.user?.id || null
      }
    }
    
    return null
  } catch (error) {
    console.error("[Auth] Failed to get user sync:", error)
    return null
  }
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth(): Promise<string> {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error("Authentication required")
  }
  return userId
}

// ============================================
// Auth State Subscription
// ============================================

let currentUserId: string | null = null

/**
 * Initialize auth state tracking
 * Call this once in app initialization
 */
export function initAuthTracking(): void {
  if (typeof window === "undefined") return
  
  // Get initial user
  getCurrentUserId().then(userId => {
    currentUserId = userId
  })
  
  // Subscribe to auth changes
  supabase.auth.onAuthStateChange((event, session) => {
    currentUserId = session?.user?.id || null
    
    // Clear localStorage data on sign out
    if (event === "SIGNED_OUT") {
      clearUserData()
    }
  })
}

/**
 * Get cached user ID (sync)
 * Requires initAuthTracking to be called first
 */
export function getCachedUserId(): string | null {
  return currentUserId
}

/**
 * Clear all user-specific data from localStorage
 */
export function clearUserData(): void {
  if (typeof window === "undefined") return
  
  const prefix = "lifeos_"
  Object.keys(localStorage)
    .filter(key => key.startsWith(prefix))
    .forEach(key => localStorage.removeItem(key))
}
