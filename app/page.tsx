import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { AppShell } from "@/components/app-shell"
import DashboardContent from "./dashboard-content"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const cookieStore = await cookies()
  const isGuestMode = cookieStore.get('lifeos_guest_mode')?.value === 'true'

  if (!user && !isGuestMode) {
    redirect("/auth/login")
  }

  return (
    <AppShell>
      <DashboardContent />
    </AppShell>
  )
}
