// ============================================
// SKILLS API - Server-side CRUD with validation
// ============================================

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { checkRateLimit, rateLimitPresets } from "@/lib/api/rate-limit-middleware"
import { ZodError } from "zod"
import {
  createSkillSchema,
  updateSkillSchema,
  addSkillActivitySchema,
  skillFiltersSchema,
  type CreateSkillInput,
  type UpdateSkillInput,
} from "@/lib/validators/skills"
import { calculateXpNeeded } from "@/lib/types"

// GET /api/skills
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse filters
    const { searchParams } = new URL(request.url)
    const filters = skillFiltersSchema.parse({
      category: searchParams.get("category") || undefined,
      minLevel: searchParams.get("minLevel") ? parseInt(searchParams.get("minLevel")!) : undefined,
      maxLevel: searchParams.get("maxLevel") ? parseInt(searchParams.get("maxLevel")!) : undefined,
      isDecaying: searchParams.get("isDecaying") === "true" ? true : undefined,
    })

    let query = supabase
      .from("skills")
      .select("*")
      .eq("user_id", user.id)
      .order("current_level", { ascending: false })

    if (filters.category) query = query.eq("category", filters.category)
    if (filters.minLevel !== undefined) query = query.gte("current_level", filters.minLevel)
    if (filters.maxLevel !== undefined) query = query.lte("current_level", filters.maxLevel)
    if (filters.isDecaying !== undefined) query = query.eq("is_decaying", filters.isDecaying)

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ data: data || [] })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid filters", details: error.errors }, { status: 400 })
    }
    console.error("GET /api/skills error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/skills
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
    const validated: CreateSkillInput = createSkillSchema.parse(body)

    const { data, error } = await supabase
      .from("skills")
      .insert({
        user_id: user.id,
        name: validated.name,
        description: validated.description,
        icon: validated.icon,
        color: validated.color,
        category: validated.category,
        current_level: 1,
        current_xp: 0,
        xp_needed: calculateXpNeeded(1),
        total_xp_earned: 0,
        last_activity_date: new Date().toISOString().split("T")[0],
        activities: [],
        certificates: [],
        decay_logs: [],
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
    console.error("POST /api/skills error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PATCH /api/skills
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // Check if it's an add activity action
    if (body.action === "addActivity") {
      const { skillId, description, xpAmount, activityType, proofUrl, proofRequired } = addSkillActivitySchema.parse(body)

      // Get current skill
      const { data: skill } = await supabase
        .from("skills")
        .select("*")
        .eq("id", skillId)
        .eq("user_id", user.id)
        .single()

      if (!skill) {
        return NextResponse.json({ error: "Skill not found" }, { status: 404 })
      }

      // Create activity record
      const newActivity = {
        id: crypto.randomUUID(),
        skill_id: skillId,
        description,
        xp_amount: xpAmount,
        activity_type: activityType,
        proof_url: proofUrl,
        proof_required: proofRequired,
        created_at: new Date().toISOString(),
      }

      // Calculate XP with multiplier
      const multipliers: Record<string, number> = { theory: 1, practice: 2, result: 3 }
      const xpGained = xpAmount * (multipliers[activityType] || 1)

      // Calculate new level
      let newXp = skill.current_xp + xpGained
      let newLevel = skill.current_level
      let newXpNeeded = skill.xp_needed
      let leveledUp = false

      while (newXp >= newXpNeeded) {
        newXp -= newXpNeeded
        newLevel++
        newXpNeeded = calculateXpNeeded(newLevel)
        leveledUp = true
      }

      // Check for certificate
      const certificates = [...(skill.certificates || [])]
      if (leveledUp && (newLevel === 5 || newLevel >= 10)) {
        certificates.push({
          id: crypto.randomUUID(),
          skill_id: skillId,
          level_achieved: newLevel,
          issued_at: new Date().toISOString(),
        })
      }

      const activities = [...(skill.activities || []), newActivity]

      const { data, error } = await supabase
        .from("skills")
        .update({
          current_level: newLevel,
          current_xp: newXp,
          xp_needed: newXpNeeded,
          total_xp_earned: skill.total_xp_earned + xpGained,
          last_activity_date: new Date().toISOString().split("T")[0],
          is_decaying: false,
          activities,
          certificates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", skillId)
        .eq("user_id", user.id)
        .select()
        .single()

      if (error) throw error

      return NextResponse.json({ 
        data, 
        meta: { leveledUp, newLevel: leveledUp ? newLevel : undefined }
      })
    }

    // Regular update
    const { id, ...updates }: UpdateSkillInput & { id: string } = updateSkillSchema.parse(body)

    const { data: existing } = await supabase
      .from("skills")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 })
    }

    const dbUpdates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }
    if (updates.name !== undefined) dbUpdates.name = updates.name
    if (updates.description !== undefined) dbUpdates.description = updates.description
    if (updates.icon !== undefined) dbUpdates.icon = updates.icon
    if (updates.color !== undefined) dbUpdates.color = updates.color
    if (updates.category !== undefined) dbUpdates.category = updates.category

    const { data, error } = await supabase
      .from("skills")
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
    console.error("PATCH /api/skills error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/skills?id=xxx
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
      .from("skills")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 })
    }

    const { error } = await supabase
      .from("skills")
      .delete()
      .eq("id", id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/skills error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
