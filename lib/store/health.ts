// ============================================
// HEALTH MODULE - Character Stats System
// ============================================

import type { 
  BodyZone, 
  MedicalDocument, 
  HealthMetricEntry, 
  HealthProfile,
  HealthMetricType 
} from "@/lib/types"
import { BODY_ZONES_DEFAULT } from "@/lib/types"
import { getStore, setStore, KEYS, mutateKey, genId, now } from "./core"
import { addXp, addCoins } from "./gamification"

// Body Zones
export function getBodyZones(): BodyZone[] {
  const stored = getStore<BodyZone[]>(KEYS.bodyZones, [])
  if (stored.length === 0) {
    // Initialize default body zones
    const defaultZones: BodyZone[] = BODY_ZONES_DEFAULT.map(zone => ({
      ...zone,
      id: genId(),
    }))
    setStore(KEYS.bodyZones, defaultZones)
    return defaultZones
  }
  return stored
}

export function getBodyZoneById(id: string): BodyZone | undefined {
  return getBodyZones().find(z => z.id === id)
}

export function updateBodyZone(id: string, updates: Partial<BodyZone>) {
  const zones = getBodyZones()
  const zone = zones.find(z => z.id === id)
  if (!zone) return

  // Check if status changed for gamification
  const statusChanged = updates.status && updates.status !== zone.status
  
  setStore(KEYS.bodyZones, zones.map(z => 
    z.id === id ? { ...z, ...updates } : z
  ))
  mutateKey(KEYS.bodyZones)
  
  // Gamification: XP for updating body zone status
  if (statusChanged) {
    addXp(15, "body_zone_updated")
    
    // Bonus XP for fixing red zone to green (recovery = leveling up)
    if (zone.status === "red" && updates.status === "green") {
      addXp(50, "body_zone_recovered")
      addCoins(10)
    }
  }
}

export function getBodyZonesStats() {
  const zones = getBodyZones()
  const total = zones.length
  const green = zones.filter(z => z.status === "green").length
  const yellow = zones.filter(z => z.status === "yellow").length
  const red = zones.filter(z => z.status === "red").length
  
  return {
    total,
    green,
    yellow,
    red,
    healthScore: total > 0 ? Math.round((green / total) * 100) : 100,
  }
}

function checkFullCheckupAchievement() {
  const zones = getBodyZones()
  const allGreen = zones.every(z => z.status === "green")
  
  if (allGreen && zones.length > 0) {
    // This would trigger an achievement - for now just bonus rewards
    addXp(100, "full_checkup_achievement")
    addCoins(50)
  }
}

// Medical Documents
export function getMedicalDocuments(): MedicalDocument[] {
  return getStore(KEYS.medicalDocuments, [])
}

export function getMedicalDocumentById(id: string): MedicalDocument | undefined {
  return getMedicalDocuments().find(d => d.id === id)
}

export function addMedicalDocument(doc: Omit<MedicalDocument, "id" | "createdAt">) {
  const docs = getMedicalDocuments()
  const newDoc: MedicalDocument = {
    ...doc,
    id: genId(),
    createdAt: now(),
  }
  setStore(KEYS.medicalDocuments, [...docs, newDoc])
  mutateKey(KEYS.medicalDocuments)
  
  // Gamification: Coins for uploading medical document
  addCoins(5)
  addXp(25, "medical_document_uploaded")
  
  // Check for "Full Checkup" achievement
  checkFullCheckupAchievement()
  
  return newDoc
}

export function updateMedicalDocument(id: string, updates: Partial<MedicalDocument>) {
  const docs = getMedicalDocuments()
  setStore(KEYS.medicalDocuments, docs.map(d => d.id === id ? { ...d, ...updates } : d))
  mutateKey(KEYS.medicalDocuments)
}

export function deleteMedicalDocument(id: string) {
  const docs = getMedicalDocuments()
  setStore(KEYS.medicalDocuments, docs.filter(d => d.id !== id))
  mutateKey(KEYS.medicalDocuments)
}

// Health Metrics
export function getHealthMetrics(): HealthMetricEntry[] {
  return getStore(KEYS.healthMetrics, [])
}

export function getHealthMetricById(id: string): HealthMetricEntry | undefined {
  return getHealthMetrics().find(m => m.id === id)
}

export function addHealthMetric(metric: Omit<HealthMetricEntry, "id">) {
  const metrics = getHealthMetrics()
  const newMetric: HealthMetricEntry = {
    ...metric,
    id: genId(),
  }
  setStore(KEYS.healthMetrics, [...metrics, newMetric])
  mutateKey(KEYS.healthMetrics)
  
  // Small XP reward for tracking health
  addXp(5, "health_metric_logged")
  
  return newMetric
}

export function updateHealthMetric(id: string, updates: Partial<HealthMetricEntry>) {
  const metrics = getHealthMetrics()
  setStore(KEYS.healthMetrics, metrics.map(m => m.id === id ? { ...m, ...updates } : m))
  mutateKey(KEYS.healthMetrics)
}

export function deleteHealthMetric(id: string) {
  const metrics = getHealthMetrics()
  setStore(KEYS.healthMetrics, metrics.filter(m => m.id !== id))
  mutateKey(KEYS.healthMetrics)
}

export function getHealthMetricsByType(type: HealthMetricType): HealthMetricEntry[] {
  return getHealthMetrics()
    .filter(m => m.type === type)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

export function getHealthMetricsByDate(date: string): HealthMetricEntry[] {
  return getHealthMetrics().filter(m => m.date === date)
}

export function getLatestHealthMetric(type: HealthMetricType): HealthMetricEntry | undefined {
  const metrics = getHealthMetricsByType(type)
  return metrics[metrics.length - 1]
}

// Health Profile
export function getHealthProfile(): HealthProfile {
  return getStore<HealthProfile>(KEYS.healthProfile, {
    allergies: [],
    chronicConditions: [],
    medications: [],
  })
}

export function updateHealthProfile(updates: Partial<HealthProfile>) {
  const current = getHealthProfile()
  setStore(KEYS.healthProfile, { ...current, ...updates })
  mutateKey(KEYS.healthProfile)
}

// Medications helper
export function addMedication(medication: HealthProfile["medications"][0]) {
  const profile = getHealthProfile()
  updateHealthProfile({
    medications: [...profile.medications, medication]
  })
}

export function removeMedication(medicationId: string) {
  const profile = getHealthProfile()
  updateHealthProfile({
    medications: profile.medications.filter(m => m.id !== medicationId)
  })
}
