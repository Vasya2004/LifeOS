// ============================================
// GOOGLE CALENDAR OAUTH CALLBACK
// ============================================

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      return NextResponse.redirect(
        new URL('/settings/integrations?error=google_auth_denied', request.url)
      )
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/settings/integrations?error=no_code', request.url)
      )
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/auth/google-calendar/callback`,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error('Token exchange failed:', errorData)
      return NextResponse.redirect(
        new URL('/settings/integrations?error=token_exchange', request.url)
      )
    }

    const tokens = await tokenResponse.json()

    // Get user
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(
        new URL('/auth/login?redirect=/settings/integrations', request.url)
      )
    }

    // Encrypt and store tokens
    const { error: dbError } = await supabase
      .from('integrations')
      .upsert({
        user_id: user.id,
        type: 'google-calendar',
        connected: true,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        config: {
          scope: tokens.scope,
        },
        updated_at: new Date().toISOString(),
      })

    if (dbError) {
      console.error('Failed to store integration:', dbError)
      return NextResponse.redirect(
        new URL('/settings/integrations?error=storage', request.url)
      )
    }

    // Redirect back to integrations page
    return NextResponse.redirect(
      new URL('/settings/integrations?success=google_connected', request.url)
    )

  } catch (error) {
    console.error('Google Calendar callback error:', error)
    return NextResponse.redirect(
      new URL('/settings/integrations?error=unknown', request.url)
    )
  }
}
