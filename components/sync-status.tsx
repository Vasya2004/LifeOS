"use client"

import { Cloud, CloudOff, Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSync } from "@/components/sync-provider"
import { cn } from "@/lib/utils"

export function SyncStatus() {
  const { syncState, forceSync } = useSync()

  if (!syncState.isOnline) {
    return (
      <div className="flex items-center justify-between px-2 py-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <CloudOff className="size-4" />
          <span>Оффлайн режим</span>
        </div>
      </div>
    )
  }

  if (syncState.isSyncing) {
    return (
      <div className="flex items-center justify-between px-2 py-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Loader2 className="size-4 animate-spin" />
          <span>Синхронизация...</span>
        </div>
      </div>
    )
  }

  if (syncState.pendingChanges) {
    return (
      <div className="flex items-center justify-between px-2 py-2">
        <div className="flex items-center gap-2 text-xs text-warning">
          <Cloud className="size-4" />
          <span>Изменения не сохранены</span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="size-6"
          onClick={forceSync}
        >
          <RefreshCw className="size-3" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between px-2 py-2 text-xs text-muted-foreground">
      <div className="flex items-center gap-2">
        <Cloud className={cn("size-4", syncState.lastSync && "text-success")} />
        <span>
          {syncState.lastSync 
            ? `Синхронизировано ${new Date(syncState.lastSync).toLocaleTimeString()}`
            : "Синхронизировано"
          }
        </span>
      </div>
    </div>
  )
}
