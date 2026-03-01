// ============================================
// MIGRATION - Migrate existing data to versioned structure
// ============================================

import { getStore, setStore } from "@/lib/store/utils/storage"
import { KEYS } from "@/lib/store/keys"
import type { StoreKey } from "@/lib/store/keys"
import {
  createVersionedEntity,
  type VersionedEntity
} from "./conflict-resolver"
import { DocumentVersionManager } from "./versioning"

// ============================================
// TYPES
// ============================================

export interface MigrationStatus {
  isMigrating: boolean
  totalEntities: number
  processedEntities: number
  failedEntities: number
  currentTable: string | null
  startedAt: string | null
  completedAt: string | null
  error: string | null
}

export interface MigrationResult {
  success: boolean
  migratedCount: number
  failedCount: number
  errors: string[]
}

export interface EntityWithId {
  id: string
  [key: string]: unknown
}

// ============================================
// MIGRATION STATE
// ============================================

const MIGRATION_STATUS_KEY = "lifeos_migration_status"
const MIGRATION_COMPLETED_KEY = "lifeos_version_migration_completed"
const MIGRATION_VERSION_KEY = "lifeos_data_schema_version"

const CURRENT_SCHEMA_VERSION = 2 // Version 2 = versioned entities

/**
 * Get migration status
 */
export function getMigrationStatus(): MigrationStatus {
  return getStore<MigrationStatus>(MIGRATION_STATUS_KEY, {
    isMigrating: false,
    totalEntities: 0,
    processedEntities: 0,
    failedEntities: 0,
    currentTable: null,
    startedAt: null,
    completedAt: null,
    error: null,
  })
}

/**
 * Update migration status
 */
function updateStatus(updates: Partial<MigrationStatus>): void {
  const current = getMigrationStatus()
  setStore(MIGRATION_STATUS_KEY, { ...current, ...updates })
}

/**
 * Check if migration is completed
 */
export function isMigrationCompleted(): boolean {
  const schemaVersion = getStore<number>(MIGRATION_VERSION_KEY, 1)
  return schemaVersion >= CURRENT_SCHEMA_VERSION
}

/**
 * Mark migration as completed
 */
function markMigrationCompleted(): void {
  setStore(MIGRATION_VERSION_KEY, CURRENT_SCHEMA_VERSION)
  setStore(MIGRATION_COMPLETED_KEY, new Date().toISOString())
}

// ============================================
// MIGRATION FUNCTIONS
// ============================================

/**
 * Add version metadata to an entity
 */
export function addVersionMetadata<T extends EntityWithId>(
  entity: T,
  deviceId?: string
): VersionedEntity<T> {
  // If already versioned, return as-is
  if (isVersionedEntity(entity)) {
    return entity as VersionedEntity<T>
  }

  return createVersionedEntity(entity.id, entity, deviceId)
}

/**
 * Check if an entity already has version metadata
 */
export function isVersionedEntity(entity: unknown): entity is VersionedEntity {
  if (typeof entity !== "object" || entity === null) return false
  
  const e = entity as VersionedEntity
  return (
    "_version" in e &&
    "_modifiedAt" in e &&
    "_deviceId" in e &&
    "_vectorClock" in e &&
    "data" in e
  )
}

/**
 * Strip version metadata from entity (for backward compatibility)
 */
export function stripVersionMetadata<T>(entity: VersionedEntity<T>): T & EntityWithId {
  return {
    id: entity.id,
    ...entity.data,
  } as T & EntityWithId
}

/**
 * Get plain data from entity (handles both versioned and non-versioned)
 */
export function getEntityData<T>(entity: T | VersionedEntity<T>): T {
  if (isVersionedEntity(entity)) {
    return entity.data as T
  }
  return entity as T
}

// ============================================
// TABLE MAPPINGS
// ============================================

interface TableMapping {
  key: StoreKey
  entityType: string
  hasArrayStructure: boolean
}

