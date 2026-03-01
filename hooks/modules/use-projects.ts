// ============================================
// PROJECTS HOOKS
// ============================================

"use client"

import { useOfflineFirst } from "@/hooks/core/use-offline-first"
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  completeProject,
  getProjectsByStatus,
  getActiveProjects,
} from "@/lib/store"
import * as db from "@/lib/api/database"
import { addToQueue } from "@/lib/sync/offline-first"
import { setStore } from "@/lib/store/utils/storage"
import { useAuth } from "@/lib/auth/context"
import type { Project } from "@/lib/types"

const PROJECTS_KEY = "projects"

export function useProjects() {
  const { isAuthenticated, isGuest } = useAuth()

  return useOfflineFirst<Project[]>(PROJECTS_KEY, {
    storageKey: PROJECTS_KEY,
    getLocal: getProjects,
    getServer: isAuthenticated && !isGuest ? db.getProjects : undefined,
    setLocal: (data) => setStore(PROJECTS_KEY, data),
  })
}

export function useProjectsByStatus(status: Project["status"]) {
  const { data: projects } = useProjects()
  return projects?.filter(p => p.status === status) ?? []
}

export function useProject(id: string) {
  const { data: projects } = useProjects()
  return projects?.find(p => p.id === id)
}

export function useCreateProject() {
  const { isAuthenticated, isGuest } = useAuth()

  return async (project: Omit<Project, "id" | "createdAt" | "updatedAt">) => {
    const newProject = createProject(project)

    if (isAuthenticated && !isGuest) {
      addToQueue({
        table: "projects",
        operation: "insert",
        recordId: newProject.id,
        data: newProject as unknown as Record<string, unknown>,
      })
    }

    return newProject
  }
}

export function useUpdateProject() {
  const { isAuthenticated, isGuest } = useAuth()

  return async (id: string, updates: Partial<Project>) => {
    updateProject(id, updates)

    if (isAuthenticated && !isGuest) {
      const updated = { ...getProjectById(id), ...updates, id }
      addToQueue({
        table: "projects",
        operation: "update",
        recordId: id,
        data: updated as unknown as Record<string, unknown>,
      })
    }
  }
}

export function useDeleteProject() {
  const { isAuthenticated, isGuest } = useAuth()

  return async (id: string) => {
    deleteProject(id)

    if (isAuthenticated && !isGuest) {
      addToQueue({ table: "projects", operation: "delete", recordId: id })
    }
  }
}

export function useCompleteProject() {
  const { isAuthenticated, isGuest } = useAuth()

  return async (id: string) => {
    completeProject(id)

    if (isAuthenticated && !isGuest) {
      const updated = getProjectById(id)
      if (updated) {
        addToQueue({
          table: "projects",
          operation: "update",
          recordId: id,
          data: updated as unknown as Record<string, unknown>,
        })
      }
    }
  }
}
