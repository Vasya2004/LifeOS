"use client"

import { useEffect, useState } from "react"
import { initIDB } from "@/lib/store/idb"

function StorageSkeleton() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Загрузка данных…</p>
      </div>
    </div>
  )
}

export function StorageProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    initIDB()
      .catch(() => {
        // IDB failed — idb.ts activates localStorage fallback automatically
      })
      .finally(() => {
        setReady(true)
      })
  }, [])

  if (!ready) return <StorageSkeleton />

  return <>{children}</>
}
