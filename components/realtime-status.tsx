// ============================================
// REALTIME STATUS COMPONENT
// ============================================

"use client"

import { useRealtimeStatus } from "@/hooks/realtime"
import { Wifi, WifiOff, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface RealtimeStatusProps {
  className?: string
  showLabel?: boolean
}

export function RealtimeStatus({ className, showLabel = false }: RealtimeStatusProps) {
  const { status, activeChannels, isConnected } = useRealtimeStatus()

  return (
    <div
      className={cn(
        "flex items-center gap-2 text-xs",
        isConnected ? "text-green-500" : "text-muted-foreground",
        className
      )}
    >
      {status === "connecting" ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : isConnected ? (
        <Wifi className="h-3 w-3" />
      ) : (
        <WifiOff className="h-3 w-3" />
      )}
      
      {showLabel && (
        <span>
          {status === "connecting"
            ? "Connecting..."
            : isConnected
            ? `Live (${activeChannels})`
            : "Offline"}
        </span>
      )}
    </div>
  )
}
