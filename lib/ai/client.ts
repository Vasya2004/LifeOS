// ============================================
// AI CLIENT - Main API for AI features
// ============================================

import { defaultAIConfig, RATE_LIMIT, AIProvider } from "./config"
import { PROMPTS, UserContext, AIAdviceResponse } from "./prompts"
import { generateLocalAdvice } from "./fallback"

// Cache for AI responses
const responseCache = new Map<string, { data: AIAdviceResponse[]; timestamp: number }>()

interface RequestHistory {
  timestamps: number[]
}

const requestHistory: Record<string, RequestHistory> = {
  minute: { timestamps: [] },
  hour: { timestamps: [] },
}

// Rate limiting check
function checkRateLimit(): boolean {
  const now = Date.now()
  const oneMinute = 60 * 1000
  const oneHour = 60 * oneMinute

  // Clean old timestamps
  requestHistory.minute.timestamps = requestHistory.minute.timestamps.filter(
    t => now - t < oneMinute
  )
  requestHistory.hour.timestamps = requestHistory.hour.timestamps.filter(
    t => now - t < oneHour
  )

  // Check limits
  if (requestHistory.minute.timestamps.length >= RATE_LIMIT.maxRequestsPerMinute) {
    return false
  }
  if (requestHistory.hour.timestamps.length >= RATE_LIMIT.maxRequestsPerHour) {
    return false
  }

  // Record request
  requestHistory.minute.timestamps.push(now)
  requestHistory.hour.timestamps.push(now)
  return true
}

// Generate cache key
function generateCacheKey(context: Partial<UserContext>): string {
  // Simple hash of key data points
  const key = JSON.stringify({
    level: context.stats?.level,
    streak: context.stats?.currentStreak,
    tasks: context.todaysTasks?.length,
    overdue: context.overdueTasks?.length,
    habits: context.habits?.length,
    // Round to 5-minute buckets for cache
    timeBucket: Math.floor(Date.now() / (1000 * 60 * RATE_LIMIT.cacheTtlMinutes)),
  })
  return btoa(key)
}

// Check cache
function getCachedAdvice(cacheKey: string): AIAdviceResponse[] | null {
  const cached = responseCache.get(cacheKey)
  if (!cached) return null
  
  const ttl = 1000 * 60 * RATE_LIMIT.cacheTtlMinutes
  if (Date.now() - cached.timestamp > ttl) {
    responseCache.delete(cacheKey)
    return null
  }
  return cached.data
}

// Cache response
function cacheAdvice(cacheKey: string, advice: AIAdviceResponse[]) {
  responseCache.set(cacheKey, {
    data: advice,
    timestamp: Date.now(),
  })
  
  // Clean old cache entries if too many
  if (responseCache.size > 100) {
    const oldest = Array.from(responseCache.entries())[0]
    responseCache.delete(oldest[0])
  }
}

// Call OpenAI API
async function callOpenAI(prompt: string): Promise<AIAdviceResponse[]> {
  const apiKey = defaultAIConfig.apiKey
  if (!apiKey) throw new Error("OpenAI API key not configured")

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: defaultAIConfig.model,
      messages: [
        { role: "system", content: "You are LifeOS AI Advisor. Respond only with valid JSON." },
        { role: "user", content: prompt },
      ],
      temperature: defaultAIConfig.temperature,
      max_tokens: defaultAIConfig.maxTokens,
      response_format: { type: "json_object" },
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenAI API error: ${error}`)
  }

  const data = await response.json()
  const content = data.choices[0]?.message?.content
  
  if (!content) {
    throw new Error("Empty response from OpenAI")
  }

  const parsed = JSON.parse(content)
  return Array.isArray(parsed) ? parsed : [parsed]
}

// Call Anthropic API
async function callAnthropic(prompt: string): Promise<AIAdviceResponse[]> {
  const apiKey = defaultAIConfig.apiKey
  if (!apiKey) throw new Error("Anthropic API key not configured")

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: defaultAIConfig.model,
      max_tokens: defaultAIConfig.maxTokens,
      temperature: defaultAIConfig.temperature,
      system: "You are LifeOS AI Advisor. Respond only with valid JSON array or object.",
      messages: [{ role: "user", content: prompt }],
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Anthropic API error: ${error}`)
  }

  const data = await response.json()
  const content = data.content?.[0]?.text
  
  if (!content) {
    throw new Error("Empty response from Anthropic")
  }

  const parsed = JSON.parse(content)
  return Array.isArray(parsed) ? parsed : [parsed]
}