const TABLE_MAPPINGS: TableMapping[] = [
  { key: KEYS.goals, entityType: "goal", hasArrayStructure: true },
  { key: KEYS.tasks, entityType: "task", hasArrayStructure: true },
  { key: KEYS.habits, entityType: "habit", hasArrayStructure: true },
  { key: KEYS.projects, entityType: "project", hasArrayStructure: true },
  { key: KEYS.skills, entityType: "skill", hasArrayStructure: true },
  { key: KEYS.accounts, entityType: "account", hasArrayStructure: true },
  { key: KEYS.transactions, entityType: "transaction", hasArrayStructure: true },
  { key: KEYS.financialGoals, entityType: "financial_goal", hasArrayStructure: true },
  { key: KEYS.wishes, entityType: "wish", hasArrayStructure: true },
  { key: KEYS.journal, entityType: "journal_entry", hasArrayStructure: true },
  { key: KEYS.dailyReviews, entityType: "daily_review", hasArrayStructure: true },
  { key: KEYS.weeklyReviews, entityType: "weekly_review", hasArrayStructure: true },
  { key: KEYS.areas, entityType: "life_area", hasArrayStructure: true },
  { key: KEYS.values, entityType: "core_value", hasArrayStructure: true },
  { key: KEYS.roles, entityType: "role", hasArrayStructure: true },
  { key: KEYS.challenges, entityType: "challenge", hasArrayStructure: true },
  { key: KEYS.healthMetrics, entityType: "health_metric", hasArrayStructure: true },
  { key: KEYS.bodyZones, entityType: "body_zone", hasArrayStructure: true },
  { key: KEYS.medicalDocuments, entityType: "medical_document", hasArrayStructure: true },
  { key: KEYS.rewards, entityType: "reward", hasArrayStructure: true },
  { key: KEYS.achievements, entityType: "achievement", hasArrayStructure: true },
  { key: KEYS.timeBlocks, entityType: "time_block", hasArrayStructure: true },
  { key: KEYS.energyHistory, entityType: "energy_state", hasArrayStructure: true },
]

// Single entity tables (not arrays)
const SINGLE_ENTITY_TABLES: { key: StoreKey; entityType: string }[] = [
  { key: KEYS.identity, entityType: "identity" },
  { key: KEYS.stats, entityType: "user_stats" },
  { key: KEYS.healthProfile, entityType: "health_profile" },
  { key: KEYS.settings, entityType: "settings" },
]

// ============================================
// MIGRATION PROCESS
// ============================================

/**
 * Run full migration
 */
export async function runMigration(
  onProgress?: (status: MigrationStatus) => void
): Promise<MigrationResult> {
  // Check if already migrated
  if (isMigrationCompleted()) {
    return {
      success: true,
      migratedCount: 0,
      failedCount: 0,
      errors: ["Migration already completed"],
    }
  }

  const status = getMigrationStatus()
  if (status.isMigrating) {
    return {
      success: false,
      migratedCount: 0,
      failedCount: 0,
      errors: ["Migration already in progress"],
    }
  }

  // Calculate total entities
  let totalEntities = 0
  for (const mapping of TABLE_MAPPINGS) {
    const data = getStore<EntityWithId[]>(mapping.key, [])
    totalEntities += data.length
  }
  for (const mapping of SINGLE_ENTITY_TABLES) {
    const data = getStore<EntityWithId | null>(mapping.key, null)
    if (data) totalEntities++
  }

  updateStatus({
    isMigrating: true,
    totalEntities,
    processedEntities: 0,
    failedEntities: 0,
    startedAt: new Date().toISOString(),
    error: null,
  })

  const errors: string[] = []
  let migratedCount = 0
  let failedCount = 0

  // Migrate array tables
  for (const mapping of TABLE_MAPPINGS) {
    try {
      updateStatus({ currentTable: mapping.entityType })
      onProgress?.(getMigrationStatus())

      const result = migrateTable(mapping.key, mapping.entityType)
      migratedCount += result.migrated
      failedCount += result.failed
      errors.push(...result.errors)

      const currentStatus = getMigrationStatus()
      updateStatus({
        processedEntities: currentStatus.processedEntities + result.migrated + result.failed,
        failedEntities: currentStatus.failedEntities + result.failed,
      })
    } catch (error) {
      const errorMsg = `Failed to migrate ${mapping.entityType}: ${error instanceof Error ? error.message : "Unknown error"}`
      errors.push(errorMsg)
      failedCount++
    }
  }

  // Migrate single entity tables
  for (const mapping of SINGLE_ENTITY_TABLES) {
    try {
      updateStatus({ currentTable: mapping.entityType })
      onProgress?.(getMigrationStatus())

      const result = migrateSingleEntity(mapping.key, mapping.entityType)
      if (result) {
        migratedCount++
      }

      const currentStatus = getMigrationStatus()
      updateStatus({ processedEntities: currentStatus.processedEntities + 1 })
    } catch (error) {
      const errorMsg = `Failed to migrate ${mapping.entityType}: ${error instanceof Error ? error.message : "Unknown error"}`
      errors.push(errorMsg)
      failedCount++
    }
  }

  const success = failedCount === 0 || (failedCount / totalEntities) < 0.1 // 10% tolerance

  updateStatus({
    isMigrating: false,
    completedAt: new Date().toISOString(),
    error: success ? null : `${failedCount} entities failed to migrate`,
  })

  if (success) {
    markMigrationCompleted()
  }

  return {
    success,
    migratedCount,
    failedCount,
    errors,
  }
}

