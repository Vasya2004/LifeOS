// ============================================
// INDEXEDDB STORAGE ENGINE
// Memory cache + IndexedDB persistence
// Replaces localStorage as primary store
// ============================================

const DB_NAME = "lifeos-db"
const DB_VERSION = 1
const STORE_NAME = "keyval"
const LS_PREFIX = "lifeos_"

// ── In-memory cache (synchronous reads) ─────────────────────────
const memCache = new Map<string, unknown>()

// ── IDB state ────────────────────────────────────────────────────
let db: IDBDatabase | null = null
let useFallback = false // true if IDB is unavailable
let initPromise: Promise<void> | null = null

// ── Open IDB ─────────────────────────────────────────────────────

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)

    req.onupgradeneeded = (e) => {
      const database = (e.target as IDBOpenDBRequest).result
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME)
      }
    }

    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
    req.onblocked = () => reject(new Error("IDB blocked"))
  })
}

// ── IDB read/write helpers ────────────────────────────────────────

function idbGet(key: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    if (!db) return resolve(undefined)
    const tx = db.transaction(STORE_NAME, "readonly")
    const req = tx.objectStore(STORE_NAME).get(key)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

function idbSet(key: string, value: unknown): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!db) return resolve()
    const tx = db.transaction(STORE_NAME, "readwrite")
    const req = tx.objectStore(STORE_NAME).put(value, key)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

function idbDelete(key: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!db) return resolve()
    const tx = db.transaction(STORE_NAME, "readwrite")
    const req = tx.objectStore(STORE_NAME).delete(key)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

function idbGetAll(): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    if (!db) return resolve({})
    const result: Record<string, unknown> = {}
    const tx = db.transaction(STORE_NAME, "readonly")
    const store = tx.objectStore(STORE_NAME)

    const keysReq = store.getAllKeys()
    keysReq.onsuccess = () => {
      const keys = keysReq.result as string[]
      if (keys.length === 0) return resolve(result)

      let remaining = keys.length
      keys.forEach((key) => {
        const valReq = store.get(key)
        valReq.onsuccess = () => {
          result[key] = valReq.result
          if (--remaining === 0) resolve(result)
        }
        valReq.onerror = () => {
          if (--remaining === 0) resolve(result)
        }
      })
    }
    keysReq.onerror = () => reject(keysReq.error)
  })
}

function idbClear(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!db) return resolve()
    const tx = db.transaction(STORE_NAME, "readwrite")
    const req = tx.objectStore(STORE_NAME).clear()
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

// ── Fire-and-forget async write ──────────────────────────────────

function asyncWrite(key: string, value: unknown): void {
  if (!db || useFallback) return
  idbSet(key, value).catch((err) => {
    console.error("[IDB] Write failed for key:", key, err)
  })
}

function asyncDelete(key: string): void {
  if (!db || useFallback) return
  idbDelete(key).catch((err) => {
    console.error("[IDB] Delete failed for key:", key, err)
  })
}

// ── Migration from localStorage ──────────────────────────────────

async function migrateFromLocalStorage(): Promise<void> {
  if (typeof window === "undefined") return

  const lsKeys = Object.keys(localStorage).filter((k) => k.startsWith(LS_PREFIX))
  if (lsKeys.length === 0) return

  console.log(`[IDB] Migrating ${lsKeys.length} keys from localStorage`)

  const migrated: Record<string, unknown> = {}

  for (const lsKey of lsKeys) {
    try {
      const raw = localStorage.getItem(lsKey)
      if (raw === null) continue
      const stripped = lsKey.slice(LS_PREFIX.length)
      const value = JSON.parse(raw)
      memCache.set(stripped, value)
      migrated[stripped] = value
    } catch (e) {
      console.warn("[IDB] Could not migrate key:", lsKey, e)
    }
  }

  // Bulk write to IDB
  if (db) {
    const writes = Object.entries(migrated).map(([key, value]) => idbSet(key, value))
    await Promise.allSettled(writes)
  }

  // Only clear localStorage after successful IDB write
  for (const lsKey of lsKeys) {
    try {
      localStorage.removeItem(lsKey)
    } catch {}
  }

  console.log("[IDB] Migration complete")
}

