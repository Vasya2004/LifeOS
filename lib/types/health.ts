// ============================================
// HEALTH TYPES - Character Stats System
// ============================================

export type BodyZoneStatus = 'green' | 'yellow' | 'red'
export type MedicalDocumentType = 'blood' | 'xray' | 'prescription' | 'mri' | 'ultrasound' | 'other'
export type HealthMetricType = 'weight' | 'sleep' | 'water' | 'steps' | 'mood' | 'heart_rate' | 'blood_pressure'

export interface BodyZone {
  id: string
  name: string
  displayName: string
  icon: string
  status: BodyZoneStatus
  notes: string
  lastCheckup?: string
  position: { x: number; y: number } // For 2D map positioning (0-100%)
}

export interface MedicalDocument {
  id: string
  title: string
  fileUrl: string
  fileType: 'pdf' | 'image'
  documentType: MedicalDocumentType
  date: string
  summary?: string
  tags: string[]
  doctorName?: string
  clinic?: string
  createdAt: string
}

export interface HealthMetricEntry {
  id: string
  date: string
  type: HealthMetricType
  value: number
  unit: string
  notes?: string
  time?: string // Optional time for specific readings
}

export interface HealthProfile {
  bloodType?: string
  allergies: string[]
  chronicConditions: string[]
  medications: Medication[]
  emergencyContact?: EmergencyContact
}

export interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  startDate: string
  endDate?: string
  notes?: string
}

export interface EmergencyContact {
  name: string
  phone: string
  relationship: string
}
