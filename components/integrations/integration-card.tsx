"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Calendar, Heart, Activity, RefreshCw, Check, AlertCircle } from "lucide-react"
import type { IntegrationType, IntegrationState } from "@/lib/integrations/registry"
import { cn } from "@/lib/utils"

interface IntegrationCardProps {
  type: IntegrationType
  name: string
  description: string
  icon: string
  category: 'calendar' | 'health' | 'fitness'
  state: IntegrationState
  onConnect: () => Promise<void>
  onDisconnect: () => Promise<void>
  onSync: () => Promise<void>
}

const ICONS: Record<string, typeof Calendar> = {
  calendar: Calendar,
  heart: Heart,
  activity: Activity,
}

const CATEGORIES: Record<string, { label: string; color: string }> = {
  calendar: { label: 'Календарь', color: 'bg-[#8b5cf6]/10 text-[#8b5cf6]' },
  health: { label: 'Здоровье', color: 'bg-red-500/10 text-red-500' },
  fitness: { label: 'Фитнес', color: 'bg-green-500/10 text-green-500' },
}

export function IntegrationCard({
  name,
  description,
  icon,
  category,
  state,
  onConnect,
  onDisconnect,
  onSync,
}: IntegrationCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  const Icon = ICONS[icon] || Activity
  const categoryInfo = CATEGORIES[category]

  const handleConnect = async () => {
    setIsLoading(true)
    try {
      await onConnect()
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisconnect = async () => {
    setIsLoading(true)
    try {
      await onDisconnect()
    } finally {
      setIsLoading(false)
    }
  }

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      await onSync()
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <Card className={cn(
      "transition-colors",
      state.connected && "border-green-500/30"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", categoryInfo.color)}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base">{name}</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                {description}
              </CardDescription>
            </div>
          </div>
          <Badge variant={state.connected ? "default" : "secondary"} className="text-xs">
            {state.connected ? (
              <><Check className="h-3 w-3 mr-1" /> Подключено</>
            ) : (
              'Не подключено'
            )}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {categoryInfo.label}
            </Badge>
            {state.lastSync && (
              <span className="text-xs text-muted-foreground">
                Синхронизировано: {new Date(state.lastSync).toLocaleDateString()}
              </span>
            )}
            {state.error && (
              <Badge variant="destructive" className="text-xs gap-1">
                <AlertCircle className="h-3 w-3" />
                Ошибка
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            {state.connected ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSync}
                  disabled={isSyncing}
                >
                  <RefreshCw className={cn("h-4 w-4 mr-1", isSyncing && "animate-spin")} />
                  Синхронизировать
                </Button>
                <Switch
                  checked={true}
                  onCheckedChange={handleDisconnect}
                  disabled={isLoading}
                />
              </>
            ) : (
              <Button
                size="sm"
                onClick={handleConnect}
                disabled={isLoading}
              >
                Подключить
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
