"use client"

import { useSync } from "./sync-provider-v2"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Cloud, CloudOff, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

export function SyncStatusV2() {
  const { status, pendingCount } = useSync()

  const getStatusIcon = () => {
    switch (status) {
      case 'syncing':
        return <RefreshCw className="h-3.5 w-3.5 animate-spin" />
      case 'offline':
        return <CloudOff className="h-3.5 w-3.5" />
      case 'conflict':
        return <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />
      default:
        return <Cloud className="h-3.5 w-3.5" />
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'syncing':
        return "Синхронизация..."
      case 'offline':
        return "Нет сети"
      case 'conflict':
        return "Конфликты данных"
      default:
        return "Синхронизировано"
    }
  }

  return (
    <div className="flex items-center gap-2 px-2 py-1.5 rounded-md">
      <div className={cn(
        "flex items-center gap-1.5 text-xs min-w-0 flex-1",
        status === 'offline' && "text-yellow-500",
        (status === 'idle' || status === 'error') && "text-green-500",
      )}>
        {getStatusIcon()}
        <span className="truncate">{getStatusText()}</span>
      </div>

      {pendingCount > 0 && (
        <Badge variant="secondary" className="text-[10px] h-4 px-1 shrink-0">
          {pendingCount}
        </Badge>
      )}
    </div>
  )
}

// Compact version for sidebar
export function SyncStatusCompact() {
  const { status, pendingCount, isOnline } = useSync()

  return (
    <div className="flex items-center gap-2">
      <div className={cn(
        "w-2 h-2 rounded-full",
        status === 'syncing' && "bg-[#8b5cf6] animate-pulse",
        status === 'offline' && "bg-yellow-500",
        status === 'error' && "bg-red-500",
        status === 'conflict' && "bg-orange-500",
        status === 'idle' && "bg-green-500"
      )} />
      
      {!isOnline && (
        <span className="text-xs text-muted-foreground">Нет сети</span>
      )}
      
      {pendingCount > 0 && isOnline && (
        <span className="text-xs text-muted-foreground">
          {pendingCount} изменений
        </span>
      )}
    </div>
  )
}
