import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const KEEP_BACKUPS = 7 // keep last 7 backups per user

// GET /api/cron/backup — called daily by Vercel Cron
// Deletes old backups, keeping only the last KEEP_BACKUPS per user
export async function GET(req: NextRequest) {
  // Verify request comes from Vercel Cron
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  // Get all user IDs that have backups
  const { data: users, error: usersError } = await supabase
    .from("user_backups")
    .select("user_id")
    .order("user_id")

  if (usersError) {
    return NextResponse.json({ error: usersError.message }, { status: 500 })
  }

  const uniqueUsers = [...new Set((users || []).map((r) => r.user_id))]
  let deleted = 0

  for (const userId of uniqueUsers) {
    // Get all backup IDs for this user, oldest last
    const { data: backups } = await supabase
      .from("user_backups")
      .select("id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (!backups || backups.length <= KEEP_BACKUPS) continue

    const toDelete = backups.slice(KEEP_BACKUPS).map((b) => b.id)
    await supabase.from("user_backups").delete().in("id", toDelete)
    deleted += toDelete.length
  }

  return NextResponse.json({ ok: true, deleted })
}
