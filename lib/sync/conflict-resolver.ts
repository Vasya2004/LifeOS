// ============================================
// CONFLICT RESOLVER - CRDT-inspired sync
// ============================================

export type ConflictResolution = 'local-wins' | 'remote-wins' | 'merge' | 'manual'

export interface VectorClock {
  [deviceId: string]: number
}

export interface VersionedEntity<T> {
  id: string
  data: T
  _version: number
  _modifiedAt: string
  _deviceId: string
  _vectorClock: VectorClock
  _deleted?: boolean
}

export interface Conflict<T> {
  entityId: string
  local: VersionedEntity<T>
  remote: VersionedEntity<T>
  type: 'concurrent' | 'divergent'
  resolution?: ConflictResolution
}

export interface MergeResult<T> {
  success: boolean
  data?: VersionedEntity<T>
  conflict?: Conflict<T>
  error?: string
}

// Generate unique device ID
export function getDeviceId(): string {
  if (typeof window === 'undefined') return 'server'
  
  let deviceId = localStorage.getItem('lifeos_device_id')
  if (!deviceId) {
    deviceId = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    localStorage.setItem('lifeos_device_id', deviceId)
  }
  return deviceId
}

// Compare vector clocks
// Returns: -1 (a < b), 0 (concurrent/equal), 1 (a > b)
export function compareVectorClocks(a: VectorClock, b: VectorClock): number {
  a = a || {}
  b = b || {}
  const keys = new Set([...Object.keys(a), ...Object.keys(b)])
  
  let aGreater = false
  let bGreater = false
  
  for (const key of keys) {
    const aVal = a[key] || 0
    const bVal = b[key] || 0
    
    if (aVal > bVal) aGreater = true
    if (bVal > aVal) bGreater = true
  }
  
  if (aGreater && !bGreater) return 1
  if (bGreater && !aGreater) return -1
  return 0
}

// Merge vector clocks
export function mergeVectorClocks(a: VectorClock, b: VectorClock): VectorClock {
  a = a || {}
  b = b || {}
  const result: VectorClock = {}
  const keys = new Set([...Object.keys(a), ...Object.keys(b)])
  
  for (const key of keys) {
    result[key] = Math.max(a[key] || 0, b[key] || 0)
  }
  
  return result
}

// Create new versioned entity
export function createVersionedEntity<T>(
  id: string,
  data: T,
  deviceId: string = getDeviceId()
): VersionedEntity<T> {
  return {
    id,
    data,
    _version: 1,
    _modifiedAt: new Date().toISOString(),
    _deviceId: deviceId,
    _vectorClock: { [deviceId]: 1 },
  }
}

// Increment version
export function incrementVersion<T>(
  entity: VersionedEntity<T>,
  deviceId: string = getDeviceId()
): VersionedEntity<T> {
  const newClock = { ...entity._vectorClock }
  newClock[deviceId] = (newClock[deviceId] || 0) + 1
  
  return {
    ...entity,
    _version: entity._version + 1,
    _modifiedAt: new Date().toISOString(),
    _deviceId: deviceId,
    _vectorClock: newClock,
  }
}

// Three-way merge for objects
function threeWayMerge<T extends Record<string, unknown>>(
  base: T | null,
  local: T,
  remote: T
): { merged: T; conflicts: string[] } {
  local = local || {} as T
  remote = remote || {} as T
  const merged = { ...remote } as T
  const conflicts: string[] = []

  const allKeys = new Set([
    ...Object.keys(local),
    ...Object.keys(remote),
    ...(base ? Object.keys(base) : []),
  ])
  
  for (const key of allKeys) {
    const localVal = local[key]
    const remoteVal = remote[key]
    const baseVal = base?.[key]
    
    // Both same, keep it
    if (JSON.stringify(localVal) === JSON.stringify(remoteVal)) {
      ;(merged as Record<string, unknown>)[key] = localVal
      continue
    }
    
    // Only local changed
    if (JSON.stringify(baseVal) === JSON.stringify(remoteVal)) {
      ;(merged as Record<string, unknown>)[key] = localVal
      continue
    }
    
    // Only remote changed
    if (JSON.stringify(baseVal) === JSON.stringify(localVal)) {
      ;(merged as Record<string, unknown>)[key] = remoteVal
      continue
    }
    
    // Both changed differently - conflict
    conflicts.push(key)
    
    // Smart merge for specific types
    if (typeof localVal === 'number' && typeof remoteVal === 'number') {
      // Take max for numbers (progress, counts)
      ;(merged as Record<string, unknown>)[key] = Math.max(localVal, remoteVal)
    } else if (Array.isArray(localVal) && Array.isArray(remoteVal)) {
      // Merge arrays uniquely
      const combined = [...new Set([...localVal, ...remoteVal])]
      ;(merged as Record<string, unknown>)[key] = combined
    } else {
      // Default: prefer local for other conflicts
      ;(merged as Record<string, unknown>)[key] = localVal
    }
  }
  
  return { merged, conflicts }
}