/**
 * Migrate a single table
 */
function migrateTable(
  key: StoreKey,
  entityType: string
): { migrated: number; failed: number; errors: string[] } {
  const entities = getStore<EntityWithId[]>(key, [])
  const errors: string[] = []
  const migrated: VersionedEntity<EntityWithId>[] = []
  let failed = 0

  for (const entity of entities) {
    try {
      if (!entity.id) {
        errors.push(`Entity in ${entityType} missing id`)
        failed++
        continue
      }

      // Skip if already versioned
      if (isVersionedEntity(entity)) {
        migrated.push(entity)
        continue
      }

      const versioned = addVersionMetadata(entity)
      migrated.push(versioned)

      // Create initial version in history
      const versionManager = new DocumentVersionManager(entity.id, entityType)
      versionManager.createFromEntity(versioned, "Initial version (migration)")
    } catch (error) {
      errors.push(`Failed to migrate ${entityType} ${entity.id}: ${error instanceof Error ? error.message : "Unknown"}`)
      failed++
    }
  }

  // Save migrated data
  setStore(key, migrated)

  return {
    migrated: migrated.length,
    failed,
    errors,
  }
}

/**
 * Migrate a single entity table
 */
function migrateSingleEntity(key: StoreKey, entityType: string): boolean {
  const entity = getStore<EntityWithId | null>(key, null)
  if (!entity) return false

  // Skip if already versioned
  if (isVersionedEntity(entity)) return true

  const versioned = addVersionMetadata(entity)
  setStore(key, versioned)

  // Create initial version
  const versionManager = new DocumentVersionManager(entity.id, entityType)
  versionManager.createFromEntity(versioned, "Initial version (migration)")

  return true
}

// ============================================
// INCREMENTAL MIGRATION
// ============================================

/**
 * Check if specific entity needs migration
 */
export function needsMigration(entity: unknown): boolean {
  return !isVersionedEntity(entity)
}

/**
 * Lazy migration - migrate on access
 */
export function lazyMigrate<T extends EntityWithId>(
  entity: T | VersionedEntity<T>,
  entityType: string
): VersionedEntity<T> {
  if (isVersionedEntity(entity)) {
    return entity as VersionedEntity<T>
  }

  const versioned = addVersionMetadata(entity)
  
  // Optionally create version history entry
  if (typeof window !== "undefined") {
    const versionManager = new DocumentVersionManager(entity.id, entityType)
    versionManager.createFromEntity(versioned, "Auto-migrated on access")
  }

  return versioned
}

/**
 * Batch migrate entities
 */
export function batchMigrate<T extends EntityWithId>(
  entities: (T | VersionedEntity<T>)[],
  entityType: string
): VersionedEntity<T>[] {
  return entities.map(e => lazyMigrate(e, entityType))
}

// ============================================
// BACKWARD COMPATIBILITY
// ============================================

/**
 * Get entities in legacy format (for APIs, exports, etc.)
 */
export function getEntitiesLegacyFormat<T extends EntityWithId>(
  key: StoreKey
): T[] {
  const entities = getStore<(T | VersionedEntity<T>)[]>(key, [])
  return entities.map(e => {
    if (isVersionedEntity(e)) {
      return stripVersionMetadata(e as VersionedEntity<T>)
    }
    return e as T
  })
}

