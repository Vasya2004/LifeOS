// ============================================
// HEALTH MODULE - Lazy Loading Wrapper
// ============================================
//
// This module provides async access to health store functions.
// The actual module is loaded on first use via dynamic import.
//
// Usage:
//   import { getBodyZones, addHealthMetric } from "@/lib/store/lazy/health"
//   const zones = await getBodyZones()
//
// ============================================

import type {
  BodyZone,
  MedicalDocument,
  HealthMetricEntry,
  HealthProfile,
  HealthMetricType,
} from "@/lib/types"
import { StoreRegistry } from "./registry"

// ============================================
// Body Zones
// ============================================

export async function getBodyZones(): Promise<BodyZone[]> {
  const mod = await StoreRegistry.health()
  return mod.getBodyZones()
}

export async function getBodyZoneById(id: string): Promise<BodyZone | undefined> {
  const mod = await StoreRegistry.health()
  return mod.getBodyZoneById(id)
}

export async function updateBodyZone(id: string, updates: Partial<BodyZone>): Promise<void> {
  const mod = await StoreRegistry.health()
  return mod.updateBodyZone(id, updates)
}

export async function getBodyZonesStats(): Promise<{
  total: number
  green: number
  yellow: number
  red: number
  healthScore: number
}> {
  const mod = await StoreRegistry.health()
  return mod.getBodyZonesStats()
}

// ============================================
// Medical Documents
// ============================================

export async function getMedicalDocuments(): Promise<MedicalDocument[]> {
  const mod = await StoreRegistry.health()
  return mod.getMedicalDocuments()
}

export async function getMedicalDocumentById(id: string): Promise<MedicalDocument | undefined> {
  const mod = await StoreRegistry.health()
  return mod.getMedicalDocumentById(id)
}

export async function addMedicalDocument(
  doc: Omit<MedicalDocument, "id" | "createdAt">
): Promise<MedicalDocument> {
  const mod = await StoreRegistry.health()
  return mod.addMedicalDocument(doc)
}

export async function updateMedicalDocument(
  id: string,
  updates: Partial<MedicalDocument>
): Promise<void> {
  const mod = await StoreRegistry.health()
  return mod.updateMedicalDocument(id, updates)
}

export async function deleteMedicalDocument(id: string): Promise<void> {
  const mod = await StoreRegistry.health()
  return mod.deleteMedicalDocument(id)
}

// ============================================
// Health Metrics
// ============================================

export async function getHealthMetrics(): Promise<HealthMetricEntry[]> {
  const mod = await StoreRegistry.health()
  return mod.getHealthMetrics()
}

export async function getHealthMetricById(id: string): Promise<HealthMetricEntry | undefined> {
  const mod = await StoreRegistry.health()
  return mod.getHealthMetricById(id)
}

export async function addHealthMetric(
  metric: Omit<HealthMetricEntry, "id">
): Promise<HealthMetricEntry> {
  const mod = await StoreRegistry.health()
  return mod.addHealthMetric(metric)
}

export async function updateHealthMetric(
  id: string,
  updates: Partial<HealthMetricEntry>
): Promise<void> {
  const mod = await StoreRegistry.health()
  return mod.updateHealthMetric(id, updates)
}

export async function deleteHealthMetric(id: string): Promise<void> {
  const mod = await StoreRegistry.health()
  return mod.deleteHealthMetric(id)
}

export async function getHealthMetricsByType(type: HealthMetricType): Promise<HealthMetricEntry[]> {
  const mod = await StoreRegistry.health()
  return mod.getHealthMetricsByType(type)
}

export async function getHealthMetricsByDate(date: string): Promise<HealthMetricEntry[]> {
  const mod = await StoreRegistry.health()
  return mod.getHealthMetricsByDate(date)
}

export async function getLatestHealthMetric(
  type: HealthMetricType
): Promise<HealthMetricEntry | undefined> {
  const mod = await StoreRegistry.health()
  return mod.getLatestHealthMetric(type)
}

// ============================================
// Health Profile
// ============================================

export async function getHealthProfile(): Promise<HealthProfile> {
  const mod = await StoreRegistry.health()
  return mod.getHealthProfile()
}

export async function updateHealthProfile(updates: Partial<HealthProfile>): Promise<void> {
  const mod = await StoreRegistry.health()
  return mod.updateHealthProfile(updates)
}

export async function addMedication(
  medication: HealthProfile["medications"][0]
): Promise<void> {
  const mod = await StoreRegistry.health()
  return mod.addMedication(medication)
}

export async function removeMedication(medicationId: string): Promise<void> {
  const mod = await StoreRegistry.health()
  return mod.removeMedication(medicationId)
}

// ============================================
// Loading State
// ============================================

export function getLoadingState() {
  return StoreRegistry.getHealthState()
}