// Main conflict resolution function
export function resolveConflict<T extends Record<string, unknown>>(
  local: VersionedEntity<T>,
  remote: VersionedEntity<T>,
  strategy: ConflictResolution = 'merge',
  base?: VersionedEntity<T> | null
): MergeResult<T> {
  // Check if one is descendant of another
  const clockComparison = compareVectorClocks(local._vectorClock, remote._vectorClock)
  
  // Remote is newer
  if (clockComparison === -1) {
    return {
      success: true,
      data: remote,
    }
  }
  
  // Local is newer
  if (clockComparison === 1) {
    return {
      success: true,
      data: local,
    }
  }
  
  // Concurrent modification - need resolution
  if (clockComparison === 0) {
    // Same version, same data - no conflict
    if (JSON.stringify(local.data) === JSON.stringify(remote.data)) {
      return {
        success: true,
        data: local,
      }
    }
    
    // Apply resolution strategy
    switch (strategy) {
      case 'local-wins':
        return {
          success: true,
          data: incrementVersion(local),
        }
        
      case 'remote-wins':
        return {
          success: true,
          data: incrementVersion(remote),
        }
        
      case 'merge':
        const baseData = base?.data || null
        const { merged, conflicts } = threeWayMerge(baseData, local.data, remote.data)
        
        const mergedEntity: VersionedEntity<T> = {
          id: local.id,
          data: merged,
          _version: Math.max(local._version, remote._version) + 1,
          _modifiedAt: new Date().toISOString(),
          _deviceId: getDeviceId(),
          _vectorClock: mergeVectorClocks(local._vectorClock, remote._vectorClock),
        }
        
        // If there were conflicts that couldn't be auto-resolved
        if (conflicts.length > 0) {
          return {
            success: false,
            conflict: {
              entityId: local.id,
              local,
              remote,
              type: 'divergent',
            },
          }
        }
        
        return {
          success: true,
          data: mergedEntity,
        }
        
      case 'manual':
        return {
          success: false,
          conflict: {
            entityId: local.id,
            local,
            remote,
            type: 'concurrent',
          },
        }
        
      default:
        return {
          success: false,
          error: `Unknown resolution strategy: ${strategy}`,
        }
    }
  }
  
  return {
    success: false,
    error: 'Unexpected comparison result',
  }
}

// Batch conflict resolution
export interface BatchMergeResult<T> {
  resolved: VersionedEntity<T>[]
  conflicts: Conflict<T>[]
  errors: { entityId: string; error: string }[]
}

export function resolveBatchConflicts<T extends Record<string, unknown>>(
  locals: VersionedEntity<T>[],
  remotes: VersionedEntity<T>[],
  strategy: ConflictResolution = 'merge',
  bases?: Map<string, VersionedEntity<T>>
): BatchMergeResult<T> {
  const result: BatchMergeResult<T> = {
    resolved: [],
    conflicts: [],
    errors: [],
  }
  
  const localMap = new Map(locals.map(l => [l.id, l]))
  const remoteMap = new Map(remotes.map(r => [r.id, r]))
  const allIds = new Set([...localMap.keys(), ...remoteMap.keys()])
  
  for (const id of allIds) {
    const local = localMap.get(id)
    const remote = remoteMap.get(id)
    const base = bases?.get(id)
    
    // Only local exists
    if (!remote && local) {
      result.resolved.push(local)
      continue
    }
    
    // Only remote exists
    if (!local && remote) {
      result.resolved.push(remote)
      continue
    }
    
    // Both exist - resolve
    if (local && remote) {
      const mergeResult = resolveConflict(local, remote, strategy, base)
      
      if (mergeResult.success && mergeResult.data) {
        result.resolved.push(mergeResult.data)
      } else if (mergeResult.conflict) {
        result.conflicts.push(mergeResult.conflict)
      } else if (mergeResult.error) {
        result.errors.push({ entityId: id, error: mergeResult.error })
      }
    }
  }
  
  return result
}

// Utility to migrate existing data to versioned format
export function migrateToVersioned<T extends { id: string }>(
  items: T[],
  deviceId: string = getDeviceId()
): VersionedEntity<T>[] {
  return items.map(item => createVersionedEntity(item.id, item, deviceId))
}
