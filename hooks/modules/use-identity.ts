// ============================================
// IDENTITY HOOKS
// ============================================

"use client"

import { useOfflineFirst } from "@/hooks/core/use-offline-first"
import * as localStore from "@/lib/store"
import * as db from "@/lib/api/database"
import { setStore } from "@/lib/store/utils/storage"
import { useAuth } from "@/lib/auth/context"
import { addToQueue } from "@/lib/sync/offline-first"
import type { Identity, CoreValue, Role } from "@/lib/types"

const IDENTITY_KEY = "identity"
const VALUES_KEY = "values"
const ROLES_KEY = "roles"

export function useIdentity() {
  const { isAuthenticated, isGuest } = useAuth()

  return useOfflineFirst<Identity>(IDENTITY_KEY, {
    storageKey: IDENTITY_KEY,
    getLocal: localStore.getIdentity,
    getServer: isAuthenticated && !isGuest
      ? async () => {
        try {
          const profile = await db.getProfile()
          return {
            id: profile.id,
            name: profile.name,
            vision: profile.vision || "",
            mission: profile.mission || "",
            onboardingCompleted: profile.onboarding_completed || false,
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt,
          }
        } catch {
          return localStore.getIdentity()
        }
      }
      : undefined,
    setLocal: (data) => setStore(IDENTITY_KEY, data),
  })
}

export function useUpdateIdentity() {
  return async (updates: Partial<Identity>) => {
    localStore.updateIdentity(updates)
  }
}

// Values
export function useValues() {
  const { isAuthenticated, isGuest } = useAuth()

  return useOfflineFirst<CoreValue[]>(VALUES_KEY, {
    storageKey: VALUES_KEY,
    getLocal: localStore.getValues,
    getServer: isAuthenticated && !isGuest ? db.getValues : undefined,
    setLocal: (data) => setStore(VALUES_KEY, data),
  })
}

export function useCreateValue() {
  const { isAuthenticated, isGuest } = useAuth()

  return async (value: Omit<CoreValue, "id">) => {
    const newValue = localStore.addValue(value)

    if (isAuthenticated && !isGuest) {
      addToQueue({ table: "values", operation: "insert", recordId: newValue.id, data: newValue as unknown as Record<string, unknown> })
    }

    return newValue
  }
}

export function useUpdateValue() {
  const { isAuthenticated, isGuest } = useAuth()

  return async (id: string, updates: Partial<CoreValue>) => {
    localStore.updateValue(id, updates)

    if (isAuthenticated && !isGuest) {
      const updated = { ...localStore.getValues().find(v => v.id === id), ...updates, id }
      addToQueue({ table: "values", operation: "update", recordId: updated.id as string, data: updated as unknown as Record<string, unknown> })
    }
  }
}

export function useDeleteValue() {
  const { isAuthenticated, isGuest } = useAuth()

  return async (id: string) => {
    localStore.deleteValue(id)

    if (isAuthenticated && !isGuest) {
      addToQueue({ table: "values", operation: "delete", recordId: id })
    }
  }
}

// Roles
export function useRoles() {
  return { data: localStore.getRoles() }
}

export function useCreateRole() {
  const { isAuthenticated, isGuest } = useAuth()

  return async (role: Omit<Role, "id">) => {
    const newRole = localStore.addRole(role)

    if (isAuthenticated) {
      // NOTE: Roles table is currently missing from Supabase schema.
      // We skip server sync for now to avoid persistent errors.
      // await syncToServer("insert", "roles", newRole, () => { })
    }

    return newRole
  }
}

export function useUpdateRole() {
  const { isAuthenticated, isGuest } = useAuth()

  return async (id: string, updates: Partial<Role>) => {
    localStore.updateRole(id, updates)

    if (isAuthenticated) {
      // await syncToServer("update", "roles", { ...localStore.getRoles().find(r => r.id === id), ...updates, id }, () => { })
    }
  }
}

export function useDeleteRole() {
  const { isAuthenticated, isGuest } = useAuth()

  return async (id: string) => {
    localStore.deleteRole(id)

    if (isAuthenticated) {
      // await syncToServer("delete", "roles", id, () => { })
    }
  }
}
