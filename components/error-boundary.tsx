// ============================================
// ERROR BOUNDARY - Catch React rendering errors
// ============================================

"use client"

import React, { Component, ErrorInfo, ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react"
import { clearAllData } from "@/lib/store"

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary] Uncaught error:", error, errorInfo)
    
    this.setState({ errorInfo })
    
    // Send to error reporting service
    this.reportError(error, errorInfo)
    
    // Call optional callback
    this.props.onError?.(error, errorInfo)
  }

  private reportError(error: Error, errorInfo: ErrorInfo) {
    // In production, send to Sentry/Datadog/etc
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { extra: errorInfo })
      console.error('[Error Report]', {
        error: error.toString(),
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      })
    }
  }

  private handleReload = () => {
    window.location.reload()
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  private handleClearData = () => {
    if (confirm('Это удалит все ваши данные. Вы уверены?')) {
      clearAllData()
      window.location.href = '/'
    }
  }

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="max-w-lg w-full">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <AlertTriangle className="size-8 text-destructive" />
              </div>
              <CardTitle className="text-xl">Что-то пошло не так</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-center">
                Произошла непредвиденная ошибка. Мы уже работаем над её исправлением.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-muted p-4 rounded-lg overflow-auto max-h-48">
                  <p className="font-mono text-xs text-destructive font-medium">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <pre className="font-mono text-xs text-muted-foreground mt-2">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              )}
              
              <div className="flex flex-col gap-2">
                <Button onClick={this.handleReload} className="w-full">
                  <RefreshCw className="mr-2 size-4" />
                  Перезагрузить страницу
                </Button>
                
                <Button variant="outline" onClick={this.handleReset} className="w-full">
                  <Bug className="mr-2 size-4" />
                  Попробовать снова
                </Button>
                
                <Button variant="ghost" onClick={() => window.location.href = '/'} className="w-full">
                  <Home className="mr-2 size-4" />
                  На главную
                </Button>
                
                <hr className="my-2" />
                
                <Button 
                  variant="destructive" 
                  onClick={this.handleClearData} 
                  className="w-full"
                >
                  Сбросить данные (крайняя мера)
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground text-center">
                Если проблема повторяется, пожалуйста, свяжитесь с поддержкой.
              </p>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// ============================================
// Module-Specific Error Boundary
// ============================================

interface ModuleErrorBoundaryProps {
  children: ReactNode
  moduleName: string
}

export function ModuleErrorBoundary({ children, moduleName }: ModuleErrorBoundaryProps) {
  return (
    <ErrorBoundary
      fallback={
        <Card className="m-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="size-5" />
              Ошибка в модуле {moduleName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Не удалось загрузить модуль {moduleName}. Попробуйте перезагрузить страницу.
            </p>
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="mr-2 size-4" />
              Перезагрузить
            </Button>
          </CardContent>
        </Card>
      }
    >
      {children}
    </ErrorBoundary>
  )
}

// ============================================
// Async Error Handler Hook
// ============================================

import { useState, useCallback } from "react"

interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

export function useAsyncHandler<T>() {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const execute = useCallback(async (asyncFunction: () => Promise<T>) => {
    setState({ data: null, loading: true, error: null })
    
    try {
      const data = await asyncFunction()
      setState({ data, loading: false, error: null })
      return data
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      setState({ data: null, loading: false, error: err })
      throw err
    }
  }, [])

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null })
  }, [])

  return {
    ...state,
    execute,
    reset,
  }
}

// ============================================
// Global Error Handler
// ============================================

export function setupGlobalErrorHandlers() {
  if (typeof window === 'undefined') return

  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    console.error('[Global Error]', event.error)
    
    // Prevent default browser error handling
    event.preventDefault()
    
    // Show user-friendly error (in production)
    if (process.env.NODE_ENV === 'production') {
      // Could show a toast notification
    }
  })

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('[Unhandled Promise Rejection]', event.reason)
    
    event.preventDefault()
    
    if (process.env.NODE_ENV === 'production') {
      // Report to error tracking
    }
  })
}

// ============================================
// Error Logging Utility
// ============================================

export class ErrorLogger {
  private static logs: Array<{
    timestamp: string
    type: 'error' | 'warn' | 'info'
    message: string
    stack?: string
    context?: any
  }> = []

  static log(error: Error, context?: any) {
    const entry = {
      timestamp: new Date().toISOString(),
      type: 'error' as const,
      message: error.message,
      stack: error.stack,
      context,
    }
    
    this.logs.push(entry)
    
    // Keep only last 100 errors
    if (this.logs.length > 100) {
      this.logs.shift()
    }
    
    console.error('[ErrorLogger]', entry)
  }

  static getLogs() {
    return [...this.logs]
  }

  static clear() {
    this.logs = []
  }

  static export() {
    return JSON.stringify(this.logs, null, 2)
  }
}
