// ============================================
// TASKS API - Server-side validation
// ============================================

import { NextRequest, NextResponse } from "next/server"
import { createTaskSchema, updateTaskSchema, completeTaskSchema, taskFiltersSchema } from "@/lib/validators/tasks"
import { createClient } from "@/lib/supabase/server"
import { checkRateLimit, rateLimitPresets } from "@/lib/api/rate-limit-middleware"
import { ZodError } from "zod"

// GET /api/tasks
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const filters = taskFiltersSchema.parse({
      status: searchParams.get("status") || undefined,
      priority: searchParams.get("priority") || undefined,
      dateFrom: searchParams.get("dateFrom") || undefined,
      dateTo: searchParams.get("dateTo") || undefined,
      projectId: searchParams.get("projectId") || undefined,
      search: searchParams.get("search") || undefined,
    })

    let query = supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .order("scheduled_date", { ascending: true })

    if (filters.status) query = query.eq("status", filters.status)
    if (filters.priority) query = query.eq("priority", filters.priority)
    if (filters.projectId) query = query.eq("project_id", filters.projectId)
    if (filters.dateFrom) query = query.gte("scheduled_date", filters.dateFrom)
    if (filters.dateTo) query = query.lte("scheduled_date", filters.dateTo)
    if (filters.search) query = query.ilike("title", `%${filters.search}%`)

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }
    console.error("GET /api/tasks error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/tasks
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
    const validated = createTaskSchema.parse(body)

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        user_id: user.id,
        project_id: validated.projectId,
        title: validated.title,
        description: validated.description,
        scheduled_date: validated.scheduledDate,
        scheduled_time: validated.scheduledTime,
        duration: validated.duration,
        status: validated.status,
        priority: validated.priority,
        energy_cost: validated.energyCost,
        energy_type: validated.energyType,
        notes: validated.notes,
      })
      .select()
      .single()

    if (error) throw error

    const response = NextResponse.json({ data }, { status: 201 })
    
    Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    
    return response
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }
    console.error("POST /api/tasks error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PATCH /api/tasks
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
    
    // Check if it's a complete action or regular update
    if (body.action === "complete") {
      const { id, actualDuration, notes } = completeTaskSchema.parse(body)
      
      const { data: existing } = await supabase
        .from("tasks")
        .select("id, status")
        .eq("id", id)
        .eq("user_id", user.id)
        .single()

      if (!existing) {
        return NextResponse.json({ error: "Task not found" }, { status: 404 })
      }

      if (existing.status === "completed") {
        return NextResponse.json({ error: "Task already completed" }, { status: 400 })
      }

      const { data, error } = await supabase
        .from("tasks")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          actual_duration: actualDuration,
          notes: notes,
        })
        .eq("id", id)
        .select()
        .single()

      if (error) throw error

      // Update user stats
      await supabase.rpc("increment_task_completed", { user_id: user.id })

      const response = NextResponse.json({ data })
      Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
        response.headers.set(key, value)
      })
      return response
    }

    // Regular update
    const { id, ...updates } = updateTaskSchema.parse(body)

    const { data: existing } = await supabase
      .from("tasks")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    const { data, error } = await supabase
      .from("tasks")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    const response = NextResponse.json({ data })
    Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    return response
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }
    console.error("PATCH /api/tasks error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/tasks?id=xxx
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

    const { data: existing } = await supabase
      .from("tasks")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", id)

    if (error) throw error

    const response = NextResponse.json({ success: true })
    Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    return response
  } catch (error) {
    console.error("DELETE /api/tasks error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
