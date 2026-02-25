// ============================================
// IDENTITY & FOUNDATION
// ============================================

import type { Identity, CoreValue, LifeArea, Role } from "@/lib/types"
import { getStore, setStore, KEYS, mutateKey, genId, now } from "./core"
import { defaultIdentity } from "./defaults"

// Identity
export function getIdentity(): Identity {
  return getStore(KEYS.identity, defaultIdentity)
}

export function updateIdentity(updates: Partial<Identity>) {
  const current = getIdentity()
  setStore(KEYS.identity, { ...current, ...updates, updatedAt: now() })
  mutateKey(KEYS.identity)
}

// Core Values
export function getValues(): CoreValue[] {
  return getStore(KEYS.values, [])
}

export function addValue(value: Omit<CoreValue, "id">) {
  const values = getValues()
  const newValue: CoreValue = { ...value, id: genId() }
  setStore(KEYS.values, [...values, newValue])
  mutateKey(KEYS.values)
  return newValue
}

export function updateValue(id: string, updates: Partial<CoreValue>) {
  const values = getValues()
  setStore(KEYS.values, values.map(v => v.id === id ? { ...v, ...updates } : v))
  mutateKey(KEYS.values)
}

export function deleteValue(id: string) {
  const values = getValues()
  setStore(KEYS.values, values.filter(v => v.id !== id))
  mutateKey(KEYS.values)
}

// Life Areas
export function getAreas(): LifeArea[] {
  return getStore(KEYS.areas, [])
}

export function addArea(area: Omit<LifeArea, "id">) {
  const areas = getAreas()
  const newArea: LifeArea = { ...area, id: genId() }
  setStore(KEYS.areas, [...areas, newArea])
  mutateKey(KEYS.areas)
  return newArea
}

export function updateArea(id: string, updates: Partial<LifeArea>) {
  const areas = getAreas()
  setStore(KEYS.areas, areas.map(a => a.id === id ? { ...a, ...updates } : a))
  mutateKey(KEYS.areas)
}

export function deleteArea(id: string) {
  const areas = getAreas()
  setStore(KEYS.areas, areas.filter(a => a.id !== id))
  mutateKey(KEYS.areas)
}

// Roles
export function getRoles(): Role[] {
  return getStore(KEYS.roles, [])
}

export function addRole(role: Omit<Role, "id">) {
  const roles = getRoles()
  const newRole: Role = { ...role, id: genId() }
  setStore(KEYS.roles, [...roles, newRole])
  mutateKey(KEYS.roles)
  return newRole
}

export function updateRole(id: string, updates: Partial<Role>) {
  const roles = getRoles()
  setStore(KEYS.roles, roles.map(r => r.id === id ? { ...r, ...updates } : r))
  mutateKey(KEYS.roles)
}

export function deleteRole(id: string) {
  const roles = getRoles()
  setStore(KEYS.roles, roles.filter(r => r.id !== id))
  mutateKey(KEYS.roles)
}
