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
  const updated = { ...current, ...updates, updatedAt: now() }
  setStore(KEYS.identity, updated)
  mutateKey(KEYS.identity, updated)
}

// Core Values
export function getValues(): CoreValue[] {
  return getStore(KEYS.values, [])
}

export function addValue(value: Omit<CoreValue, "id">) {
  const values = getValues()
  const newValue: CoreValue = { ...value, id: genId() }
  const updatedValues = [...values, newValue]
  setStore(KEYS.values, updatedValues)
  mutateKey(KEYS.values, updatedValues)
  return newValue
}

export function updateValue(id: string, updates: Partial<CoreValue>) {
  const values = getValues()
  const updatedValues = values.map(v => v.id === id ? { ...v, ...updates } : v)
  setStore(KEYS.values, updatedValues)
  mutateKey(KEYS.values, updatedValues)
}

export function deleteValue(id: string) {
  const values = getValues()
  const updatedValues = values.filter(v => v.id !== id)
  setStore(KEYS.values, updatedValues)
  mutateKey(KEYS.values, updatedValues)
}

// Life Areas
export function getAreas(): LifeArea[] {
  return getStore(KEYS.areas, [])
}

export function addArea(area: Omit<LifeArea, "id">) {
  const areas = getAreas()
  const newArea: LifeArea = { ...area, id: genId() }
  const updatedAreas = [...areas, newArea]
  setStore(KEYS.areas, updatedAreas)
  mutateKey(KEYS.areas, updatedAreas)
  return newArea
}

export function updateArea(id: string, updates: Partial<LifeArea>) {
  const areas = getAreas()
  const updatedAreas = areas.map(a => a.id === id ? { ...a, ...updates } : a)
  setStore(KEYS.areas, updatedAreas)
  mutateKey(KEYS.areas, updatedAreas)
}

export function deleteArea(id: string) {
  const areas = getAreas()
  const updatedAreas = areas.filter(a => a.id !== id)
  setStore(KEYS.areas, updatedAreas)
  mutateKey(KEYS.areas, updatedAreas)
}

// Roles
export function getRoles(): Role[] {
  return getStore(KEYS.roles, [])
}

export function addRole(role: Omit<Role, "id">) {
  const roles = getRoles()
  const newRole: Role = { ...role, id: genId() }
  const updatedRoles = [...roles, newRole]
  setStore(KEYS.roles, updatedRoles)
  mutateKey(KEYS.roles, updatedRoles)
  return newRole
}

export function updateRole(id: string, updates: Partial<Role>) {
  const roles = getRoles()
  const updatedRoles = roles.map(r => r.id === id ? { ...r, ...updates } : r)
  setStore(KEYS.roles, updatedRoles)
  mutateKey(KEYS.roles, updatedRoles)
}

export function deleteRole(id: string) {
  const roles = getRoles()
  const updatedRoles = roles.filter(r => r.id !== id)
  setStore(KEYS.roles, updatedRoles)
  mutateKey(KEYS.roles, updatedRoles)
}

// ─── Principles ───────────────────────────────────────────────────

export interface Principle {
  id: string
  text: string
  emoji: string
  order: number
  createdAt: string
}

export function getPrinciples(): Principle[] {
  return getStore(KEYS.principles, [])
}

export function addPrinciple(p: Pick<Principle, 'text' | 'emoji'>): Principle {
  const principles = getPrinciples()
  const newPrinciple: Principle = {
    ...p,
    id: genId(),
    order: principles.length,
    createdAt: now(),
  }
  const updated = [...principles, newPrinciple]
  setStore(KEYS.principles, updated)
  mutateKey(KEYS.principles, updated)
  return newPrinciple
}

export function updatePrinciple(id: string, updates: Partial<Pick<Principle, 'text' | 'emoji' | 'order'>>) {
  const principles = getPrinciples()
  const updated = principles.map(p => p.id === id ? { ...p, ...updates } : p)
  setStore(KEYS.principles, updated)
  mutateKey(KEYS.principles, updated)
}

export function deletePrinciple(id: string) {
  const principles = getPrinciples()
  const updated = principles.filter(p => p.id !== id).map((p, i) => ({ ...p, order: i }))
  setStore(KEYS.principles, updated)
  mutateKey(KEYS.principles, updated)
}
