// ============================================
// RATE LIMITING - API Protection
// ============================================

import LRUCache from "lru-cache"

export interface RateLimitConfig {
  windowMs: number      // Time window in milliseconds
  maxRequests: number   // Max requests per window
  keyPrefix?: string    // Prefix for the key
}

export interface RateLimitResult {
  success: boolean      // Whether request is allowed
  limit: number         // Max requests allowed
  remaining: number     // Remaining requests in window
  reset: number         // Timestamp when window resets
  retryAfter?: number   // Seconds to wait before retry (if limited)
}

// In-memory store for rate limiting
// Note: In production with multiple instances, use Redis (e.g., Upstash)
const rateLimitCache = new Map<string, LRUCache<string, number[]>>()

/**
 * Create a rate limiter instance
 */
export function createRateLimiter(config: RateLimitConfig) {
  const { windowMs, maxRequests, keyPrefix = "ratelimit" } = config

  // Create or get cache for this rate limiter
  const cacheKey = `${keyPrefix}:${windowMs}:${maxRequests}`
  if (!rateLimitCache.has(cacheKey)) {
    rateLimitCache.set(
      cacheKey,
      new LRUCache({
        max: 10000, // Max 10000 unique IPs/users
        ttl: windowMs,
      })
    )
  }

  const cache = rateLimitCache.get(cacheKey)!

  return {
    check: (identifier: string): RateLimitResult => {
      const now = Date.now()
      const windowStart = now - windowMs

      // Get existing requests for this identifier
      const requests = cache.get(identifier) || []

      // Filter out old requests outside the window
      const validRequests = requests.filter((time: number) => time > windowStart)

      // Check if limit exceeded
      if (validRequests.length >= maxRequests) {
        const oldestRequest = validRequests[0]
        const reset = oldestRequest + windowMs
        const retryAfter = Math.ceil((reset - now) / 1000)

        return {
          success: false,
          limit: maxRequests,
          remaining: 0,
          reset,
          retryAfter,
        }
      }

      // Add current request
      validRequests.push(now)
      cache.set(identifier, validRequests)

      return {
        success: true,
        limit: maxRequests,
        remaining: maxRequests - validRequests.length,
        reset: now + windowMs,
      }
    },

    reset: (identifier: string): void => {
      cache.delete(identifier)
    },
  }
}

// ============================================
// PREDEFINED RATE LIMITERS
// ============================================

// Strict limit for authentication endpoints
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,           // 5 attempts
  keyPrefix: "auth",
})

// General API rate limiter
export const apiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,      // 1 minute
  maxRequests: 100,         // 100 requests per minute
  keyPrefix: "api",
})

// Strict limit for sensitive operations
export const strictRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10,          // 10 requests per hour
  keyPrefix: "strict",
})

// ============================================
// HELPERS
// ============================================

/**
 * Get client IP from request
 */
export function getClientIP(request: Request): string {
  // Try to get IP from headers
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }

  const realIP = request.headers.get("x-real-ip")
  if (realIP) {
    return realIP
  }

  // Fallback to a default (in production, use proper IP detection)
  return "anonymous"
}

/**
 * Get identifier for rate limiting (IP + optional user ID)
 */
export function getRateLimitIdentifier(request: Request, userId?: string): string {
  const ip = getClientIP(request)
  return userId ? `${ip}:${userId}` : ip
}

/**
 * Create rate limit response headers
 */
export function createRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": result.limit.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": result.reset.toString(),
    ...(result.retryAfter && { "Retry-After": result.retryAfter.toString() }),
  }
}
