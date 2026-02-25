import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { checkRateLimit, rateLimitPresets } from "@/lib/api/rate-limit-middleware"

async function getAuthUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return { supabase, user: null }
  return { supabase, user }
}

// GET - Load user data from server
export async function GET() {
  let supabase: Awaited<ReturnType<typeof createClient>>
  let user: { id: string } | null

  try {
    const auth = await getAuthUser()
    supabase = auth.supabase
    user = auth.user
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { data, error } = await supabase
      .from("user_data")
      .select("data, version, updated_at")
      .eq("user_id", user.id)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ data: {}, version: "1.0.0" })
      }
      throw error
    }

    return NextResponse.json({
      data: data.data,
      version: data.version,
      updatedAt: data.updated_at,
    })
  } catch (error) {
    console.error("[Sync API] GET error:", error)
    return NextResponse.json(
      { error: "Failed to load data" },
      { status: 500 }
    )
  }
}

// POST - Save user data to server
export async function POST(request: NextRequest) {
  // Rate limiting: max 10 syncs per minute per IP
  const { allowed, response: rateLimitResponse, headers } = await checkRateLimit(request, rateLimitPresets.sync)
  if (!allowed) return rateLimitResponse!

  let supabase: Awaited<ReturnType<typeof createClient>>
  let user: { id: string } | null

  try {
    const auth = await getAuthUser()
    supabase = auth.supabase
    user = auth.user
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { data, version = "1.0.0" } = body

    // Validate data size (max 5MB)
    const dataSize = JSON.stringify(data).length
    if (dataSize > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Data too large (max 5MB)" },
        { status: 413 }
      )
    }

    const { error } = await supabase
      .from("user_data")
      .upsert({
        user_id: user.id,
        data,
        version,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "user_id",
      })

    if (error) throw error

    const response = NextResponse.json({ success: true })

    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    return response
  } catch (error) {
    console.error("[Sync API] POST error:", error)
    return NextResponse.json(
      { error: "Failed to save data" },
      { status: 500 }
    )
  }
}

// DELETE - Clear user data
export async function DELETE() {
  let supabase: Awaited<ReturnType<typeof createClient>>
  let user: { id: string } | null

  try {
    const auth = await getAuthUser()
    supabase = auth.supabase
    user = auth.user
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { error } = await supabase
      .from("user_data")
      .delete()
      .eq("user_id", user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Sync API] DELETE error:", error)
    return NextResponse.json(
      { error: "Failed to delete data" },
      { status: 500 }
    )
  }
}
