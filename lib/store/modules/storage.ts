// ============================================
// STORAGE MODULE - Хранилище Данных (localStorage)
// ============================================

import { KEYS } from '../keys'
import { getStore, setStore } from '../utils/storage'
import { genId } from '../utils/id'
import { now } from '../utils/date'
import type {
  StorageFolder,
  LearningSource,
  StorageContact,
  Insight,
  StorageResource,
  CreateFolderInput,
  CreateLearningSourceInput,
  CreateInsightInput,
  CreateContactInput,
  CreateResourceInput,
} from '@/lib/types/storage'

// ============================================
// DEFAULT DATA
// ============================================
const defaultFolders: Omit<StorageFolder, 'id' | 'userId' | 'createdAt' | 'updatedAt'>[] = [
  { name: 'Инсайты', type: 'insights', icon: '💡', color: '#fbbf24', description: 'Ключевые выводы с планом применения', isSystem: true, sortOrder: 1 },
  { name: 'Контакты', type: 'contacts', icon: '👥', color: '#8b5cf6', description: 'Полезные знакомства и связи', isSystem: true, sortOrder: 2 },
  { name: 'Ресурсы', type: 'resources', icon: '📚', color: '#22c55e', description: 'Полезные материалы и ссылки', isSystem: true, sortOrder: 3 },
  { name: 'Источники', type: 'custom', icon: '🎯', color: '#8b5cf6', description: 'Книги, курсы, статьи для изучения', isSystem: true, sortOrder: 4 },
  { name: 'Шаблоны', type: 'templates', icon: '📋', color: '#ec4899', description: 'Повторяемые процессы и шаблоны', isSystem: true, sortOrder: 5 },
]

// ============================================
// FOLDERS
// ============================================
export function getStorageFolders(): StorageFolder[] {
  const folders = getStore<StorageFolder[]>(KEYS.storageFolders, [])
  if (folders.length === 0) {
    // Create default folders
    const newFolders = defaultFolders.map((folder, index) => ({
      ...folder,
      id: genId(),
      userId: 'local',
      createdAt: now(),
      updatedAt: now(),
    }))
    setStore(KEYS.storageFolders, newFolders)
    return newFolders
  }
  return folders
}

export function createStorageFolder(input: CreateFolderInput): StorageFolder {
  const folders = getStorageFolders()
  const newFolder: StorageFolder = {
    id: genId(),
    userId: 'local',
    ...input,
    icon: input.icon || '📁',
    color: input.color || '#6366f1',
    sortOrder: folders.length,
    isSystem: false,
    createdAt: now(),
    updatedAt: now(),
  }
  setStore(KEYS.storageFolders, [...folders, newFolder])
  return newFolder
}

export function updateStorageFolder(id: string, updates: Partial<StorageFolder>): void {
  const folders = getStorageFolders()
  const index = folders.findIndex(f => f.id === id)
  if (index === -1) return
  
  folders[index] = { ...folders[index], ...updates, updatedAt: now() }
  setStore(KEYS.storageFolders, folders)
}

export function deleteStorageFolder(id: string): boolean {
  const folders = getStorageFolders()
  const folder = folders.find(f => f.id === id)
  if (folder?.isSystem) return false // Can't delete system folders
  
  const filtered = folders.filter(f => f.id !== id)
  setStore(KEYS.storageFolders, filtered)
  return true
}

// ============================================
// LEARNING SOURCES
// ============================================
export function getLearningSources(): LearningSource[] {
  return getStore<LearningSource[]>(KEYS.learningSources, [])
}

export function createLearningSource(input: CreateLearningSourceInput): LearningSource {
  const sources = getLearningSources()
  const newSource: LearningSource = {
    id: genId(),
    userId: 'local',
    ...input,
    status: 'planned',
    progressPercent: 0,
    tags: [],
    createdAt: now(),
    updatedAt: now(),
  }
  setStore(KEYS.learningSources, [...sources, newSource])
  return newSource
}

export function updateLearningSource(id: string, updates: Partial<LearningSource>): void {
  const sources = getLearningSources()
  const index = sources.findIndex(s => s.id === id)
  if (index === -1) return
  
  sources[index] = { ...sources[index], ...updates, updatedAt: now() }
  setStore(KEYS.learningSources, sources)
}

