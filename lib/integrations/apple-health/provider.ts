// ============================================
// APPLE HEALTH INTEGRATION
// ============================================

import type { IntegrationProvider, SyncResult, IntegrationConfig } from "../registry"
import { createClient } from "@/lib/supabase/client"

// Note: Apple Health on the Web requires iOS 17.4+ and macOS 14.4+
// Most users will use the native app integration via HealthKit

const APPLE_HEALTH_CONFIG: IntegrationConfig = {
  clientId: '', // Apple uses different auth flow
  clientSecret: '',
  redirectUri: '',
  scopes: ['health.records', 'health.read'],
  authUrl: '',
  tokenUrl: '',
  apiBaseUrl: 'https://api.apple.com/health/v1',
}

export interface HealthMetric {
  type: string
  value: number
  unit: string
  startDate: string
  endDate: string
  source: string
}

export class AppleHealthProvider implements IntegrationProvider {
  id = 'apple-health' as const
  name = 'Apple Health'
  description = 'Синхронизация данных здоровья из Apple Health'
  icon = 'heart'
  category = 'health' as const
  config = APPLE_HEALTH_CONFIG

  private isAvailable(): boolean {
    // Check if HealthKit Web API is available
    return typeof window !== 'undefined' && 'HealthKit' in window
  }

  async connect(): Promise<void> {
    if (!this.isAvailable()) {
      // Show instructions for manual export/import
      throw new Error('Apple Health Web API не доступен. Используйте приложение iOS.')
    }

    // Request permissions via HealthKit Web API
    try {
      const HealthKit = (window as any).HealthKit
      await HealthKit.requestAuthorization({
        read: [
          'stepCount',
          'activeEnergyBurned',
          'sleepAnalysis',
          'heartRate',
          'bodyMass',
        ],
      })

      // Save connection state
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        await supabase
          .from('integrations')
          .upsert({
            user_id: user.id,
            type: this.id,
            connected: true,
            updated_at: new Date().toISOString(),
          })
      }
    } catch (error) {
      throw new Error('Не удалось получить доступ к Apple Health')
    }
  }

  async disconnect(): Promise<void> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      await supabase
        .from('integrations')
        .delete()
        .eq('user_id', user.id)
        .eq('type', this.id)
    }
  }

  async isConnected(): Promise<boolean> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return false

    const { data } = await supabase
      .from('integrations')
      .select('connected')
      .eq('user_id', user.id)
      .eq('type', this.id)
      .single()

    return data?.connected || false
  }

  async sync(): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      itemsSynced: 0,
      errors: [],
    }

    if (!this.isAvailable()) {
      result.errors.push('Apple Health Web API не доступен')
      return result
    }

    try {
      const HealthKit = (window as any).HealthKit
      const endDate = new Date()
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days

      // Query multiple metrics
      const metrics: HealthMetric[] = []

      // Steps
      const steps = await this.queryQuantity(
        HealthKit,
        'stepCount',
        startDate,
        endDate
      )
      metrics.push(...steps)

      // Active energy
      const energy = await this.queryQuantity(
        HealthKit,
        'activeEnergyBurned',
        startDate,
        endDate
      )
      metrics.push(...energy)

      // Sleep
      const sleep = await this.queryCategory(
        HealthKit,
        'sleepAnalysis',
        startDate,
        endDate
      )
      metrics.push(...sleep)

      // Heart rate
      const heartRate = await this.queryQuantity(
        HealthKit,
        'heartRate',
        startDate,
        endDate
      )
      metrics.push(...heartRate)

      // Sync with local health data
      await this.syncMetricsWithLocal(metrics)

      result.success = true
      result.itemsSynced = metrics.length

    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : 'Unknown error')
    }

    return result
  }

  private async queryQuantity(
    HealthKit: any,
    type: string,
    startDate: Date,
    endDate: Date
  ): Promise<HealthMetric[]> {
    const results = await HealthKit.queryQuantitySamples({
      type,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      unit: this.getUnitForType(type),
    })

    return results.map((r: any) => ({
      type,
      value: r.value,
      unit: r.unit,
      startDate: r.startDate,
      endDate: r.endDate,
      source: r.source,
    }))
  }

  private async queryCategory(
    HealthKit: any,
    type: string,
    startDate: Date,
    endDate: Date
  ): Promise<HealthMetric[]> {
    const results = await HealthKit.queryCategorySamples({
      type,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    })

    return results.map((r: any) => ({
      type,
      value: r.value === 'inBed' ? 1 : 0,
      unit: 'category',
      startDate: r.startDate,
      endDate: r.endDate,
      source: r.source,
    }))
  }

  private getUnitForType(type: string): string {
    const units: Record<string, string> = {
      stepCount: 'count',
      activeEnergyBurned: 'kcal',
      heartRate: 'bpm',
      bodyMass: 'kg',
    }
    return units[type] || 'count'
  }

  private async syncMetricsWithLocal(metrics: HealthMetric[]): Promise<void> {
    const { addHealthMetric } = await import('@/lib/store/health')

    for (const metric of metrics) {
      const typeMap: Record<string, string> = {
        stepCount: 'steps',
        activeEnergyBurned: 'calories',
        sleepAnalysis: 'sleep',
        heartRate: 'heart_rate',
        bodyMass: 'weight',
      }

      const mappedType = typeMap[metric.type]
      if (!mappedType) continue

      addHealthMetric({
        type: mappedType as any,
        value: metric.value,
        unit: metric.unit,
        date: metric.startDate.split('T')[0],
        time: metric.startDate.split('T')[1]?.slice(0, 5),
        source: 'apple-health',
      })
    }
  }

  // Alternative: Manual import from Apple Health export
  async importFromFile(file: File): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      itemsSynced: 0,
      errors: [],
    }

    try {
      const text = await file.text()
      const data = JSON.parse(text)
      
      // Parse Apple Health export format
      const metrics = this.parseAppleHealthExport(data)
      await this.syncMetricsWithLocal(metrics)

      result.success = true
      result.itemsSynced = metrics.length

    } catch (error) {
      result.errors.push('Failed to parse Apple Health export file')
    }

    return result
  }

  private parseAppleHealthExport(data: any): HealthMetric[] {
    // Parse Apple Health export.xml or JSON format
    // This is a simplified version
    const metrics: HealthMetric[] = []
    
    if (data.data?.metrics) {
      for (const metric of data.data.metrics) {
        metrics.push({
          type: metric.name,
          value: metric.value,
          unit: metric.units,
          startDate: metric.date,
          endDate: metric.date,
          source: metric.source,
        })
      }
    }
    
    return metrics
  }
}

export const appleHealthProvider = new AppleHealthProvider()
