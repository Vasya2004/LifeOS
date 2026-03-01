// ============================================
// HEALTH HOOKS
// ============================================

"use client"

import useSWR, { mutate } from "swr"
import { useMemo } from "react"
import * as localStore from "@/lib/store"
import * as db from "@/lib/api/database"
import { addToQueue } from "@/lib/sync/offline-first"
import { setStore } from "@/lib/store/utils/storage"
import { useOfflineFirst } from "@/hooks/core/use-offline-first"
import { useAuth } from "@/lib/auth/context"
import type { BodyZone, MedicalDocument, HealthMetricEntry, HealthProfile, HealthMetricType } from "@/lib/types"

const BODY_ZONES_KEY = "bodyZones"
const MEDICAL_DOCUMENTS_KEY = "medicalDocuments"
const HEALTH_METRICS_KEY = "healthMetrics"
const HEALTH_PROFILE_KEY = "healthProfile"

// ============================================
// BODY ZONES
// ============================================

export function useBodyZones() {
  const { isAuthenticated, isGuest } = useAuth()

  return useOfflineFirst<BodyZone[]>(BODY_ZONES_KEY, {
    storageKey: BODY_ZONES_KEY,
    getLocal: localStore.getBodyZones,
    getServer: isAuthenticated && !isGuest ? db.getBodyZones : undefined,
    setLocal: (data) => setStore(BODY_ZONES_KEY, data),
  })
}

export function useUpdateBodyZone() {
  const { isAuthenticated, isGuest } = useAuth()

  return async (id: string, updates: Partial<BodyZone>) => {
    localStore.updateBodyZone(id, updates)

    if (isAuthenticated && !isGuest) {
      addToQueue({ table: "body_zones", operation: "update", recordId: id, data: { id, ...updates } as unknown as Record<string, unknown> })
    }
  }
}

export function useBodyZonesStats() {
  return useSWR("bodyZonesStats", localStore.getBodyZonesStats, { revalidateOnFocus: false })
}

// ============================================
// MEDICAL DOCUMENTS
// ============================================

export function useMedicalDocuments() {
  const { isAuthenticated, isGuest } = useAuth()

  return useOfflineFirst<MedicalDocument[]>(MEDICAL_DOCUMENTS_KEY, {
    storageKey: MEDICAL_DOCUMENTS_KEY,
    getLocal: localStore.getMedicalDocuments,
    getServer: isAuthenticated && !isGuest ? db.getMedicalDocuments : undefined,
    setLocal: (data) => setStore(MEDICAL_DOCUMENTS_KEY, data),
  })
}

export function useCreateMedicalDocument() {
  const { isAuthenticated, isGuest } = useAuth()

  return async (doc: Omit<MedicalDocument, "id" | "createdAt">) => {
    const newDoc = localStore.addMedicalDocument(doc)

    if (isAuthenticated && !isGuest) {
      addToQueue({ table: "medical_documents", operation: "insert", recordId: newDoc.id, data: newDoc as unknown as Record<string, unknown> })
    }

    return newDoc
  }
}

export function useUpdateMedicalDocument() {
  const { isAuthenticated, isGuest } = useAuth()

  return async (id: string, updates: Partial<MedicalDocument>) => {
    localStore.updateMedicalDocument(id, updates)

    if (isAuthenticated && !isGuest) {
      const updated = { ...localStore.getMedicalDocuments().find(d => d.id === id), ...updates, id }
      addToQueue({ table: "medical_documents", operation: "update", recordId: id, data: updated as unknown as Record<string, unknown> })
    }
  }
}

export function useDeleteMedicalDocument() {
  const { isAuthenticated, isGuest } = useAuth()

  return async (id: string) => {
    localStore.deleteMedicalDocument(id)

    if (isAuthenticated && !isGuest) {
      addToQueue({ table: "medical_documents", operation: "delete", recordId: id })
    }
  }
}

// ============================================
// HEALTH METRICS
// ============================================

export function useHealthMetrics() {
  const { isAuthenticated, isGuest } = useAuth()

  return useOfflineFirst<HealthMetricEntry[]>(HEALTH_METRICS_KEY, {
    storageKey: HEALTH_METRICS_KEY,
    getLocal: localStore.getHealthMetrics,
    getServer: isAuthenticated && !isGuest ? db.getHealthMetrics : undefined,
    setLocal: (data) => setStore(HEALTH_METRICS_KEY, data),
  })
}

export function useCreateHealthMetric() {
  const { isAuthenticated, isGuest } = useAuth()

  return async (metric: Omit<HealthMetricEntry, "id">) => {
    const newMetric = localStore.addHealthMetric(metric)

    if (isAuthenticated && !isGuest) {
      addToQueue({ table: "health_metrics", operation: "insert", recordId: newMetric.id, data: newMetric as unknown as Record<string, unknown> })
    }

    return newMetric
  }
}

export function useDeleteHealthMetric() {
  const { isAuthenticated, isGuest } = useAuth()

  return async (id: string) => {
    localStore.deleteHealthMetric(id)

    if (isAuthenticated && !isGuest) {
      addToQueue({ table: "health_metrics", operation: "delete", recordId: id })
    }
  }
}

export function useHealthMetricsByType(type: HealthMetricType) {
  const { data: metrics } = useHealthMetrics()

  return useMemo(
    () => ({ data: (metrics || []).filter(m => m.type === type) }),
    [metrics, type]
  )
}

// ============================================
// HEALTH PROFILE
// ============================================

export function useHealthProfile() {
  const { isAuthenticated, isGuest } = useAuth()

  return useOfflineFirst<HealthProfile>(HEALTH_PROFILE_KEY, {
    storageKey: HEALTH_PROFILE_KEY,
    getLocal: localStore.getHealthProfile,
    getServer: isAuthenticated && !isGuest
      ? async () => {
          const profile = await db.getHealthProfile()
          return profile || localStore.getHealthProfile()
        }
      : undefined,
    setLocal: (data) => setStore(HEALTH_PROFILE_KEY, data),
  })
}

export function useUpdateHealthProfile() {
  const { isAuthenticated, isGuest } = useAuth()

  return async (updates: Partial<HealthProfile>) => {
    localStore.updateHealthProfile(updates)

    if (isAuthenticated && !isGuest) {
      // Health profile is a single record per user — upsert via queue
      const updated = localStore.getHealthProfile()
      addToQueue({ table: "health_profiles", operation: "update", recordId: "profile", data: updated as unknown as Record<string, unknown> })
      // Also trigger immediate upsert for critical health data
      db.upsertHealthProfile(updates).catch(() => {})
    }
  }
}

// ============================================
// COMBINED HOOK
// ============================================

export function useHealthData() {
  const { data: bodyZones } = useBodyZones()
  const { data: metrics } = useHealthMetrics()

  const data = useMemo(() => ({
    bodyZones: bodyZones || [],
    metrics: metrics || [],
  }), [bodyZones, metrics])

  return { data }
}