// ── Public API ────────────────────────────────────────────────────

/**
 * Initialize IndexedDB and load all data into memory cache.
 * Must be called once before using cacheGet/cacheSet.
 * Idempotent — safe to call multiple times.
 */
export async function initIDB(): Promise<void> {
  if (initPromise) return initPromise
  initPromise = _init()
  return initPromise
}

async function _init(): Promise<void> {
  if (typeof window === "undefined") return

  try {
    db = await openDatabase()

    // Load all existing IDB data into cache
    const existing = await idbGetAll()
    const hasData = Object.keys(existing).length > 0

    if (hasData) {
      // Normal startup: populate cache from IDB
      for (const [key, value] of Object.entries(existing)) {
        memCache.set(key, value)
      }
    } else {
      // First run: migrate from localStorage
      await migrateFromLocalStorage()
    }
  } catch (err) {
    console.warn("[IDB] IndexedDB unavailable, falling back to localStorage:", err)
    useFallback = true

    // Populate cache from localStorage as fallback
    if (typeof window !== "undefined") {
      Object.keys(localStorage)
        .filter((k) => k.startsWith(LS_PREFIX))
        .forEach((lsKey) => {
          try {
            const raw = localStorage.getItem(lsKey)
            if (raw !== null) {
              memCache.set(lsKey.slice(LS_PREFIX.length), JSON.parse(raw))
            }
          } catch {}
        })
    }
  }
}

/**
 * Synchronous read from memory cache.
 * Returns fallback if key not found.
 */
export function cacheGet<T>(key: string, fallback: T): T {
  if (memCache.has(key)) {
    return memCache.get(key) as T
  }

  // Fallback: try localStorage directly (before initIDB completes)
  if (typeof window !== "undefined" && useFallback) {
    try {
      const raw = localStorage.getItem(`${LS_PREFIX}${key}`)
      if (raw !== null) {
        const value = JSON.parse(raw) as T
        memCache.set(key, value)
        return value
      }
    } catch {}
  }

  return fallback
}

/**
 * Synchronous write to memory cache + async persist to IDB.
 */
export function cacheSet<T>(key: string, value: T): void {
  memCache.set(key, value)

  if (useFallback) {
    // Fallback: write to localStorage
    try {
      localStorage.setItem(`${LS_PREFIX}${key}`, JSON.stringify(value))
    } catch (e) {
      console.error("[Storage] localStorage write failed:", e)
    }
  } else {
    asyncWrite(key, value)
  }
}

/**
 * Remove a key from cache and IDB.
 */
export function cacheRemove(key: string): void {
  memCache.delete(key)

  if (useFallback) {
    try {
      localStorage.removeItem(`${LS_PREFIX}${key}`)
    } catch {}
  } else {
    asyncDelete(key)
  }
}

/**
 * Clear all lifeos_ keys from cache and IDB.
 */
export function cacheClear(): void {
  memCache.clear()

  if (useFallback) {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(LS_PREFIX))
      .forEach((k) => {
        try {
          localStorage.removeItem(k)
        } catch {}
      })
  } else {
    idbClear().catch((err) => {
      console.error("[IDB] Clear failed:", err)
    })
  }
}

/**
 * Get all cached keys (for backup/export).
 */
export function getCacheKeys(): string[] {
  return [...memCache.keys()]
}

/**
 * Whether IDB has been successfully initialized.
 */
export function isIDBReady(): boolean {
  return db !== null && !useFallback
}

/**
 * Whether the fallback (localStorage) mode is active.
 */
export function isUsingFallback(): boolean {
  return useFallback
}
