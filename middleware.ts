import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ─── Security Headers Configuration ────────────────────────────────────────
const CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-eval'",           // Required for Next.js
    "'unsafe-inline'",         // Required for inline scripts
    'https://*.supabase.co',
    'https://analytics.vercel.app',
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'",         // Required for Tailwind/shadcn
    'https://fonts.googleapis.com',
  ],
  'font-src': [
    "'self'",
    'https://fonts.gstatic.com',
    'data:',                   // For inline fonts
  ],
  'img-src': [
    "'self'",
    'data:',
    'blob:',
    'https:',
    'http:',
  ],
  'connect-src': [
    "'self'",
    'https://*.supabase.co',
    'wss://*.supabase.co',     // Realtime
    'https://analytics.vercel.app',
  ],
  'frame-ancestors': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'upgrade-insecure-requests': [],
}

// Generate CSP string
function generateCSP(): string {
  return Object.entries(CSP_DIRECTIVES)
    .map(([key, values]) => {
      if (values.length === 0) return key
      return `${key} ${values.join(' ')}`
    })
    .join('; ')
}

// Security headers
function addSecurityHeaders(response: NextResponse): NextResponse {
  const csp = generateCSP()
  
  // CSP
  response.headers.set('Content-Security-Policy', csp)
  
  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff')
  
  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY')
  
  // XSS Protection (legacy browsers)
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Permissions Policy
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=(), accelerometer=(), gyroscope=(), magnetometer=()'
  )
  
  // HSTS (only in production)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    )
  }
  
  return response
}

// ─── API rate limiting (cookie-based, Edge-compatible) ─────────────────────
// Protects all /api routes: max 120 requests per minute per IP.
const API_LIMIT = 120
const API_WINDOW_MS = 60_000

function apiRateLimit(request: NextRequest): NextResponse | null {
  if (!request.nextUrl.pathname.startsWith('/api')) return null

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'

  // Edge-safe "hash": take last 16 chars of btoa(ip)
  const cookieName = `rl_${btoa(ip).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16)}`
  const raw = request.cookies.get(cookieName)?.value
  const now = Date.now()

  let count = 1
  let windowStart = now

  if (raw) {
    try {
      const parsed = JSON.parse(raw) as { count: number; windowStart: number }
      if (now - parsed.windowStart < API_WINDOW_MS) {
        count = parsed.count + 1
        windowStart = parsed.windowStart
      }
    } catch { /* ignore malformed cookie */ }
  }

  const remainingMs = windowStart + API_WINDOW_MS - now

  if (count > API_LIMIT) {
    return NextResponse.json(
      { error: 'rate_limit_exceeded' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil(remainingMs / 1000)),
          'X-RateLimit-Limit': String(API_LIMIT),
          'X-RateLimit-Remaining': '0',
        },
      },
    )
  }

  // Attach updated counter to the response cookie
  const next = NextResponse.next({ request })
  next.cookies.set(cookieName, JSON.stringify({ count, windowStart }), {
    httpOnly: true,
    sameSite: 'strict',
    maxAge: Math.ceil(API_WINDOW_MS / 1000),
    path: '/api',
  })
  return next
}

export async function middleware(request: NextRequest) {
  // API rate limiting — runs before everything else
  const rateLimitResponse = apiRateLimit(request)
  if (rateLimitResponse?.status === 429) return rateLimitResponse

  let supabaseResponse = rateLimitResponse ?? NextResponse.next({ request })

  const isGuestMode = request.cookies.get('lifeos_guest_mode')?.value === 'true'
  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth')
  const isPublicRoute = isAuthRoute ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js)$/)

  // Guest mode: skip Supabase entirely
  if (isGuestMode) {
    if (isAuthRoute && !request.nextUrl.pathname.includes('/callback')) {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
    return addSecurityHeaders(supabaseResponse)
  }

  // Public routes: skip Supabase check
  if (isPublicRoute) {
    return addSecurityHeaders(supabaseResponse)
  }

  // ============================================
  // AUTHENTICATION CHECK (Supabase)
  // ============================================

  // Fast path: use short-lived auth cache cookie to skip Supabase on every navigation
  const AUTH_CACHE_COOKIE = 'lifeos_auth_ok'
  const AUTH_CACHE_TTL_MS = 60_000 // 60 seconds

  const authCacheRaw = request.cookies.get(AUTH_CACHE_COOKIE)?.value
  if (authCacheRaw) {
    try {
      const { expiresAt } = JSON.parse(authCacheRaw) as { expiresAt: number }
      if (Date.now() < expiresAt) {
        return addSecurityHeaders(supabaseResponse)
      }
    } catch { /* ignore malformed */ }
  }

  let user = null

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value),
            )
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options),
            )
          },
        },
      },
    )

    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch {
    // Supabase unavailable — redirect to login
  }

  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirect', request.nextUrl.pathname)
    return addSecurityHeaders(NextResponse.redirect(url))
  }

  // Cache successful auth for 60 seconds
  const response = addSecurityHeaders(supabaseResponse)
  response.cookies.set(AUTH_CACHE_COOKIE, JSON.stringify({ expiresAt: Date.now() + AUTH_CACHE_TTL_MS }), {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60,
    path: '/',
  })
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
