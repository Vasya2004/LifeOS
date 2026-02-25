// ============================================
// GOALS API - Server-side validation
// ============================================

import { NextRequest, NextResponse } from "next/server"
import { createGoalSchema, updateGoalSchema, goalFiltersSchema } from "@/lib/validators/goals"
import { createClient } from "@/lib/supabase/server"
import { checkRateLimit, rateLimitPresets } from "@/lib/api/rate-limit-middleware"
import { ZodError } from "zod"

// GET /api/goals
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse query params
    const { searchParams } = new URL(request.url)
    const filters = goalFiltersSchema.parse({
      status: searchParams.get("status") || undefined,
      areaId: searchParams.get("areaId") || undefined,
      priority: searchParams.get("priority") ? parseInt(searchParams.get("priority")!) : undefined,
      search: searchParams.get("search") || undefined,
    })

    // Build query
    let query = supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (filters.status) query = query.eq("status", filters.status)
    if (filters.areaId) query = query.eq("area_id", filters.areaId)
    if (filters.priority) query = query.eq("priority", filters.priority)
    if (filters.search) query = query.ilike("title", `%${filters.search}%`)

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }
    console.error("GET /api/goals error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/goals
export async function POST(request: NextRequest) {
  const rateLimitResult = await checkRateLimit(request, rateLimitPresets.api)
  if (!rateLimitResult.allowed) {
    return rateLimitResult.response!
  }
  
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validated = createGoalSchema.parse(body)

    const { data, error } = await supabase
      .from("goals")
      .insert({
        user_id: user.id,
        title: validated.title,
        description: validated.description,
        area_id: validated.areaId,
        type: validated.type,
        status: validated.status,
        priority: validated.priority,
        target_date: validated.targetDate,
        started_at: validated.startedAt,
        progress: validated.progress,
        milestones: validated.milestones,
        related_values: validated.relatedValues,
        related_roles: validated.relatedRoles,
      })
      .select()
      .single()

    if (error) throw error

    const response = NextResponse.json({ data }, { status: 201 })
    
    // Add rate limit headers
    Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    
    return response
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }
    console.error("POST /api/goals error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PATCH /api/goals
export async function PATCH(request: NextRequest) {
  const rateLimitResult = await checkRateLimit(request, rateLimitPresets.api)
  if (!rateLimitResult.allowed) {
    return rateLimitResult.response!
  }
  
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updates } = updateGoalSchema.parse(body)

    // Verify ownership
    const { data: existing } = await supabase
      .from("goals")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 })
    }

    const { data, error } = await supabase
      .from("goals")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    const response = NextResponse.json({ data })
    
    // Add rate limit headers
    Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    
    return response
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }
    console.error("PATCH /api/goals error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/goals?id=xxx
export async function DELETE(request: NextRequest) {
  const rateLimitResult = await checkRateLimit(request, rateLimitPresets.api)
  if (!rateLimitResult.allowed) {
    return rateLimitResult.response!
  }
  
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    // Verify ownership
    const { data: existing } = await supabase
      .from("goals")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 })
    }

    const { error } = await supabase
      .from("goals")
      .delete()
      .eq("id", id)

    if (error) throw error

    const response = NextResponse.json({ success: true })
    
    // Add rate limit headers
    Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    
    return response
  } catch (error) {
    console.error("DELETE /api/goals error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
