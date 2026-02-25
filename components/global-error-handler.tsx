// ============================================
// GLOBAL ERROR HANDLER - App-wide error handling
// ============================================

"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { runMigrations, needsMigration } from "@/lib/store/migrations"
import { setupGlobalErrorHandlers, ErrorLogger } from "@/components/error-boundary"

export function GlobalErrorHandler({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false)
  const [migrationStatus, setMigrationStatus] = useState<{
    running: boolean
    error: string | null
  }>({ running: false, error: null })

  useEffect(() => {
    // Setup global error handlers
    setupGlobalErrorHandlers()

    // Run migrations on app start
    const init = async () => {
      if (needsMigration()) {
        setMigrationStatus({ running: true, error: null })
        
        try {
          const result = runMigrations()
          
          if (!result.success) {
            console.error('[Migration] Errors:', result.errors)
            toast.warning('Данные обновлены с предупреждениями', {
              description: 'Некоторые данные могли быть изменены',
            })
          } else {
            toast.success('Данные обновлены', {
              description: `Версия: ${result.migratedFrom} → ${result.migratedTo}`,
            })
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error)
          setMigrationStatus({ running: false, error: errorMsg })
          ErrorLogger.log(error instanceof Error ? error : new Error(errorMsg), {
            context: 'migration'
          })
        }
      }
      
      setIsReady(true)
    }

    init()
  }, [])

  // Handle storage errors
  useEffect(() => {
    const handleStorageError = (e: StorageEvent) => {
      if (e.key === null) {
        // Storage was cleared
        toast.error('Хранилище очищено', {
          description: 'Данные могли быть удалены другим приложением',
        })
      }
    }

    window.addEventListener('storage', handleStorageError)
    return () => window.removeEventListener('storage', handleStorageError)
  }, [])

  if (migrationStatus.error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">
            Ошибка обновления данных
          </h1>
          <p className="text-muted-foreground mb-6">
            {migrationStatus.error}
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => window.location.reload()}>
              Попробовать снова
            </Button>
            <Button variant="outline" onClick={() => {
              localStorage.clear()
              window.location.reload()
            }}>
              Сбросить данные
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">
            {migrationStatus.running ? 'Обновление данных...' : 'Загрузка...'}
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
