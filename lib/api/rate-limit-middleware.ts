// ============================================
// RATE LIMITING FOR API ROUTES
// ============================================
// Apply rate limiting to API route handlers

import { NextRequest, NextResponse } from "next/server"
import { createRateLimiter, getClientIP, createRateLimitHeaders, type RateLimitConfig } from "@/lib/rate-limit"

export interface RateLimitOptions {
  config: RateLimitConfig
  getIdentifier?: (request: NextRequest) => string
  skipSuccessfulRequests?: boolean
}

/**
 * Higher-order function to add rate limiting to API route
 */
export function withRateLimit(
  handler: (request: NextRequest, context?: { params: Record<string, string> }) => Promise<Response>,
  options: RateLimitOptions
) {
  const limiter = createRateLimiter(options.config)
  
  return async (request: NextRequest, context?: { params: Record<string, string> }): Promise<Response> => {
    // Get identifier (IP or custom)
    const identifier = options.getIdentifier 
      ? options.getIdentifier(request)
      : getClientIP(request)
    
    // Check rate limit
    const result = limiter.check(identifier)
    
    // Create headers
    const headers = createRateLimitHeaders(result)
    
    // If rate limited, return 429
    if (!result.success) {
      return NextResponse.json(
        { 
          error: "Too Many Requests",
          message: `Rate limit exceeded. Try again in ${result.retryAfter} seconds.`,
          retryAfter: result.retryAfter,
        },
        { 
          status: 429,
          headers,
        }
      )
    }
    
    // Call actual handler
    const response = await handler(request, context)
    
    // Add rate limit headers to response
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    
    return response
  }
}

/**
 * Rate limit configuration presets
 */
export const rateLimitPresets = {
  // For auth endpoints (login, register)
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    keyPrefix: "auth",
  } satisfies RateLimitConfig,
  
  // For general API usage
  api: {
    windowMs: 60 * 1000,      // 1 minute
    maxRequests: 60,          // 60 requests per minute
    keyPrefix: "api",
  } satisfies RateLimitConfig,
  
  // For strict/sensitive operations
  strict: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
    keyPrefix: "strict",
  } satisfies RateLimitConfig,
  
  // For sync operations
  sync: {
    windowMs: 60 * 1000,      // 1 minute
    maxRequests: 10,          // 10 syncs per minute
    keyPrefix: "sync",
  } satisfies RateLimitConfig,
}

/**
 * Simple rate limit check for use in route handlers
 */
export async function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig
): Promise<{ allowed: boolean; response?: NextResponse; headers: Record<string, string> }> {
  const limiter = createRateLimiter(config)
  const identifier = getClientIP(request)
  const result = limiter.check(identifier)
  const headers = createRateLimitHeaders(result)
  
  if (!result.success) {
    return {
      allowed: false,
      response: NextResponse.json(
        { 
          error: "Too Many Requests",
          retryAfter: result.retryAfter,
        },
        { status: 429, headers }
      ),
      headers,
    }
  }
  
  return { allowed: true, headers }
}