// Main function to generate advice
export async function generateAdvice(
  context: Partial<UserContext>,
  options: { useAI?: boolean; type?: 'general' | 'habits' | 'goals' | 'finance' | 'health' | 'skills' } = {}
): Promise<AIAdviceResponse[]> {
  const { useAI = defaultAIConfig.enabled, type = 'general' } = options

  // Check cache first
  const cacheKey = generateCacheKey(context)
  const cached = getCachedAdvice(cacheKey)
  if (cached) {
    return cached
  }

  // Use fallback if AI is disabled or rate limited
  if (!useAI || !checkRateLimit()) {
    const fallback = generateLocalAdvice(context)
    // Convert to AIAdviceResponse format
    return fallback.map(f => ({
      type: f.type,
      title: f.title,
      message: f.message,
      actionLabel: f.actionLabel,
      priority: f.priority || 5,
    }))
  }

  try {
    const prompt = PROMPTS[type](context as UserContext)
    
    let responses: AIAdviceResponse[]
    
    switch (defaultAIConfig.provider) {
      case 'openai':
        responses = await callOpenAI(prompt)
        break
      case 'anthropic':
        responses = await callAnthropic(prompt)
        break
      default:
        throw new Error("Unknown AI provider")
    }

    // Validate and normalize responses
    const validated = responses.map(r => ({
      type: ['urgent', 'warning', 'tip', 'positive'].includes(r.type) ? r.type : 'tip',
      title: r.title?.slice(0, 100) || 'Совет',
      message: r.message?.slice(0, 500) || 'Нет сообщения',
      actionLabel: r.actionLabel?.slice(0, 50),
      priority: Math.max(1, Math.min(10, r.priority || 5)),
    }))

    // Cache successful response
    cacheAdvice(cacheKey, validated)
    
    return validated
  } catch (error) {
    console.error("AI generation failed, using fallback:", error)
    const fallback = generateLocalAdvice(context)
    return fallback.map(f => ({
      type: f.type,
      title: f.title,
      message: f.message,
      actionLabel: f.actionLabel,
      priority: f.priority || 5,
    }))
  }
}

// Analyze progress
export async function analyzeProgress(
  context: Partial<UserContext>
): Promise<{ summary: string; trends: string[]; recommendations: string[] }> {
  // Always use local for this to save costs
  const stats = context.stats
  const habits = context.habits || []
  const goals = context.activeGoals || []

  const summary = stats
    ? `Уровень ${stats.level}, ${stats.xp} XP. Серия: ${stats.currentStreak} дней.`
    : 'Недостаточно данных'

  const trends = [
    habits.length > 0 ? `${habits.length} активных привычек` : 'Нет активных привычек',
    goals.length > 0 ? `${goals.length} активных целей` : 'Нет активных целей',
  ]

  const recommendations: string[] = []
  
  if (context.overdueTasks && context.overdueTasks.length > 0) {
    recommendations.push('Разберитесь с просроченными задачами')
  }
  if (habits.some(h => h.streak < 3)) {
    recommendations.push('Укрепите слабые привычки')
  }
  if (recommendations.length === 0) {
    recommendations.push('Продолжайте в том же духе!')
  }

  return { summary, trends, recommendations }
}

// Suggest tasks based on context
export async function suggestTasks(
  context: Partial<UserContext>
): Promise<string[]> {
  const suggestions: string[] = []
  
  if (context.overdueTasks && context.overdueTasks.length > 0) {
    suggestions.push(`Завершить: ${context.overdueTasks[0].title}`)
  }
  
  if (context.habits) {
    const incomplete = context.habits.filter(h => h.streak === 0)
    if (incomplete.length > 0) {
      suggestions.push(`Выполнить привычку: ${incomplete[0].title}`)
    }
  }
  
  if (context.activeGoals) {
    const goal = context.activeGoals[0]
    if (goal && goal.progress < 50) {
      suggestions.push(`Продвинуть цель: ${goal.title}`)
    }
  }

  if (suggestions.length === 0) {
    suggestions.push('Добавить новую задачу на сегодня')
  }

  return suggestions
}

// Export for use in components
export { generateLocalAdvice }
