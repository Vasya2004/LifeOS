'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react'
import Link from 'next/link'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-destructive" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Что-то пошло не так</h1>
          <p className="text-muted-foreground">
            Произошла ошибка при загрузке приложения. Мы уже работаем над исправлением.
          </p>
        </div>

        {error.message && (
          <div className="p-4 rounded-lg bg-muted text-sm text-left overflow-auto">
            <code className="text-destructive">{error.message}</code>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} className="gap-2">
            <RefreshCcw className="w-4 h-4" />
            Попробовать снова
          </Button>
          <Button variant="outline" asChild className="gap-2">
            <Link href="/">
              <Home className="w-4 h-4" />
              На главную
            </Link>
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Если ошибка повторяется, попробуйте{' '}
          <button 
            onClick={() => {
              localStorage.clear()
              window.location.reload()
            }}
            className="underline hover:text-foreground"
          >
            очистить данные
          </button>
        </p>
      </div>
    </div>
  )
}
