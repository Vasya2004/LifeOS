// ============================================
// STORAGE MODULE TYPES - Хранилище Данных
// ============================================

export type StorageFolderType = 'insights' | 'contacts' | 'resources' | 'templates' | 'custom'
export type LearningSourceType = 'book' | 'course' | 'article' | 'video' | 'mentor' | 'podcast' | 'event'
export type LearningSourceStatus = 'planned' | 'in_progress' | 'completed' | 'abandoned'
export type ContactCategory = 'mentor' | 'colleague' | 'friend' | 'client' | 'partner' | 'other'
export type InsightPriority = 'low' | 'medium' | 'high'
export type InsightStatus = 'pending' | 'in_action' | 'completed' | 'archived'
export type ResourceType = 'file' | 'link' | 'document' | 'image' | 'video'

// ============================================
// FOLDERS
// ============================================
export interface StorageFolder {
  id: string
  userId: string
  parentFolderId?: string | null
  name: string
  type: StorageFolderType
  icon: string
  color: string
  description?: string
  sortOrder: number
  isSystem: boolean
  createdAt: string
  updatedAt: string
}

// ============================================
// LEARNING SOURCES
// ============================================
export interface LearningSource {
  id: string
  userId: string
  folderId?: string | null
  type: LearningSourceType
  title: string
  author?: string
  url?: string
  status: LearningSourceStatus
  progressPercent: number
  startedAt?: string
  completedAt?: string
  rating?: number
  tags: string[]
  createdAt: string
  updatedAt: string
}

// ============================================
// CONTACTS
// ============================================
export interface StorageContact {
  id: string
  userId: string
  folderId?: string | null
  name: string
  company?: string
  position?: string
  email?: string
  phone?: string
  socialLinks: {
    telegram?: string
    linkedin?: string
    twitter?: string
    website?: string
  }
  category: ContactCategory
  lastContactDate?: string
  nextFollowupDate?: string
  notes?: string
  relationshipStrength?: number
  createdAt: string
  updatedAt: string
}

// ============================================
// INSIGHTS
// ============================================
export interface Insight {
  id: string
  userId: string
  folderId?: string | null
  sourceId?: string | null
  title: string
  content?: string
  applicationPlan: string
  relatedSkillId?: string
  priority: InsightPriority
  status: InsightStatus
  tags: string[]
  createdAt: string
  updatedAt: string
  lastActionDate?: string
}

// ============================================
// RESOURCES
// ============================================
export interface StorageResource {
  id: string
  userId: string
  folderId?: string | null
  title: string
  type: ResourceType
  url?: string
  filePath?: string
  fileSize?: number
  mimeType?: string
  description?: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

// ============================================
// STATS & ANALYTICS
// ============================================
export interface StorageStats {
  totalFolders: number
  totalInsights: number
  totalContacts: number
  totalResources: number
  totalSources: number
  insightsByStatus: Record<InsightStatus, number>
  insightsByPriority: Record<InsightPriority, number>
  sourcesByStatus: Record<LearningSourceStatus, number>
  recentInsights: Insight[]
  activeSources: LearningSource[]
}

// ============================================
// FORM INPUTS
// ============================================
export interface CreateFolderInput {
  name: string
  type: StorageFolderType
  icon?: string
  color?: string
  description?: string
  parentFolderId?: string
}

export interface CreateLearningSourceInput {
  type: LearningSourceType
  title: string
  author?: string
  url?: string
  folderId?: string
}

export interface CreateInsightInput {
  title: string
  content?: string
  applicationPlan: string
  folderId?: string
  sourceId?: string
  priority?: InsightPriority
  relatedSkillId?: string
  tags?: string[]
}

export interface CreateContactInput {
  name: string
  company?: string
  position?: string
  email?: string
  phone?: string
  category: ContactCategory
  folderId?: string
}

export interface CreateResourceInput {
  title: string
  type: ResourceType
  url?: string
  folderId?: string
  description?: string
}
