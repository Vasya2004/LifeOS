// ============================================
// BASE MODULE - Абстрактный класс для всех модулей
// ============================================

import { mutate } from "swr"
import { getStore, setStore } from "../utils/storage"
import { genId } from "../utils/id"
import { now } from "../utils/date"
import type { StoreKey } from "../keys"

export interface BaseEntity {
  id: string
  createdAt?: string
  updatedAt?: string
}

// Mark changes for cloud sync
function markChanges() {
  if (typeof window !== "undefined") {
    import("@/lib/sync/cloud-sync").then(({ markPendingChanges }) => {
      markPendingChanges()
    }).catch(() => {
      // Ignore if module not available
    })
  }
}

export abstract class BaseModule<T extends BaseEntity> {
  protected abstract key: StoreKey
  protected abstract getDefaultData(): T[]

  // ============ CRUD Operations ============
  
  getAll(): T[] {
    return getStore<T[]>(this.key, this.getDefaultData())
  }

  getById(id: string): T | undefined {
    return this.getAll().find(item => item.id === id)
  }

  create(data: Omit<T, "id" | "createdAt">): T {
    const items = this.getAll()
    const newItem: T = {
      ...data,
      id: genId(),
      createdAt: now(),
    } as T
    
    setStore(this.key, [...items, newItem])
    this.mutate()
    markChanges()
    return newItem
  }

  update(id: string, updates: Partial<Omit<T, "id" | "createdAt">>): T | null {
    const items = this.getAll()
    const item = items.find(i => i.id === id)
    if (!item) return null

    const updated: T = {
      ...item,
      ...updates,
      updatedAt: now(),
    }
    
    setStore(this.key, items.map(i => i.id === id ? updated : i))
    this.mutate()
    markChanges()
    return updated
  }

  delete(id: string): boolean {
    const items = this.getAll()
    const exists = items.some(i => i.id === id)
    if (!exists) return false
    
    setStore(this.key, items.filter(i => i.id !== id))
    this.mutate()
    markChanges()
    return true
  }

  // ============ Bulk Operations ============
  
  setAll(items: T[]) {
    setStore(this.key, items)
    this.mutate()
    markChanges()
  }

  clear() {
    setStore(this.key, [])
    this.mutate()
    markChanges()
  }

  // ============ SWR Integration ============
  
  protected mutate() {
    mutate(this.key)
  }

  // ============ Query Helpers ============
  
  findBy(predicate: (item: T) => boolean): T[] {
    return this.getAll().filter(predicate)
  }

  findOneBy(predicate: (item: T) => boolean): T | undefined {
    return this.getAll().find(predicate)
  }
}