/**
 * Convert versioned entities to legacy format for export
 */
export function toLegacyFormat<T>(data: T | VersionedEntity<T>): T {
  if (isVersionedEntity(data)) {
    return data.data as T
  }
  return data as T
}

// ============================================
// ROLLBACK
// ============================================

const MIGRATION_BACKUP_KEY = "lifeos_pre_migration_backup"

/**
 * Create backup before migration
 */
export function createMigrationBackup(): void {
  const backup: Record<string, unknown> = {}
  
  for (const mapping of TABLE_MAPPINGS) {
    backup[mapping.key] = getStore(mapping.key, [])
  }
  for (const mapping of SINGLE_ENTITY_TABLES) {
    backup[mapping.key] = getStore(mapping.key, null)
  }

  setStore(MIGRATION_BACKUP_KEY, {
    timestamp: new Date().toISOString(),
    data: backup,
  })
}

/**
 * Restore from backup (emergency rollback)
 */
export function restoreFromBackup(): boolean {
  const backup = getStore<{ timestamp: string; data: Record<string, unknown> } | null>(
    MIGRATION_BACKUP_KEY,
    null
  )
  
  if (!backup) return false

  for (const [key, value] of Object.entries(backup.data)) {
    setStore(key, value)
  }

  // Reset migration status
  setStore(MIGRATION_VERSION_KEY, 1)
  setStore(MIGRATION_COMPLETED_KEY, null)
  
  return true
}

/**
 * Check if backup exists
 */
export function hasBackup(): boolean {
  return getStore(MIGRATION_BACKUP_KEY, null) !== null
}

/**
 * Clear backup after successful migration
 */
export function clearBackup(): void {
  setStore(MIGRATION_BACKUP_KEY, null)
}

// ============================================
// MIGRATION UTILITIES
// ============================================

/**
 * Get migration summary
 */
export function getMigrationSummary(): {
  schemaVersion: number
  isCompleted: boolean
  backupExists: boolean
  lastMigration: string | null
} {
  return {
    schemaVersion: getStore(MIGRATION_VERSION_KEY, 1),
    isCompleted: isMigrationCompleted(),
    backupExists: hasBackup(),
    lastMigration: getStore<string | null>(MIGRATION_COMPLETED_KEY, null),
  }
}

/**
 * Force reset migration status (use with caution)
 */
export function resetMigrationStatus(): void {
  setStore(MIGRATION_VERSION_KEY, 1)
  setStore(MIGRATION_COMPLETED_KEY, null)
  setStore(MIGRATION_STATUS_KEY, {
    isMigrating: false,
    totalEntities: 0,
    processedEntities: 0,
    failedEntities: 0,
    currentTable: null,
    startedAt: null,
    completedAt: null,
    error: null,
  })
}

/**
 * Validate migrated data integrity
 */
export function validateMigration(): {
  valid: boolean
  errors: string[]
  stats: {
    totalEntities: number
    versionedEntities: number
    nonVersionedEntities: number
  }
} {
  const errors: string[] = []
  let totalEntities = 0
  let versionedEntities = 0
  let nonVersionedEntities = 0

  for (const mapping of TABLE_MAPPINGS) {
    const entities = getStore<(EntityWithId | VersionedEntity<EntityWithId>)[]>(mapping.key, [])
    
    for (const entity of entities) {
      totalEntities++
      
      if (isVersionedEntity(entity)) {
        versionedEntities++
        
        // Validate structure
        if (!entity.id) {
          errors.push(`${mapping.entityType}: Missing id`)
        }
        if (!entity._modifiedAt) {
          errors.push(`${mapping.entityType} ${entity.id}: Missing _modifiedAt`)
        }
        if (!entity._deviceId) {
          errors.push(`${mapping.entityType} ${entity.id}: Missing _deviceId`)
        }
        if (!entity._vectorClock || Object.keys(entity._vectorClock).length === 0) {
          errors.push(`${mapping.entityType} ${entity.id}: Invalid _vectorClock`)
        }
      } else {
        nonVersionedEntities++
      }
    }
  }

  return {
    valid: errors.length === 0 && nonVersionedEntities === 0,
    errors,
    stats: {
      totalEntities,
      versionedEntities,
      nonVersionedEntities,
    },
  }
}
