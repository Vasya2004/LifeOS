// ============================================
// GOOGLE CALENDAR TOKEN REFRESH
// ============================================

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get stored tokens
    const { data: integration } = await supabase
      .from('integrations')
      .select('*')
      .eq('user_id', user.id)
      .eq('type', 'google-calendar')
      .single()

    if (!integration) {
      return NextResponse.json({ error: 'Not connected' }, { status: 404 })
    }

    // Check if token needs refresh
    const expiresAt = new Date(integration.expires_at).getTime()
    const now = Date.now()

    let accessToken = integration.access_token

    if (now >= expiresAt - 5 * 60 * 1000) { // Refresh 5 min before expiry
      // Refresh token
      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          refresh_token: integration.refresh_token,
          grant_type: 'refresh_token',
        }),
      })

      if (!refreshResponse.ok) {
        return NextResponse.json({ error: 'Token refresh failed' }, { status: 401 })
      }

      const newTokens = await refreshResponse.json()
      accessToken = newTokens.access_token

      // Update stored tokens
      await supabase
        .from('integrations')
        .update({
          access_token: accessToken,
          expires_at: new Date(Date.now() + newTokens.expires_in * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .eq('type', 'google-calendar')
    }

    return NextResponse.json({ access_token: accessToken })

  } catch (error) {
    console.error('Token error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
