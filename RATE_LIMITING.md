# Rate Limiting

LifeOS includes built-in rate limiting to protect API endpoints from abuse.

## Overview

Rate limiting is applied to all API routes that modify data (POST, PATCH, DELETE). GET requests are currently not rate-limited for better user experience.

## Default Limits

| Endpoint Type | Window | Max Requests | Headers |
|--------------|--------|--------------|---------|
| Auth | 15 min | 5 attempts | ✅ |
| API (CRUD) | 1 min | 60 requests | ✅ |
| Strict | 1 hour | 10 requests | ✅ |
| Sync | 1 min | 10 requests | ✅ |

## Implementation

### In-Memory Store

Rate limiting uses an in-memory LRU cache. **Note**: For production with multiple instances, migrate to Redis (e.g., Upstash).

```typescript
// Current implementation (single instance)
const rateLimitCache = new Map<string, LRUCache<string, number[]>>()

// For multi-instance production, use Redis:
// import { Redis } from '@upstash/redis'
```

### Usage in API Routes

```typescript
import { checkRateLimit, rateLimitPresets } from "@/lib/api/rate-limit-middleware"

export async function POST(request: NextRequest) {
  // Check rate limit
  const rateLimitResult = await checkRateLimit(request, rateLimitPresets.api)
  if (!rateLimitResult.allowed) {
    return rateLimitResult.response! // Returns 429 Too Many Requests
  }
  
  // Your handler logic here...
  
  // Add rate limit headers to response
  const response = NextResponse.json({ data })
  Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  return response
}
```

## Response Headers

All rate-limited responses include these headers:

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1704067200000
```

When limit exceeded:

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 45
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1704067200000

{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Try again in 45 seconds.",
  "retryAfter": 45
}
```

## Client-Side Handling

Clients should check for `429` status code and use `Retry-After` header:

```typescript
const response = await fetch('/api/goals', { method: 'POST', body: data })

if (response.status === 429) {
  const error = await response.json()
  const retryAfter = error.retryAfter // seconds
  
  // Show user message or wait before retry
  console.log(`Rate limited. Retry in ${retryAfter} seconds`)
}
```

## Custom Rate Limits

Create custom rate limiter:

```typescript
import { createRateLimiter } from "@/lib/rate-limit"

const customLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  maxRequests: 20,
  keyPrefix: "custom",
})

const result = customLimiter.check(identifier)
```

## Protected Endpoints

The following endpoints have rate limiting enabled:

- `POST /api/goals`
- `PATCH /api/goals`
- `DELETE /api/goals`
- `POST /api/tasks`
- `PATCH /api/tasks`
- `DELETE /api/tasks`
- `POST /api/habits`
- `PATCH /api/habits`
- `DELETE /api/habits`
- `POST /api/skills`
- `PATCH /api/skills`
- `DELETE /api/skills`
- `POST /api/finance`
- `PATCH /api/finance`
- `DELETE /api/finance`
- `POST /api/sync`

## Future Improvements

1. **Redis Backend**: For multi-instance deployments
2. **User-Based Limits**: Different limits for free/paid users
3. **Endpoint-Specific Limits**: Stricter limits for expensive operations
4. **Rate Limit Notifications**: Warn users when approaching limit
