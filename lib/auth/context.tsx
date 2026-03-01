// ============================================
// AUTH CONTEXT - Authentication & User Management
// ============================================

"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import { setCurrentUserId, clearCurrentUserId } from "./user-id"
import { executeMigrationIfPending } from "./guest-migration"
import { toast } from "sonner"
import type { User, AuthError, Provider } from "@supabase/supabase-js"

const supabase = createClient()

// ============================================
// TYPES
// ============================================

export interface AuthUser extends User {
  profile?: UserProfile
  isGuest?: boolean
}

export interface UserProfile {
  id: string
  name: string
  avatar_url?: string
  vision: string
  mission: string
  onboardingCompleted: boolean
}

export interface AuthState {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  isGuest: boolean
  error: AuthError | null
}

export interface AuthContextValue extends AuthState {
  // Auth methods
  signUp: (email: string, password: string, metadata?: { name?: string }) => Promise<{ error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signInWithOAuth: (provider: Provider) => Promise<{ error: AuthError | null; url?: string }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
  updatePassword: (password: string) => Promise<{ error: AuthError | null }>

  // Profile methods
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: Error | null }>
  refreshProfile: () => Promise<void>
  completeOnboarding: () => Promise<{ error: Error | null }>

  // Guest mode
  signInAsGuest: () => void
}

// ============================================
// CONTEXT
// ============================================

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

