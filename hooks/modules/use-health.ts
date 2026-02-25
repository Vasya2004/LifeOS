// ============================================
// HEALTH HOOKS
// ============================================

"use client"

import useSWR from "swr"
import * as localStore from "@/lib/store"
import type { BodyZone, MedicalDocument, HealthMetricEntry, HealthProfile, HealthMetricType } from "@/lib/types"

const BODY_ZONES_KEY = "bodyZones"
const MEDICAL_DOCUMENTS_KEY = "medicalDocuments"
const HEALTH_METRICS_KEY = "healthMetrics"
const HEALTH_PROFILE_KEY = "healthProfile"

// Body Zones
export function useBodyZones() {
  return useSWR(BODY_ZONES_KEY, localStore.getBodyZones, { revalidateOnFocus: false })
}

export function useUpdateBodyZone() {
  return async (id: string, updates: Partial<BodyZone>) => {
    localStore.updateBodyZone(id, updates)
  }
}

export function useBodyZonesStats() {
  return useSWR("bodyZonesStats", localStore.getBodyZonesStats, { revalidateOnFocus: false })
}

// Medical Documents
export function useMedicalDocuments() {
  return useSWR(MEDICAL_DOCUMENTS_KEY, localStore.getMedicalDocuments, { revalidateOnFocus: false })
}

export function useCreateMedicalDocument() {
  return async (doc: Omit<MedicalDocument, "id" | "createdAt">) => {
    return localStore.addMedicalDocument(doc)
  }
}

export function useUpdateMedicalDocument() {
  return async (id: string, updates: Partial<MedicalDocument>) => {
    localStore.updateMedicalDocument(id, updates)
  }
}

export function useDeleteMedicalDocument() {
  return async (id: string) => {
    localStore.deleteMedicalDocument(id)
  }
}

// Health Metrics
export function useHealthMetrics() {
  return useSWR(HEALTH_METRICS_KEY, localStore.getHealthMetrics, { revalidateOnFocus: false })
}

export function useCreateHealthMetric() {
  return async (metric: Omit<HealthMetricEntry, "id">) => {
    return localStore.addHealthMetric(metric)
  }
}

export function useDeleteHealthMetric() {
  return async (id: string) => {
    localStore.deleteHealthMetric(id)
  }
}

export function useHealthMetricsByType(type: HealthMetricType) {
  return useSWR(
    `${HEALTH_METRICS_KEY}/${type}`,
    () => localStore.getHealthMetricsByType(type),
    { revalidateOnFocus: false }
  )
}

// Health Profile
export function useHealthProfile() {
  return useSWR(HEALTH_PROFILE_KEY, localStore.getHealthProfile, { revalidateOnFocus: false })
}

export function useUpdateHealthProfile() {
  return async (updates: Partial<HealthProfile>) => {
    localStore.updateHealthProfile(updates)
  }
}
