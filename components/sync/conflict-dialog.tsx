"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertTriangle, Check, GitMerge, Laptop, Cloud } from "lucide-react"
import type { Conflict, ConflictResolution, VersionedEntity } from "@/lib/sync/conflict-resolver"
import { cn } from "@/lib/utils"

interface ConflictDialogProps {
  conflicts: Conflict<Record<string, unknown>>[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onResolve: (resolutions: Map<string, ConflictResolution>) => void
  onResolveAll: (strategy: ConflictResolution) => void
}

export function ConflictDialog({
  conflicts,
  open,
  onOpenChange,
  onResolve,
  onResolveAll,
}: ConflictDialogProps) {
  const [resolutions, setResolutions] = useState<Map<string, ConflictResolution>>(new Map())
  const [activeConflict, setActiveConflict] = useState<string>(conflicts[0]?.entityId || "")

  const handleResolve = (entityId: string, resolution: ConflictResolution) => {
    const newResolutions = new Map(resolutions)
    newResolutions.set(entityId, resolution)
    setResolutions(newResolutions)
  }

  const handleConfirm = () => {
    onResolve(resolutions)
    setResolutions(new Map())
  }

  const currentConflict = conflicts.find(c => c.entityId === activeConflict)
  const resolvedCount = resolutions.size
  const totalCount = conflicts.length

  if (conflicts.length === 0) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Конфликты синхронизации
          </DialogTitle>
          <DialogDescription>
            Обнаружено {totalCount} конфликтов между локальными и серверными данными.
            Выберите, какие изменения сохранить.
          </DialogDescription>
        </DialogHeader>

        {/* Batch actions */}
        <div className="flex items-center gap-2 py-2 border-b">
          <span className="text-sm text-muted-foreground">Применить ко всем:</span>
          <Button size="sm" variant="outline" onClick={() => onResolveAll('local-wins')}>
            <Laptop className="h-4 w-4 mr-1" />
            Локальные
          </Button>
          <Button size="sm" variant="outline" onClick={() => onResolveAll('remote-wins')}>
            <Cloud className="h-4 w-4 mr-1" />
            Серверные
          </Button>
          <Button size="sm" variant="outline" onClick={() => onResolveAll('merge')}>
            <GitMerge className="h-4 w-4 mr-1" />
            Объединить
          </Button>
        </div>

        <div className="grid grid-cols-[200px_1fr] gap-4 h-[400px]">
          {/* Conflict list */}
          <ScrollArea className="border rounded-md">
            <div className="p-2 space-y-1">
              {conflicts.map(conflict => {
                const isResolved = resolutions.has(conflict.entityId)
                const isActive = conflict.entityId === activeConflict

                return (
                  <button
                    key={conflict.entityId}
                    onClick={() => setActiveConflict(conflict.entityId)}
                    className={cn(
                      "w-full text-left p-2 rounded-md text-sm transition-colors",
                      isActive && "bg-accent",
                      !isActive && "hover:bg-accent/50",
                      isResolved && "border-l-2 border-green-500"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {isResolved && <Check className="h-3 w-3 text-green-500" />}
                      <span className="truncate font-medium">
                        {(conflict.local.data as { title?: string }).title || conflict.entityId}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {isResolved
                        ? `Решение: ${getResolutionLabel(resolutions.get(conflict.entityId)!)}}`
                        : `Конфликт: ${conflict.type}`
                      }
                    </div>
                  </button>
                )
              })}
            </div>
          </ScrollArea>

          {/* Conflict details */}
          <div className="border rounded-md overflow-hidden">
            {currentConflict ? (
              <Tabs defaultValue="diff" className="h-full flex flex-col">
                <TabsList className="mx-4 mt-4">
                  <TabsTrigger value="diff">Различия</TabsTrigger>
                  <TabsTrigger value="local">Локальная</TabsTrigger>
                  <TabsTrigger value="remote">Серверная</TabsTrigger>
                </TabsList>

                <TabsContent value="diff" className="flex-1 p-4 m-0">
                  <DiffView local={currentConflict.local} remote={currentConflict.remote} />
                </TabsContent>

                <TabsContent value="local" className="flex-1 p-4 m-0">
                  <DataView data={currentConflict.local} label="Локальная версия" icon={Laptop} />
                </TabsContent>

                <TabsContent value="remote" className="flex-1 p-4 m-0">
                  <DataView data={currentConflict.remote} label="Серверная версия" icon={Cloud} />
                </TabsContent>

                {/* Resolution buttons */}
                <div className="p-4 border-t flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Решено: {resolvedCount} / {totalCount}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={resolutions.get(currentConflict.entityId) === 'local-wins' ? 'default' : 'outline'}
                      onClick={() => handleResolve(currentConflict.entityId, 'local-wins')}
                    >
                      <Laptop className="h-4 w-4 mr-1" />
                      Локальная
                    </Button>
                    <Button
                      size="sm"
                      variant={resolutions.get(currentConflict.entityId) === 'remote-wins' ? 'default' : 'outline'}
                      onClick={() => handleResolve(currentConflict.entityId, 'remote-wins')}
                    >
                      <Cloud className="h-4 w-4 mr-1" />
                      Серверная
                    </Button>
                    <Button
                      size="sm"
                      variant={resolutions.get(currentConflict.entityId) === 'merge' ? 'default' : 'outline'}
                      onClick={() => handleResolve(currentConflict.entityId, 'merge')}
                    >
                      <GitMerge className="h-4 w-4 mr-1" />
                      Объединить
                    </Button>
                  </div>
                </div>
              </Tabs>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Выберите конфликт для просмотра
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={handleConfirm} disabled={resolvedCount < totalCount}>
            Применить ({resolvedCount}/{totalCount})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function getResolutionLabel(resolution: ConflictResolution): string {
  switch (resolution) {
    case 'local-wins': return 'Локальная'
    case 'remote-wins': return 'Серверная'
    case 'merge': return 'Объединение'
    default: return 'Вручную'
  }
}

function DiffView({
  local,
  remote,
}: {
  local: VersionedEntity<Record<string, unknown>>
  remote: VersionedEntity<Record<string, unknown>>
}) {
  const allKeys = new Set([...Object.keys(local.data), ...Object.keys(remote.data)])

  return (
    <ScrollArea className="h-full">
      <div className="space-y-2">
        {Array.from(allKeys).map(key => {
          const localVal = local.data[key]
          const remoteVal = remote.data[key]
          const isDifferent = JSON.stringify(localVal) !== JSON.stringify(remoteVal)

          if (!isDifferent) {
            return (
              <div key={key} className="p-2 bg-muted rounded text-sm">
                <span className="font-medium">{key}:</span>{' '}
                <span className="text-muted-foreground">{formatValue(localVal)}</span>
              </div>
            )
          }

          return (
            <div key={key} className="grid grid-cols-2 gap-2">
              <div className="p-2 bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 rounded text-sm">
                <Badge variant="outline" className="mb-1 text-xs">Локальное</Badge>
                <div className="font-medium">{key}:</div>
                <div className="text-muted-foreground">{formatValue(localVal)}</div>
              </div>
              <div className="p-2 bg-green-500/10 border border-green-500/20 rounded text-sm">
                <Badge variant="outline" className="mb-1 text-xs">Серверное</Badge>
                <div className="font-medium">{key}:</div>
                <div className="text-muted-foreground">{formatValue(remoteVal)}</div>
              </div>
            </div>
          )
        })}
      </div>
    </ScrollArea>
  )
}

function DataView({
  data,
  label,
  icon: Icon,
}: {
  data: VersionedEntity<Record<string, unknown>>
  label: string
  icon: typeof Laptop
}) {
  return (
    <ScrollArea className="h-full">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Icon className="h-4 w-4" />
          {label}
          <Badge variant="outline">v{data._version}</Badge>
        </div>
        <div className="space-y-2">
          {Object.entries(data.data).map(([key, value]) => (
            <div key={key} className="p-2 bg-muted rounded text-sm">
              <span className="font-medium">{key}:</span>{' '}
              <span className="text-muted-foreground">{formatValue(value)}</span>
            </div>
          ))}
        </div>
        <div className="text-xs text-muted-foreground pt-2 border-t">
          <div>Устройство: {data._deviceId.slice(0, 8)}...</div>
          <div>Изменено: {new Date(data._modifiedAt).toLocaleString()}</div>
        </div>
      </div>
    </ScrollArea>
  )
}

function formatValue(value: unknown): string {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  if (typeof value === 'string') return value
  if (typeof value === 'number') return value.toString()
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (Array.isArray(value)) return `[${value.length} items]`
  if (typeof value === 'object') return '{...}'
  return String(value)
}