// ============================================
// PROVIDER
// ============================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    isGuest: false,
    error: null,
  })

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check for guest mode first
        if (typeof window !== "undefined" && localStorage.getItem("lifeos_guest_mode") === "true") {
          console.log("[AuthProvider] Initializing in Guest Mode")
          signInAsGuest()
          return
        }

        // Get current session
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          const userWithProfile = await fetchUserProfile(session.user)
          setCurrentUserId(session.user.id)
          setState({
            user: userWithProfile,
            isLoading: false,
            isAuthenticated: true,
            isGuest: false,
            error: null,
          })
        } else {
          clearCurrentUserId()
          setState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
            isGuest: false,
            error: null,
          })
        }
      } catch (error) {
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          isGuest: false,
          error: error as AuthError,
        })
      }
    }

    initAuth()

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`[AuthProvider] Auth event: ${event}`, session?.user?.email)

        if (event === "SIGNED_IN" && session?.user) {
          console.log("[AuthProvider] Handling SIGNED_IN event")
          setCurrentUserId(session.user.id)

          try {
            console.log("[AuthProvider] Starting profile fetch with 10s fallback...")
            const profilePromise = fetchUserProfile(session.user)

            // Resolve with base user if profile takes too long, instead of rejecting
            const profileFallback = new Promise<AuthUser>((resolve) =>
              setTimeout(() => {
                console.warn("[AuthProvider] Profile fetch timed out (10s), using fallback")
                resolve(session.user as AuthUser)
              }, 10000)
            )

            const userWithProfile = await Promise.race([profilePromise, profileFallback])
            console.log("[AuthProvider] Profile data acquired (full or fallback)")

            setState(prev => ({
              ...prev,
              user: userWithProfile,
              isAuthenticated: true,
              isLoading: false,
              error: null
            }))

            // Мигрируем гостевые данные в аккаунт (если есть)
            console.log("[AuthProvider] Checking for guest migration...")
            executeMigrationIfPending().then(migrated => {
              if (migrated) {
                console.log("[AuthProvider] Guest migration completed")
                toast.success("Ваш прогресс сохранён!")
              } else {
                console.log("[AuthProvider] No migration needed or failed")
              }
            }).catch(e => console.error("[AuthProvider] Migration error:", e))

          } catch (profileErr) {
            console.error("[AuthProvider] Profile fetch error:", profileErr)
            setState(prev => ({
              ...prev,
              user: session.user as AuthUser,
              isAuthenticated: true,
              isLoading: false
            }))
          }
        } else if (event === "SIGNED_OUT") {
          console.log("[AuthProvider] Handling SIGNED_OUT event")
          clearCurrentUserId()
          setState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
            isGuest: false,
            error: null,
          })
        } else if (event === "TOKEN_REFRESHED") {
          console.log("[AuthProvider] Token refreshed")
        } else if (event === "USER_UPDATED" && session?.user) {
          console.log("[AuthProvider] User updated")
          const userWithProfile = await fetchUserProfile(session.user)
          setState(prev => ({
            ...prev,
            user: userWithProfile,
          }))
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Fetch user profile from profiles table
  const fetchUserProfile = async (user: User): Promise<AuthUser> => {
    const startTime = Date.now()
    console.log(`[fetchUserProfile] Starting fetch for: ${user.id}`)

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      const duration = Date.now() - startTime
      console.log(`[fetchUserProfile] Query finished in ${duration}ms`)

      if (error) {
        console.warn("[fetchUserProfile] Supabase error:", error.message)
        return user as AuthUser
      }

      if (!data) {
        console.warn("[fetchUserProfile] No profile found for user")
        return user as AuthUser
      }

      console.log("[fetchUserProfile] Profile found, returning mapped object")
      return {
        ...user,
        profile: {
          id: data.id,
          name: data.name,
          avatar_url: data.avatar_url,
          vision: data.vision,
          mission: data.mission,
          onboardingCompleted: data.onboarding_completed,
        },
      }
    } catch (err) {
      console.error("[fetchUserProfile] Unexpected exception:", err)
      return user as AuthUser
    }
  }

  // ============================================
  // AUTH METHODS
  // ============================================

  const signUp = async (
    email: string,
    password: string,
    metadata?: { name?: string }
  ): Promise<{ error: AuthError | null }> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: metadata?.name || "Игрок 1",
        },
      },
    })

    setState(prev => ({ ...prev, isLoading: false, error }))
    return { error }
  }

  const signIn = async (email: string, password: string): Promise<{ error: AuthError | null; attemptsLeft?: number }> => {
    console.log("[AuthContext] signIn started for:", email)
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 20000)

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      })
      clearTimeout(timeout)

      const json = await res.json()

      // Rate limited
      if (res.status === 429) {
        const errorObject = {
          message: "too_many_attempts",
          status: 429,
        } as AuthError
        setState(prev => ({ ...prev, isLoading: false, error: errorObject }))
        return { error: errorObject, attemptsLeft: 0 }
      }

      if (!res.ok || json.error) {
        const errorObject = {
          message: json.error || "invalid_credentials",
          status: res.status,
        } as AuthError
        console.warn("[AuthContext] Login failed:", json.error)
        setState(prev => ({ ...prev, isLoading: false, error: errorObject }))
        return { error: errorObject, attemptsLeft: json.attemptsLeft }
      }

      console.log("[AuthContext] Login successful via API")
      // Supabase session is set server-side via cookie — refresh client state
      await supabase.auth.getSession()
      setState(prev => ({ ...prev, isLoading: false, error: null }))
      return { error: null }
    } catch (err: any) {
      console.error("[AuthContext] signIn exception:", err)
      const errorMsg = err?.name === "AbortError" ? "auth_timeout" : (err?.message || "Unknown error")
      const errorObject = { message: errorMsg, status: 500 } as AuthError
      setState(prev => ({ ...prev, isLoading: false, error: errorObject }))
      return { error: errorObject }
    }
  }

  const signInWithOAuth = async (provider: Provider): Promise<{ error: AuthError | null; url?: string }> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    setState(prev => ({ ...prev, isLoading: false, error }))
    return { error, url: data?.url || undefined }
  }

  const signOut = async (): Promise<void> => {
    console.log("[AuthContext] signOut started")
    if (typeof window !== "undefined") {
      localStorage.removeItem("lifeos_guest_mode")
      document.cookie = "lifeos_guest_mode=; path=/; max-age=0; SameSite=Lax"
      localStorage.removeItem("lifeos_current_user_id")
      console.log("[AuthContext] Guest mode and user ID cleared from storage")
    }

    try {
      // Don't let Supabase sign out hang the whole process
      await Promise.race([
        supabase.auth.signOut(),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 1000))
      ]).catch(err => console.warn("[AuthContext] Supabase signOut error or timeout:", err))
    } catch (error) {
      console.error("[AuthContext] signOut error:", error)
    }

    clearCurrentUserId()

    setState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      isGuest: false,
      error: null,
    })
    console.log("[AuthContext] Auth state cleared")
  }

  const resetPassword = async (email: string): Promise<{ error: AuthError | null }> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    setState(prev => ({ ...prev, isLoading: false, error }))
    return { error }
  }

  const updatePassword = async (password: string): Promise<{ error: AuthError | null }> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    const { error } = await supabase.auth.updateUser({ password })

    setState(prev => ({ ...prev, isLoading: false, error }))
    return { error }
  }

  // ============================================
  // PROFILE METHODS
  // ============================================

  const updateProfile = async (updates: Partial<UserProfile>): Promise<{ error: Error | null }> => {
    if (!state.user) return { error: new Error("Not authenticated") }

    const { error } = await supabase
      .from("profiles")
      .update({
        name: updates.name,
        avatar_url: updates.avatar_url,
        vision: updates.vision,
        mission: updates.mission,
        updated_at: new Date().toISOString(),
      })
      .eq("id", state.user.id)

    if (!error) {
      await refreshProfile()
    }

    return { error }
  }

  const completeOnboarding = async (): Promise<{ error: Error | null }> => {
    if (!state.user) return { error: new Error("Not authenticated") }

    const { error } = await supabase
      .from("profiles")
      .update({
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", state.user.id)

    if (!error) {
      await refreshProfile()
    }

    return { error }
  }

  const refreshProfile = async (): Promise<void> => {
    if (!state.user) return

    const userWithProfile = await fetchUserProfile(state.user)
    setState(prev => ({
      ...prev,
      user: userWithProfile,
    }))
  }

  const signInAsGuest = () => {
    console.log("[AuthContext] signInAsGuest started")
    const guestUser: AuthUser = {
      id: "guest-user-id",
      email: "guest@lifeos.local",
      isGuest: true,
      aud: "authenticated",
      role: "authenticated",
      email_confirmed_at: new Date().toISOString(),
      last_sign_in_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      app_metadata: {},
      user_metadata: { name: "Гость" },
      profile: {
        id: "guest-user-id",
        name: "Гость",
        vision: "Изучить возможности LifeOS",
        mission: "Продуктивный день каждый день",
        onboardingCompleted: false
      }
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("lifeos_guest_mode", "true")
      document.cookie = "lifeos_guest_mode=true; path=/; max-age=86400; SameSite=Lax"
      console.log("[AuthContext] LocalStorage lifeos_guest_mode set to true")
    }

    setCurrentUserId(guestUser.id)
    console.log("[AuthContext] LocalStorage lifeos_current_user_id set to", guestUser.id)

    setState({
      user: guestUser,
      isLoading: false,
      isAuthenticated: true,
      isGuest: true,
      error: null
    })
    console.log("[AuthContext] State updated with guest user")
  }

  const value: AuthContextValue = {
    ...state,
    signUp,
    signIn,
    signInWithOAuth,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    refreshProfile,
    completeOnboarding,
    signInAsGuest,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// ============================================
// HOOK
// ============================================

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
