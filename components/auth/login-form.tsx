// ============================================
// LOGIN FORM — форма входа с rate limiting и a11y
// ============================================

"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { mapAuthError } from "@/lib/auth/error-mapper"
import { useLoginRateLimit } from "@/lib/auth/rate-limit"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Github, Loader2, Eye, EyeOff, UserRound, AlertTriangle } from "lucide-react"

const MIN_SUBMIT_INTERVAL = 3000

const inputBase =
  "h-11 bg-white/8 border-white/15 text-white placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#141414] transition-colors"

export default function LoginForm() {
  const router = useRouter()
  const { signIn, signInWithOAuth, signInAsGuest } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [serverError, setServerError] = useState<{ message: string; action?: { label: string; href: string } } | null>(null)

  const lastSubmitRef = useRef<number>(0)
  const { isLocked, countdown, attemptsLeft, recordFailed, clearAttempts } = useLoginRateLimit()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLocked) return
    if (Date.now() - lastSubmitRef.current < MIN_SUBMIT_INTERVAL) return

    lastSubmitRef.current = Date.now()
    setIsPending(true)
    setServerError(null)

    try {
      console.log("[LoginForm] Attempting signIn...")
      const { error } = await signIn(email, password)
      console.log("[LoginForm] signIn promise resolved. Error:", error?.message || "none")

      if (error) {
        setServerError(mapAuthError(error))
        recordFailed()
      } else {
        console.log("[LoginForm] Success! Clearing attempts and redirecting to /")
        clearAttempts()
        router.push("/")
      }
    } catch (e) {
      console.error("[LoginForm] Unexpected error:", e)
      setServerError({ message: "Ошибка сети. Проверьте подключение к интернету." })
    } finally {
      console.log("[LoginForm] Setting isPending to false")
      setIsPending(false)
    }
  }

  const handleOAuth = async (provider: "github" | "google") => {
    setServerError(null)
    const { error, url } = await signInWithOAuth(provider)
    if (error) setServerError(mapAuthError(error))
    else if (url) window.location.href = url
  }

  const handleGuest = () => {
    signInAsGuest()
    setTimeout(() => { window.location.href = "/" }, 100)
  }

  const isDisabled = isPending || isLocked

  return (
    <div className="space-y-6">
      {/* Серверная ошибка */}
      {serverError && (
        <Alert
          role="alert"
          variant="destructive"
          className="border-red-500/50 bg-red-500/10"
        >
          <AlertDescription className="flex items-center justify-between gap-2 text-red-400">
            <span>{serverError.message}</span>
            {serverError.action && (
              <Link
                href={serverError.action.href}
                className="ml-2 shrink-0 underline underline-offset-4 hover:text-red-300 transition-colors"
              >
                {serverError.action.label}
              </Link>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Rate limit сообщение */}
      {isLocked && (
        <p
          role="status"
          aria-live="polite"
          className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-400"
        >
          <AlertTriangle className="size-4 shrink-0" aria-hidden />
          Слишком много попыток. Повторите через{" "}
          <span className="font-mono font-semibold">{countdown}</span>
        </p>
      )}

      {/* Предупреждение о попытках */}
      {!isLocked && attemptsLeft <= 2 && attemptsLeft > 0 && (
        <p role="status" aria-live="polite" className="text-xs text-amber-400/80 text-center">
          Осталось попыток: {attemptsLeft}
        </p>
      )}

      {/* Форма */}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-white/80">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
            disabled={isDisabled}
            className={inputBase}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-white/80">Пароль</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              disabled={isDisabled}
              className={`${inputBase} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
              aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          <div className="flex justify-end">
            <Link
              href="/auth/reset-password"
              className="text-xs text-white/45 hover:text-white/75 transition-colors underline-offset-4 hover:underline"
            >
              Забыли пароль?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isDisabled}
          className="h-11 w-full bg-gradient-to-r from-white to-gray-100 text-zinc-900 font-semibold shadow-lg hover:shadow-[0_0_30px_rgba(255,255,255,0.25)] hover:from-white hover:to-white transition-all disabled:opacity-60"
        >
          {isPending ? (
            <><Loader2 className="mr-2 size-4 animate-spin" />Вход...</>
          ) : isLocked ? (
            `Заблокировано (${countdown})`
          ) : (
            "Войти"
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-[#141414] px-2 text-white/40">или войдите через</span>
        </div>
      </div>

      {/* OAuth */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          onClick={() => handleOAuth("github")}
          disabled={isDisabled}
          className="h-11 bg-[#252525] border-[#333333] text-white hover:bg-[#2E2E2E] hover:text-white hover:border-[#444444] focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#141414]"
        >
          <Github className="mr-2 size-4" />GitHub
        </Button>
        <Button
          variant="outline"
          onClick={() => handleOAuth("google")}
          disabled={isDisabled}
          className="h-11 bg-[#252525] border-[#333333] text-white hover:bg-[#2E2E2E] hover:text-white hover:border-[#444444] focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#141414]"
        >
          <svg className="mr-2 size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Google
        </Button>
      </div>

      {/* Гость */}
      <Button
        variant="outline"
        className="h-11 w-full border-white/20 text-white/70 hover:bg-white/5 hover:text-white hover:border-white/35 bg-transparent transition-colors focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#141414]"
        onClick={handleGuest}
        disabled={isPending}
      >
        <UserRound className="mr-2 size-4" />
        Войти как гость (Demo)
      </Button>

      <p className="text-center text-sm text-white/50">
        Нет аккаунта?{" "}
        <Link
          href="/auth/register"
          className="ml-1 text-white font-medium underline underline-offset-4 hover:text-white/80 transition-colors"
        >
          Зарегистрироваться
        </Link>
      </p>
    </div>
  )
}