export function deleteLearningSource(id: string): void {
  const sources = getLearningSources()
  setStore(KEYS.learningSources, sources.filter(s => s.id !== id))
}

// ============================================
// INSIGHTS
// ============================================
export function getInsights(): Insight[] {
  return getStore<Insight[]>(KEYS.insights, [])
}

export function createInsight(input: CreateInsightInput): Insight {
  const insights = getInsights()
  const newInsight: Insight = {
    id: genId(),
    userId: 'local',
    ...input,
    priority: input.priority || 'medium',
    status: 'pending',
    tags: input.tags || [],
    createdAt: now(),
    updatedAt: now(),
  }
  setStore(KEYS.insights, [...insights, newInsight])
  return newInsight
}

export function updateInsight(id: string, updates: Partial<Insight>): void {
  const insights = getInsights()
  const index = insights.findIndex(i => i.id === id)
  if (index === -1) return
  
  insights[index] = { ...insights[index], ...updates, updatedAt: now() }
  setStore(KEYS.insights, insights)
}

export function deleteInsight(id: string): void {
  const insights = getInsights()
  setStore(KEYS.insights, insights.filter(i => i.id !== id))
}

// ============================================
// CONTACTS
// ============================================
export function getStorageContacts(): StorageContact[] {
  return getStore<StorageContact[]>(KEYS.storageContacts, [])
}

export function createStorageContact(input: CreateContactInput): StorageContact {
  const contacts = getStorageContacts()
  const newContact: StorageContact = {
    id: genId(),
    userId: 'local',
    ...input,
    socialLinks: {},
    createdAt: now(),
    updatedAt: now(),
  }
  setStore(KEYS.storageContacts, [...contacts, newContact])
  return newContact
}

export function updateStorageContact(id: string, updates: Partial<StorageContact>): void {
  const contacts = getStorageContacts()
  const index = contacts.findIndex(c => c.id === id)
  if (index === -1) return
  
  contacts[index] = { ...contacts[index], ...updates, updatedAt: now() }
  setStore(KEYS.storageContacts, contacts)
}

export function deleteStorageContact(id: string): void {
  const contacts = getStorageContacts()
  setStore(KEYS.storageContacts, contacts.filter(c => c.id !== id))
}

// ============================================
// RESOURCES
// ============================================
export function getStorageResources(): StorageResource[] {
  return getStore<StorageResource[]>(KEYS.storageResources, [])
}

export function createStorageResource(input: CreateResourceInput): StorageResource {
  const resources = getStorageResources()
  const newResource: StorageResource = {
    id: genId(),
    userId: 'local',
    ...input,
    tags: [],
    createdAt: now(),
    updatedAt: now(),
  }
  setStore(KEYS.storageResources, [...resources, newResource])
  return newResource
}

export function updateStorageResource(id: string, updates: Partial<StorageResource>): void {
  const resources = getStorageResources()
  const index = resources.findIndex(r => r.id === id)
  if (index === -1) return
  
  resources[index] = { ...resources[index], ...updates, updatedAt: now() }
  setStore(KEYS.storageResources, resources)
}

export function deleteStorageResource(id: string): void {
  const resources = getStorageResources()
  setStore(KEYS.storageResources, resources.filter(r => r.id !== id))
}

// ============================================
// STATS
// ============================================
export function getStorageStats() {
  const folders = getStorageFolders()
  const insights = getInsights()
  const contacts = getStorageContacts()
  const resources = getStorageResources()
  const sources = getLearningSources()
  
  const insightsByStatus = insights.reduce((acc, i) => {
    acc[i.status] = (acc[i.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const insightsByPriority = insights.reduce((acc, i) => {
    acc[i.priority] = (acc[i.priority] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const sourcesByStatus = sources.reduce((acc, s) => {
    acc[s.status] = (acc[s.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  return {
    totalFolders: folders.length,
    totalInsights: insights.length,
    totalContacts: contacts.length,
    totalResources: resources.length,
    totalSources: sources.length,
    insightsByStatus,
    insightsByPriority,
    sourcesByStatus,
    recentInsights: insights.slice(-5).reverse(),
    activeSources: sources.filter(s => s.status === 'in_progress'),
  }
}
