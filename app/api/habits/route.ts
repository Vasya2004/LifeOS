// ============================================
// HABITS API - Server-side CRUD with validation
// ============================================

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { checkRateLimit, rateLimitPresets } from "@/lib/api/rate-limit-middleware"
import { ZodError } from "zod"
import {
  createHabitSchema,
  updateHabitSchema,
  toggleHabitEntrySchema,
  habitFiltersSchema,
  type CreateHabitInput,
  type UpdateHabitInput,
} from "@/lib/validators/habits"

// GET /api/habits
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse filters
    const { searchParams } = new URL(request.url)
    const filters = habitFiltersSchema.parse({
      areaId: searchParams.get("areaId") || undefined,
      frequency: searchParams.get("frequency") || undefined,
      active: searchParams.get("active") === "true" ? true : 
              searchParams.get("active") === "false" ? false : undefined,
    })

    let query = supabase
      .from("habits")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (filters.areaId) query = query.eq("area_id", filters.areaId)
    if (filters.frequency) query = query.eq("frequency", filters.frequency)
    if (filters.active !== undefined) query = query.eq("is_active", filters.active)

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ data: data || [] })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid filters", details: error.errors }, { status: 400 })
    }
    console.error("GET /api/habits error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/habits
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const { allowed, response: rateLimitResponse, headers } = await checkRateLimit(request, rateLimitPresets.api)
    if (!allowed) return rateLimitResponse!
    
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validated: CreateHabitInput = createHabitSchema.parse(body)

    const { data, error } = await supabase
      .from("habits")
      .insert({
        user_id: user.id,
        area_id: validated.areaId,
        title: validated.title,
        description: validated.description,
        frequency: validated.frequency,
        target_days: validated.targetDays,
        target_count: validated.targetCount,
        energy_impact: validated.energyImpact,
        energy_type: validated.energyType,
        xp_reward: validated.xpReward,
      })
      .select()
      .single()

    if (error) throw error

    const response = NextResponse.json({ data }, { status: 201 })
    
    // Add rate limit headers
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    
    return response
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }
    console.error("POST /api/habits error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PATCH /api/habits
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // Check if it's a toggle entry action
    if (body.action === "toggle") {
      const { habitId, date, completed, note } = toggleHabitEntrySchema.parse(body)

      // Get current habit
      const { data: habit } = await supabase
        .from("habits")
        .select("entries, streak, best_streak, total_completions")
        .eq("id", habitId)
        .eq("user_id", user.id)
        .single()

      if (!habit) {
        return NextResponse.json({ error: "Habit not found" }, { status: 404 })
      }

      // Update entries
      const entries = [...(habit.entries || [])]
      const existingIndex = entries.findIndex((e: { date: string }) => e.date === date)

      if (existingIndex >= 0) {
        entries[existingIndex] = { date, completed, note }
      } else {
        entries.push({ date, completed, note })
      }

      // Calculate new streak
      const completedEntries = entries.filter((e: { completed: boolean }) => e.completed)
      const sortedDates = completedEntries
        .map((e: { date: string }) => e.date)
        .sort()
        .reverse()

      let streak = 0
      if (sortedDates.length > 0) {
        streak = 1
        for (let i = 1; i < sortedDates.length; i++) {
          const prev = new Date(sortedDates[i - 1])
          const curr = new Date(sortedDates[i])
          const diff = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24)
          if (diff === 1) streak++
          else break
        }
      }

      const bestStreak = Math.max(habit.best_streak || 0, streak)
      const totalCompletions = completedEntries.length

      const { data, error } = await supabase
        .from("habits")
        .update({
          entries,
          streak,
          best_streak: bestStreak,
          total_completions: totalCompletions,
          updated_at: new Date().toISOString(),
        })
        .eq("id", habitId)
        .eq("user_id", user.id)
        .select()
        .single()

      if (error) throw error

      return NextResponse.json({ data })
    }

    // Regular update
    const { id, ...updates }: UpdateHabitInput & { id: string } = updateHabitSchema.parse(body)

    const { data: existing } = await supabase
      .from("habits")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 })
    }

    const dbUpdates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }
    if (updates.areaId !== undefined) dbUpdates.area_id = updates.areaId
    if (updates.title !== undefined) dbUpdates.title = updates.title
    if (updates.description !== undefined) dbUpdates.description = updates.description
    if (updates.frequency !== undefined) dbUpdates.frequency = updates.frequency
    if (updates.targetDays !== undefined) dbUpdates.target_days = updates.targetDays
    if (updates.targetCount !== undefined) dbUpdates.target_count = updates.targetCount
    if (updates.energyImpact !== undefined) dbUpdates.energy_impact = updates.energyImpact
    if (updates.energyType !== undefined) dbUpdates.energy_type = updates.energyType
    if (updates.xpReward !== undefined) dbUpdates.xp_reward = updates.xpReward

    const { data, error } = await supabase
      .from("habits")
      .update(dbUpdates)
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }
    console.error("PATCH /api/habits error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/habits?id=xxx
export async function DELETE(request: NextRequest) {
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
      .from("habits")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 })
    }

    const { error } = await supabase
      .from("habits")
      .delete()
      .eq("id", id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/habits error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
