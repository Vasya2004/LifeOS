// ============================================
// INTEGRATIONS REGISTRY
// ============================================

import { createClient } from "@/lib/supabase/client"

export type IntegrationType = 'google-calendar' | 'apple-health' | 'fitbit' | 'oura' | 'whoop'

export interface IntegrationConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  scopes: string[]
  authUrl: string
  tokenUrl: string
  apiBaseUrl: string
}

export interface IntegrationState {
  type: IntegrationType
  connected: boolean
  lastSync?: string
  error?: string
  config?: Record<string, unknown>
}

export interface IntegrationProvider {
  id: IntegrationType
  name: string
  description: string
  icon: string
  category: 'calendar' | 'health' | 'fitness'
  config: IntegrationConfig
  connect(): Promise<void>
  disconnect(): Promise<void>
  sync(): Promise<SyncResult>
  isConnected(): Promise<boolean>
}

export interface SyncResult {
  success: boolean
  itemsSynced: number
  errors: string[]
  nextSyncToken?: string
}

// Registry of all integrations
class IntegrationRegistry {
  private providers: Map<IntegrationType, IntegrationProvider> = new Map()
  private stateCache: Map<IntegrationType, IntegrationState> = new Map()

  register(provider: IntegrationProvider) {
    this.providers.set(provider.id, provider)
  }

  get(type: IntegrationType): IntegrationProvider | undefined {
    return this.providers.get(type)
  }

  getAll(): IntegrationProvider[] {
    return Array.from(this.providers.values())
  }

  getByCategory(category: IntegrationProvider['category']): IntegrationProvider[] {
    return this.getAll().filter(p => p.category === category)
  }

  async getState(type: IntegrationType): Promise<IntegrationState> {
    // Check cache first
    const cached = this.stateCache.get(type)
    if (cached && Date.now() - (cached.lastSync ? new Date(cached.lastSync).getTime() : 0) < 60000) {
      return cached
    }

    // Fetch from database
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { type, connected: false }
    }

    const { data, error } = await supabase
      .from('integrations')
      .select('*')
      .eq('user_id', user.id)
      .eq('type', type)
      .single()

    if (error || !data) {
      const state: IntegrationState = { type, connected: false }
      this.stateCache.set(type, state)
      return state
    }

    const state: IntegrationState = {
      type,
      connected: true,
      lastSync: data.last_sync,
      error: data.error,
      config: data.config,
    }
    
    this.stateCache.set(type, state)
    return state
  }

  async setState(type: IntegrationType, state: Partial<IntegrationState>) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return

    const { error } = await supabase
      .from('integrations')
      .upsert({
        user_id: user.id,
        type,
        ...state,
        updated_at: new Date().toISOString(),
      })

    if (!error) {
      const current = await this.getState(type)
      this.stateCache.set(type, { ...current, ...state })
    }
  }

  async enableIntegration(type: IntegrationType, config: Record<string, unknown>) {
    const provider = this.get(type)
    if (!provider) throw new Error(`Unknown integration: ${type}`)

    await this.setState(type, { connected: true, config })
    await provider.connect()
  }

  async disableIntegration(type: IntegrationType) {
    const provider = this.get(type)
    if (provider) {
      await provider.disconnect()
    }
    
    await this.setState(type, { connected: false })
    this.stateCache.delete(type)
  }

  async syncIntegration(type: IntegrationType): Promise<SyncResult> {
    const provider = this.get(type)
    if (!provider) {
      return { success: false, itemsSynced: 0, errors: ['Unknown integration'] }
    }

    const isConnected = await provider.isConnected()
    if (!isConnected) {
      return { success: false, itemsSynced: 0, errors: ['Not connected'] }
    }

    const result = await provider.sync()
    
    if (result.success) {
      await this.setState(type, { lastSync: new Date().toISOString() })
    } else {
      await this.setState(type, { error: result.errors[0] })
    }

    return result
  }

  async syncAll(): Promise<Record<IntegrationType, SyncResult>> {
    const results = {} as Record<IntegrationType, SyncResult>
    
    for (const [type] of this.providers) {
      const state = await this.getState(type)
      if (state.connected) {
        results[type] = await this.syncIntegration(type)
      }
    }
    
    return results
  }

  clearCache() {
    this.stateCache.clear()
  }
}

// Singleton instance
export const integrationRegistry = new IntegrationRegistry()

// Hook-friendly functions
export async function getEnabledIntegrations(): Promise<IntegrationState[]> {
  const all = integrationRegistry.getAll()
  const states = await Promise.all(
    all.map(p => integrationRegistry.getState(p.id))
  )
  return states.filter(s => s.connected)
}

export async function isIntegrationEnabled(type: IntegrationType): Promise<boolean> {
  const state = await integrationRegistry.getState(type)
  return state.connected
}
