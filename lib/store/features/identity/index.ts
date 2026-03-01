// ============================================
// IDENTITY & FOUNDATION FEATURE MODULE
// ============================================

import type { Identity, CoreValue, LifeArea, Role } from "@/lib/types"
import { getStore, setStore, KEYS, mutateKey, genId, now } from "@/lib/store/core"
import { defaultIdentity } from "@/lib/store/defaults"

// ============================================
// IDENTITY
// ============================================

export function getIdentity(): Identity {
  return getStore(KEYS.identity, defaultIdentity)
}

export function updateIdentity(updates: Partial<Identity>) {
  const current = getIdentity()
  const updated = { ...current, ...updates, updatedAt: now() }
  setStore(KEYS.identity, updated)
  mutateKey(KEYS.identity, updated)
  return updated
}

export function completeOnboarding() {
  return updateIdentity({ onboardingCompleted: true })
}

// ============================================
// CORE VALUES
// ============================================

export function getValues(): CoreValue[] {
  return getStore(KEYS.values, [])
}

export function getValueById(id: string): CoreValue | undefined {
  return getValues().find(v => v.id === id)
}

export function createValue(value: Omit<CoreValue, "id">): CoreValue {
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
  return updatedValues.find(v => v.id === id)
}

export function deleteValue(id: string) {
  const values = getValues()
  const updatedValues = values.filter(v => v.id !== id)
  setStore(KEYS.values, updatedValues)
  mutateKey(KEYS.values, updatedValues)
}

// ============================================
// LIFE AREAS
// ============================================

export function getAreas(): LifeArea[] {
  return getStore(KEYS.areas, [])
}

export function getAreaById(id: string): LifeArea | undefined {
  return getAreas().find(a => a.id === id)
}

export function createArea(area: Omit<LifeArea, "id">): LifeArea {
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
  return updatedAreas.find(a => a.id === id)
}

export function deleteArea(id: string) {
  const areas = getAreas()
  const updatedAreas = areas.filter(a => a.id !== id)
  setStore(KEYS.areas, updatedAreas)
  mutateKey(KEYS.areas, updatedAreas)
}

export function getActiveAreas(): LifeArea[] {
  return getAreas().filter(a => a.isActive)
}

// ============================================
// ROLES
// ============================================

export function getRoles(): Role[] {
  return getStore(KEYS.roles, [])
}

export function getRoleById(id: string): Role | undefined {
  return getRoles().find(r => r.id === id)
}

export function createRole(role: Omit<Role, "id">): Role {
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
  return updatedRoles.find(r => r.id === id)
}

export function deleteRole(id: string) {
  const roles = getRoles()
  const updatedRoles = roles.filter(r => r.id !== id)
  setStore(KEYS.roles, updatedRoles)
  mutateKey(KEYS.roles, updatedRoles)
}

export function getRolesByArea(areaId: string): Role[] {
  return getRoles().filter(r => r.areaId === areaId)
}

// ============================================
// PRINCIPLES
// ============================================

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
  const newPrinciple: Principle = { ...p, id: genId(), order: principles.length, createdAt: now() }
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
