import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// ─── In-memory rate limiter (per server instance) ─────────────────────────
// Resets on cold start — acceptable for personal app without Redis.
// Key: IP address  Value: { count, lockedUntil }
interface RateLimitEntry {
  count: number
  lockedUntil: number | null
}

const attempts = new Map<string, RateLimitEntry>()
const MAX_ATTEMPTS = 5
const LOCKOUT_MS = 5 * 60 * 1000 // 5 minutes
const WINDOW_MS = 15 * 60 * 1000 // reset counter after 15 min of no attempts

function getIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  )
}

function checkRateLimit(ip: string): { allowed: boolean; remainingMs: number; attemptsLeft: number } {
  const now = Date.now()
  const entry = attempts.get(ip)

  if (!entry) return { allowed: true, remainingMs: 0, attemptsLeft: MAX_ATTEMPTS }

  // Locked?
  if (entry.lockedUntil && now < entry.lockedUntil) {
    return { allowed: false, remainingMs: entry.lockedUntil - now, attemptsLeft: 0 }
  }

  // Lock expired — reset
  if (entry.lockedUntil && now >= entry.lockedUntil) {
    attempts.delete(ip)
    return { allowed: true, remainingMs: 0, attemptsLeft: MAX_ATTEMPTS }
  }

  return {
    allowed: true,
    remainingMs: 0,
    attemptsLeft: Math.max(0, MAX_ATTEMPTS - entry.count),
  }
}

function recordFailure(ip: string): void {
  const now = Date.now()
  const entry = attempts.get(ip) ?? { count: 0, lockedUntil: null }
  const newCount = entry.count + 1
  attempts.set(ip, {
    count: newCount,
    lockedUntil: newCount >= MAX_ATTEMPTS ? now + LOCKOUT_MS : null,
  })
  // Auto-cleanup after window
  setTimeout(() => {
    const current = attempts.get(ip)
    if (current && !current.lockedUntil) attempts.delete(ip)
  }, WINDOW_MS)
}

function clearIP(ip: string): void {
  attempts.delete(ip)
}

// ─── Route handler ─────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const ip = getIP(req)
  const { allowed, remainingMs, attemptsLeft } = checkRateLimit(ip)

  if (!allowed) {
    return NextResponse.json(
      {
        error: "too_many_attempts",
        message: "Слишком много попыток. Попробуйте позже.",
        remainingMs,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(remainingMs / 1000)),
          "X-RateLimit-Limit": String(MAX_ATTEMPTS),
          "X-RateLimit-Remaining": "0",
        },
      },
    )
  }

  const body = await req.json().catch(() => null)
  if (!body?.email || !body?.password) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 })
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email: body.email,
    password: body.password,
  })

  if (error) {
    // Only count real auth failures, not network/server errors
    if (error.status === 400 || error.message?.toLowerCase().includes("invalid")) {
      recordFailure(ip)
      const state = checkRateLimit(ip)
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
          attemptsLeft: state.attemptsLeft,
        },
        {
          status: 401,
          headers: {
            "X-RateLimit-Remaining": String(state.attemptsLeft),
          },
        },
      )
    }
    return NextResponse.json({ error: error.message }, { status: error.status ?? 500 })
  }

  // Success — clear counter for this IP
  clearIP(ip)

  return NextResponse.json({ ok: true, user: data.user })
}
