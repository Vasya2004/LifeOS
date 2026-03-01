// ============================================
// HEALTH FEATURE MODULE
// ============================================

import type { BodyZone, MedicalDocument, HealthMetricEntry, HealthProfile, Medication } from "@/lib/types"
import { BODY_ZONES_DEFAULT } from "@/lib/types"
import { getStore, setStore, KEYS, mutateKey, genId, now } from "@/lib/store/core"

// ============================================
// BODY ZONES
// ============================================

export function getBodyZones(): BodyZone[] {
  const zones = getStore<BodyZone[]>(KEYS.bodyZones, [])
  if (zones.length === 0) {
    // Initialize default zones
    const defaultZones = BODY_ZONES_DEFAULT.map(z => ({ ...z, id: genId() }))
    setStore(KEYS.bodyZones, defaultZones)
    return defaultZones
  }
  return zones
}

export function getBodyZoneById(id: string): BodyZone | undefined {
  return getBodyZones().find(z => z.id === id)
}

export function updateBodyZone(id: string, updates: Partial<BodyZone>) {
  const zones = getBodyZones()
  const updated = zones.map(z => z.id === id ? { ...z, ...updates } : z)
  setStore(KEYS.bodyZones, updated)
  mutateKey(KEYS.bodyZones, updated)
}

export function getBodyZonesStats() {
  const zones = getBodyZones()
  const green = zones.filter(z => z.status === "green").length
  const yellow = zones.filter(z => z.status === "yellow").length
  const red = zones.filter(z => z.status === "red").length
  const total = zones.length
  
  // Calculate health score (0-100)
  // Green = 100%, Yellow = 50%, Red = 0%
  const healthScore = total > 0 
    ? Math.round((green * 100 + yellow * 50) / total)
    : 100
  
  return {
    total,
    green,
    yellow,
    red,
    healthScore,
  }
}

// ============================================
// MEDICAL DOCUMENTS
// ============================================

export function getMedicalDocuments(): MedicalDocument[] {
  return getStore(KEYS.medicalDocuments, [])
}

export function getMedicalDocumentById(id: string): MedicalDocument | undefined {
  return getMedicalDocuments().find(d => d.id === id)
}

export function addMedicalDocument(doc: Omit<MedicalDocument, "id" | "createdAt">): MedicalDocument {
  const docs = getMedicalDocuments()
  const newDoc: MedicalDocument = { ...doc, id: genId(), createdAt: now() }
  const updated = [...docs, newDoc]
  setStore(KEYS.medicalDocuments, updated)
  mutateKey(KEYS.medicalDocuments, updated)
  return newDoc
}

export function updateMedicalDocument(id: string, updates: Partial<MedicalDocument>) {
  const docs = getMedicalDocuments()
  const updated = docs.map(d => d.id === id ? { ...d, ...updates } : d)
  setStore(KEYS.medicalDocuments, updated)
  mutateKey(KEYS.medicalDocuments, updated)
}

export function deleteMedicalDocument(id: string) {
  const docs = getMedicalDocuments()
  const updated = docs.filter(d => d.id !== id)
  setStore(KEYS.medicalDocuments, updated)
  mutateKey(KEYS.medicalDocuments, updated)
}

// ============================================
// HEALTH METRICS
// ============================================

export function getHealthMetrics(): HealthMetricEntry[] {
  return getStore(KEYS.healthMetrics, [])
}

export function getHealthMetricById(id: string): HealthMetricEntry | undefined {
  return getHealthMetrics().find(m => m.id === id)
}

export function addHealthMetric(metric: Omit<HealthMetricEntry, "id">): HealthMetricEntry {
  const metrics = getHealthMetrics()
  const newMetric: HealthMetricEntry = { ...metric, id: genId() }
  const updated = [...metrics, newMetric]
  setStore(KEYS.healthMetrics, updated)
  mutateKey(KEYS.healthMetrics, updated)
  return newMetric
}

export function updateHealthMetric(id: string, updates: Partial<HealthMetricEntry>) {
  const metrics = getHealthMetrics()
  const updated = metrics.map(m => m.id === id ? { ...m, ...updates } : m)
  setStore(KEYS.healthMetrics, updated)
  mutateKey(KEYS.healthMetrics, updated)
}

export function deleteHealthMetric(id: string) {
  const metrics = getHealthMetrics()
  const updated = metrics.filter(m => m.id !== id)
  setStore(KEYS.healthMetrics, updated)
  mutateKey(KEYS.healthMetrics, updated)
}

export function getHealthMetricsByType(type: HealthMetricEntry["type"]): HealthMetricEntry[] {
  return getHealthMetrics().filter(m => m.type === type)
}

export function getLatestHealthMetric(type: HealthMetricEntry["type"]): HealthMetricEntry | undefined {
  return getHealthMetricsByType(type).sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )[0]
}

export function getHealthMetricsByDate(date: string): HealthMetricEntry[] {
  return getHealthMetrics().filter(m => m.date === date)
}

// ============================================
// HEALTH PROFILE
// ============================================

export function getHealthProfile(): HealthProfile {
  return getStore(KEYS.healthProfile, {
    allergies: [],
    chronicConditions: [],
    medications: [],
  })
}

export function updateHealthProfile(updates: Partial<HealthProfile>) {
  const profile = getHealthProfile()
  const updated = { ...profile, ...updates }
  setStore(KEYS.healthProfile, updated)
  mutateKey(KEYS.healthProfile, updated)
}

export function addMedication(medication: Omit<Medication, "id">): Medication {
  const profile = getHealthProfile()
  const newMed: Medication = { ...medication, id: genId() }
  const updated = { 
    ...profile, 
    medications: [...profile.medications, newMed] 
  }
  setStore(KEYS.healthProfile, updated)
  mutateKey(KEYS.healthProfile, updated)
  return newMed
}

export function removeMedication(id: string) {
  const profile = getHealthProfile()
  const updated = {
    ...profile,
    medications: profile.medications.filter(m => m.id !== id)
  }
  setStore(KEYS.healthProfile, updated)
  mutateKey(KEYS.healthProfile, updated)
}
