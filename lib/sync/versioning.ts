// ============================================
// VERSIONING - Document history and reverts
// ============================================

import type { VersionedEntity, VectorClock } from "./conflict-resolver"

export interface DocumentVersion<T> {
  id: string
  entityId: string
  version: number
  data: T
  vectorClock: VectorClock
  modifiedAt: string
  deviceId: string
  changeDescription?: string
  parentVersion?: string
}

export interface VersionHistory<T> {
  entityId: string
  versions: DocumentVersion<T>[]
  currentVersion: number
}

const VERSION_HISTORY_KEY = 'lifeos_version_history'
const MAX_HISTORY_SIZE = 50 // Keep last 50 versions per entity

// Get version history store
function getHistoryStore(): Map<string, VersionHistory<unknown>> {
  if (typeof window === 'undefined') return new Map()
  
  try {
    const stored = localStorage.getItem(VERSION_HISTORY_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return new Map(Object.entries(parsed))
    }
  } catch (e) {
    console.error('Failed to load version history:', e)
  }
  
  return new Map()
}

// Save version history
function saveHistoryStore(store: Map<string, unknown>) {
  if (typeof window === 'undefined') return
  
  try {
    const obj = Object.fromEntries(store)
    localStorage.setItem(VERSION_HISTORY_KEY, JSON.stringify(obj))
  } catch (e) {
    console.error('Failed to save version history:', e)
  }
}

// Create a new version
export function createVersion<T>(
  entityId: string,
  data: T,
  vectorClock: VectorClock,
  deviceId: string,
  changeDescription?: string,
  parentVersion?: string
): DocumentVersion<T> {
  const history = getHistoryStore()
  const existing = history.get(entityId) as VersionHistory<T> | undefined
  
  const newVersion: DocumentVersion<T> = {
    id: `${entityId}-v${(existing?.currentVersion || 0) + 1}-${Date.now()}`,
    entityId,
    version: (existing?.currentVersion || 0) + 1,
    data,
    vectorClock,
    modifiedAt: new Date().toISOString(),
    deviceId,
    changeDescription,
    parentVersion,
  }
  
  // Update history
  const updatedHistory: VersionHistory<T> = {
    entityId,
    versions: [
      ...(existing?.versions || []),
      newVersion,
    ].slice(-MAX_HISTORY_SIZE),
    currentVersion: newVersion.version,
  }
  
  history.set(entityId, updatedHistory)
  saveHistoryStore(history)
  
  return newVersion
}

// Get version history for an entity
export function getVersionHistory<T>(entityId: string): VersionHistory<T> | null {
  const history = getHistoryStore()
  return (history.get(entityId) as VersionHistory<T>) || null
}

// Get specific version
export function getVersion<T>(entityId: string, versionId: string): DocumentVersion<T> | null {
  const history = getVersionHistory<T>(entityId)
  if (!history) return null
  
  return history.versions.find(v => v.id === versionId) || null
}

// Get version by number
export function getVersionByNumber<T>(entityId: string, version: number): DocumentVersion<T> | null {
  const history = getVersionHistory<T>(entityId)
  if (!history) return null
  
  return history.versions.find(v => v.version === version) || null
}

// Revert to a specific version
export function revertToVersion<T extends Record<string, unknown>>(
  entityId: string,
  versionId: string,
  currentEntity: VersionedEntity<T>,
  deviceId: string
): { success: boolean; reverted?: VersionedEntity<T>; error?: string } {
  const targetVersion = getVersion<T>(entityId, versionId)
  if (!targetVersion) {
    return { success: false, error: 'Version not found' }
  }
  
  // Create new version with reverted data
  const reverted: VersionedEntity<T> = {
    id: entityId,
    data: targetVersion.data,
    _version: currentEntity._version + 1,
    _modifiedAt: new Date().toISOString(),
    _deviceId: deviceId,
    _vectorClock: {
      ...currentEntity._vectorClock,
      [deviceId]: (currentEntity._vectorClock[deviceId] || 0) + 1,
    },
  }
  
  // Record the revert in history
  createVersion(
    entityId,
    targetVersion.data,
    reverted._vectorClock,
    deviceId,
    `Reverted to version ${targetVersion.version}`,
    targetVersion.id
  )
  
  return { success: true, reverted }
}

// Compare two versions
export interface VersionDiff {
  added: string[]
  removed: string[]
  modified: { key: string; oldValue: unknown; newValue: unknown }[]
}

export function compareVersions<T extends Record<string, unknown>>(
  oldVersion: DocumentVersion<T>,
  newVersion: DocumentVersion<T>
): VersionDiff {
  const diff: VersionDiff = {
    added: [],
    removed: [],
    modified: [],
  }
  
  const oldKeys = Object.keys(oldVersion.data)
  const newKeys = Object.keys(newVersion.data)
  
  // Find added keys
  for (const key of newKeys) {
    if (!oldKeys.includes(key)) {
      diff.added.push(key)
    }
  }
  
  // Find removed keys
  for (const key of oldKeys) {
    if (!newKeys.includes(key)) {
      diff.removed.push(key)
    }
  }
  
  // Find modified keys
  for (const key of newKeys) {
    if (oldKeys.includes(key)) {
      const oldVal = oldVersion.data[key]
      const newVal = newVersion.data[key]
      
      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        diff.modified.push({ key, oldValue: oldVal, newValue: newVal })
      }
    }
  }
  
  return diff
}

// Get diff between current and previous version
export function getLatestDiff<T extends Record<string, unknown>>(
  entityId: string
): VersionDiff | null {
  const history = getVersionHistory<T>(entityId)
  if (!history || history.versions.length < 2) return null
  
  const versions = history.versions
  const newVersion = versions[versions.length - 1]
  const oldVersion = versions[versions.length - 2]
  
  return compareVersions(oldVersion, newVersion)
}

// Cleanup old history
export function cleanupVersionHistory(entityId?: string): void {
  const history = getHistoryStore()
  
  if (entityId) {
    // Cleanup specific entity
    const entityHistory = history.get(entityId) as VersionHistory<unknown> | undefined
    if (entityHistory) {
      entityHistory.versions = entityHistory.versions.slice(-MAX_HISTORY_SIZE)
      history.set(entityId, entityHistory)
    }
  } else {
    // Cleanup all entities
    for (const [id, entityHistory] of history) {
      const eh = entityHistory as VersionHistory<unknown>
      if (eh.versions.length > MAX_HISTORY_SIZE) {
        eh.versions = eh.versions.slice(-MAX_HISTORY_SIZE)
        history.set(id, eh)
      }
    }
  }
  
  saveHistoryStore(history)
}

// Export version history (for backup)
export function exportVersionHistory(): Record<string, VersionHistory<unknown>> {
  const history = getHistoryStore()
  return Object.fromEntries(history)
}

// Import version history (from backup)
export function importVersionHistory(data: Record<string, VersionHistory<unknown>>): void {
  const history = new Map(Object.entries(data))
  saveHistoryStore(history)
}
