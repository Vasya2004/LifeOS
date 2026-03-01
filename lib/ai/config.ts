// ============================================
// AI CONFIGURATION
// ============================================

export type AIProvider = 'openai' | 'anthropic' | 'local'

export interface AIConfig {
  provider: AIProvider
  apiKey?: string
  model: string
  maxTokens: number
  temperature: number
  enabled: boolean
}

// Default configuration
export const defaultAIConfig: AIConfig = {
  provider: (process.env.NEXT_PUBLIC_AI_PROVIDER as AIProvider) || 'local',
  apiKey: process.env.AI_API_KEY,
  model: process.env.NEXT_PUBLIC_AI_MODEL || 'gpt-4o-mini',
  maxTokens: 500,
  temperature: 0.7,
  enabled: Boolean(process.env.AI_API_KEY),
}

// Provider-specific settings
export const PROVIDER_CONFIGS: Record<Exclude<AIProvider, 'local'>, {
  baseUrl: string
  defaultModel: string
  models: string[]
  maxRequestsPerMinute: number
}> = {
  openai: {
    baseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'],
    maxRequestsPerMinute: 20,
  },
  anthropic: {
    baseUrl: 'https://api.anthropic.com/v1',
    defaultModel: 'claude-3-haiku-20240307',
    models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
    maxRequestsPerMinute: 20,
  },
}

// Rate limiting configuration
export const RATE_LIMIT = {
  maxRequestsPerMinute: 5,
  maxRequestsPerHour: 50,
  cacheTtlMinutes: 5,
}

// Feature flags
export const AI_FEATURES = {
  advice: true,
  progressAnalysis: true,
  taskSuggestions: true,
  habitInsights: true,
  financialTips: true,
}

// Cost tracking (approximate USD per 1K tokens)
export const AI_COSTS: Record<string, { input: number; output: number }> = {
  'gpt-4o': { input: 0.005, output: 0.015 },
  'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
  'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
  'claude-3-opus': { input: 0.015, output: 0.075 },
  'claude-3-sonnet': { input: 0.003, output: 0.015 },
  'claude-3-haiku': { input: 0.00025, output: 0.00125 },
}
