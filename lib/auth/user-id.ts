// ============================================
// USER ID - Get current user ID for localStorage operations
// ============================================

const USER_ID_KEY = "lifeos_current_user_id"

/**
 * Get current user ID from localStorage
 * Returns "anonymous" if no user is logged in
 */
export function getCurrentUserId(): string {
  if (typeof window === "undefined") return "anonymous"
  
  try {
    // Try to get from our custom key first
    const stored = localStorage.getItem(USER_ID_KEY)
    if (stored) return stored
    
    // Fallback: try to extract from Supabase session
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (supabaseUrl) {
      const projectRef = supabaseUrl.match(/https:\/\/(.+)\.supabase\.co/)?.[1]
      if (projectRef) {
        const sessionKey = `sb-${projectRef}-auth-token`
        const session = localStorage.getItem(sessionKey)
        if (session) {
          const parsed = JSON.parse(session)
          const userId = parsed?.user?.id
          if (userId) {
            // Cache it for future use
            localStorage.setItem(USER_ID_KEY, userId)
            return userId
          }
        }
      }
    }
  } catch {
    // localStorage not available or error parsing
  }
  
  return "anonymous"
}

/**
 * Set current user ID in localStorage
 * Called when user logs in
 */
export function setCurrentUserId(userId: string | null): void {
  if (typeof window === "undefined") return
  
  try {
    if (userId) {
      localStorage.setItem(USER_ID_KEY, userId)
    } else {
      localStorage.removeItem(USER_ID_KEY)
    }
  } catch {
    // localStorage not available
  }
}

/**
 * Clear current user ID
 * Called when user logs out
 */
export function clearCurrentUserId(): void {
  if (typeof window === "undefined") return
  
  try {
    localStorage.removeItem(USER_ID_KEY)
  } catch {
    // localStorage not available
  }
}
