// ============================================
// SYNC API V2 - Server-side sync endpoint
// ============================================

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// POST - Push changes to server
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { changes, lastSync } = body

    if (!changes || !Array.isArray(changes)) {
      return NextResponse.json({ error: "Invalid changes format" }, { status: 400 })
    }

    const results = []
    const errors = []

    for (const change of changes) {
      const { table, operation, data } = change

      try {
        let result

        switch (operation) {
          case "create":
            result = await supabase
              .from(table)
              .insert({ ...data, user_id: user.id })
              .select()
            break

          case "update":
            result = await supabase
              .from(table)
              .update(data)
              .eq("id", data.id)
              .eq("user_id", user.id)
              .select()
            break

          case "delete":
            result = await supabase
              .from(table)
              .delete()
              .eq("id", data.id)
              .eq("user_id", user.id)
            break

          default:
            errors.push({ table, operation, error: "Unknown operation" })
            continue
        }

        if (result.error) {
          errors.push({ table, operation, error: result.error.message })
        } else {
          results.push({ table, operation, success: true })
        }
      } catch (error) {
        errors.push({ 
          table, 
          operation, 
          error: error instanceof Error ? error.message : "Unknown error" 
        })
      }
    }

    return NextResponse.json({
      success: errors.length === 0,
      processed: results.length,
      errors: errors.length > 0 ? errors : undefined,
      serverTime: new Date().toISOString(),
    })

  } catch (error) {
    console.error("Sync API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// GET - Pull changes from server
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const since = searchParams.get("since")
    const tables = searchParams.get("tables")?.split(",") || []

    const results: Record<string, unknown[]> = {}

    // Default tables if not specified
    const tablesToSync = tables.length > 0 
      ? tables 
      : [
          "goals", "tasks", "habits", "projects",
          "accounts", "transactions", "financial_goals",
          "skills", "health_metrics", "user_stats"
        ]

    for (const table of tablesToSync) {
      let query = supabase
        .from(table)
        .select("*")
        .eq("user_id", user.id)

      if (since) {
        query = query.gt("updated_at", since)
      }

      const { data, error } = await query

      if (error) {
        console.error(`Error fetching ${table}:`, error)
        continue
      }

      results[table] = data || []
    }

    return NextResponse.json({
      data: results,
      serverTime: new Date().toISOString(),
    })

  } catch (error) {
    console.error("Sync API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE - Clear user data
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const tables = [
      "goals", "tasks", "habits", "projects",
      "accounts", "transactions", "financial_goals",
      "skills", "health_metrics", "daily_reviews",
      "weekly_reviews", "journal_entries"
    ]

    for (const table of tables) {
      await supabase.from(table).delete().eq("user_id", user.id)
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("Clear data error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
