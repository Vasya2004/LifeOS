// ============================================
// AUTH INITIALIZER - Initialize auth tracking on app load
// ============================================

"use client"

import { useEffect } from "react"
import { initAuthTracking } from "@/lib/store/modules/auth"

export function AuthInitializer() {
  useEffect(() => {
    // Initialize auth tracking for store modules
    initAuthTracking()
  }, [])

  return null
}
