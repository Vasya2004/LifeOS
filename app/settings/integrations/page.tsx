"use client"

import { useEffect, useState, useCallback } from "react"
import { AppShell } from "@/components/app-shell"
import { IntegrationCard } from "@/components/integrations/integration-card"
import { integrationRegistry, type IntegrationState, type IntegrationType } from "@/lib/integrations/registry"
import { googleCalendarProvider } from "@/lib/integrations/google-calendar/provider"
import { appleHealthProvider } from "@/lib/integrations/apple-health/provider"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { useSearchParams } from "next/navigation"

// Register providers
integrationRegistry.register(googleCalendarProvider)
integrationRegistry.register(appleHealthProvider)

const PROVIDER_INFO: Record<IntegrationType, { name: string; description: string }> = {
  'google-calendar': {
    name: 'Google Calendar',
    description: 'Синхронизация задач с Google Calendar',
  },
  'apple-health': {
    name: 'Apple Health',
    description: 'Импорт данных здоровья из Apple Health',
  },
  'fitbit': {
    name: 'Fitbit',
    description: 'Синхронизация активности и сна',
  },
  'oura': {
    name: 'Oura Ring',
    description: 'Данные сна и восстановления',
  },
  'whoop': {
    name: 'WHOOP',
    description: 'Мониторинг нагрузки и восстановления',
  },
}

export default function IntegrationsPage() {
  const searchParams = useSearchParams()
  const [states, setStates] = useState<Map<IntegrationType, IntegrationState>>(new Map())
  const [isLoading, setIsLoading] = useState(true)

  // Handle OAuth callback results
  useEffect(() => {
    const success = searchParams.get('success')
    const error = searchParams.get('error')

    if (success === 'google_connected') {
      toast.success('Google Calendar подключен')
    } else if (error) {
      toast.error('Ошибка подключения: ' + error)
    }
  }, [searchParams])

  // Load integration states
  const loadStates = useCallback(async () => {
    const providers = integrationRegistry.getAll()
    const newStates = new Map<IntegrationType, IntegrationState>()

    for (const provider of providers) {
      const state = await integrationRegistry.getState(provider.id)
      newStates.set(provider.id, state)
    }

    setStates(newStates)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    loadStates()
  }, [loadStates])

  const handleConnect = async (type: IntegrationType) => {
    try {
      await integrationRegistry.get(type)?.connect()
      await loadStates()
    } catch (error) {
      toast.error('Ошибка подключения: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const handleDisconnect = async (type: IntegrationType) => {
    try {
      await integrationRegistry.disableIntegration(type)
      toast.success('Интеграция отключена')
      await loadStates()
    } catch (error) {
      toast.error('Ошибка отключения')
    }
  }

  const handleSync = async (type: IntegrationType) => {
    const toastId = toast.loading('Синхронизация...')
    
    try {
      const result = await integrationRegistry.syncIntegration(type)
      
      if (result.success) {
        toast.success(`Синхронизировано ${result.itemsSynced} элементов`, { id: toastId })
      } else {
        toast.error(result.errors[0] || 'Ошибка синхронизации', { id: toastId })
      }
      
      await loadStates()
    } catch (error) {
      toast.error('Ошибка синхронизации', { id: toastId })
    }
  }

  const providers = integrationRegistry.getAll()

  return (
    <AppShell>
      <div className="container max-w-4xl py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Интеграции</h1>
          <p className="text-muted-foreground mt-2">
            Подключите внешние сервисы для автоматической синхронизации данных
          </p>
        </div>

        {searchParams.get('error') && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>
              Ошибка подключения: {searchParams.get('error')}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))
          ) : (
            providers.map(provider => {
              const state = states.get(provider.id) || {
                type: provider.id,
                connected: false,
              }
              const info = PROVIDER_INFO[provider.id]

              return (
                <IntegrationCard
                  key={provider.id}
                  type={provider.id}
                  name={info?.name || provider.name}
                  description={info?.description || provider.description}
                  icon={provider.icon}
                  category={provider.category}
                  state={state}
                  onConnect={() => handleConnect(provider.id)}
                  onDisconnect={() => handleDisconnect(provider.id)}
                  onSync={() => handleSync(provider.id)}
                />
              )
            })
          )}
        </div>

        {/* Info section */}
        <div className="mt-12 p-6 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">О безопасности</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Все токены хранятся в зашифрованном виде</li>
            <li>• Данные передаются только по HTTPS</li>
            <li>• Вы можете отключить интеграцию в любой момент</li>
            <li>• Мы не передаём ваши данные третьим лицам</li>
          </ul>
        </div>
      </div>
    </AppShell>
  )
}
