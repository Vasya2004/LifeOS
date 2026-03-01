// ============================================
// SIGNUP FORM — форма регистрации с миграцией гостя и a11y
// ============================================

"use client"

import { useState, useMemo, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { mapAuthError } from "@/lib/auth/error-mapper"
import { markMigrationPending } from "@/lib/auth/guest-migration"
import { hasGuestData } from "@/lib/auth/guest-migration"
import { PasswordStrength, validatePassword } from "@/components/auth/password-strength"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle2, Eye, EyeOff, Check } from "lucide-react"

const MIN_SUBMIT_INTERVAL = 3000

const baseInput = "h-12 rounded-2xl bg-white/[0.20] text-white placeholder:text-white/35 focus-visible:ring-1 focus-visible:ring-offset-0 transition-colors"
const inputNormal  = `${baseInput} border border-white/[0.12] focus-visible:ring-white/30`
const inputError   = `${baseInput} border-red-500/50 focus-visible:ring-red-500/40`
const inputSuccess = `${baseInput} border-green-500/40 focus-visible:ring-green-500/40`

function validateEmail(v: string) {
  if (!v) return "Введите email"
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Некорректный формат email"
  return ""
}

export default function SignupForm() {
  const router = useRouter()
  const { signUp, signInWithOAuth } = useAuth()

  const [firstName, setFirstName]   = useState("")
  const [lastName, setLastName]     = useState("")
  const [email, setEmail]           = useState("")
  const [password, setPassword]     = useState("")
  const [confirm, setConfirm]       = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm]   = useState(false)
  const [touched, setTouched]       = useState<Record<string, boolean>>({})
  const [isPending, setIsPending]   = useState(false)
  const [serverError, setServerError] = useState<{ message: string; action?: { label: string; href: string } } | null>(null)
  const [success, setSuccess]       = useState(false)

  const lastSubmitRef = useRef<number>(0)
  const guestHasData = hasGuestData()

  const touch = (field: string) => setTouched(t => ({ ...t, [field]: true }))

  const errors = useMemo(() => ({
    firstName: firstName.trim().length < 2 ? "Минимум 2 символа" : "",
    lastName:  lastName.trim().length  < 2 ? "Минимум 2 символа" : "",
    email:     validateEmail(email),
    password:  validatePassword(password),
    confirm:   confirm !== password ? "Пароли не совпадают" : "",
  }), [firstName, lastName, email, password, confirm])

  const getClass = (field: keyof typeof errors) => {
    if (!touched[field]) return inputNormal
    return errors[field] ? inputError : inputSuccess
  }

  const FieldMsg = ({ field, id }: { field: keyof typeof errors; id: string }) => {
    if (!touched[field]) return null
    if (errors[field]) {
      return (
        <p id={id} className="text-xs text-red-400 mt-1" role="alert">
          {errors[field]}
        </p>
      )
    }
    return (
      <p id={id} className="text-xs text-green-400 mt-1 flex items-center gap-1">
        <Check className="size-3" aria-hidden /> Отлично
      </p>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched({ firstName: true, lastName: true, email: true, password: true, confirm: true })
    if (Object.values(errors).some(Boolean)) return
    if (Date.now() - lastSubmitRef.current < MIN_SUBMIT_INTERVAL) return

    lastSubmitRef.current = Date.now()
    setIsPending(true)
    setServerError(null)

    // Сохраняем гостевые данные перед регистрацией
    markMigrationPending()

    const { error } = await signUp(email, password, { name: `${firstName.trim()} ${lastName.trim()}` })

    if (error) {
      setServerError(mapAuthError(error))
    } else {
      setSuccess(true)
    }

    setIsPending(false)
  }

  const handleOAuth = async (provider: "github" | "google") => {
    setServerError(null)
    markMigrationPending()
    const { error, url } = await signInWithOAuth(provider)
    if (error) setServerError(mapAuthError(error))
    else if (url) window.location.href = url
  }

  // ─── Success screen ──────────────────────────────────────────────────
  if (success) {
    return (
      <div className="space-y-6 text-center">
        <CheckCircle2 className="size-12 text-green-400 mx-auto" />
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold text-white">Подтвердите email</h2>
          <p className="text-sm text-white/65">
            Мы отправили письмо на{" "}
            <span className="font-medium text-white/80">{email}</span>.<br />
            Перейдите по ссылке в письме для активации аккаунта.
          </p>
          {guestHasData && (
            <p className="text-xs text-green-400/80 mt-2">
              Ваш прогресс будет сохранён после первого входа.
            </p>
          )}
        </div>
        <Button
          className="w-full bg-[#252525] border border-[#333333] text-white hover:bg-[#2E2E2E]"
          onClick={() => router.push("/auth/login")}
        >
          Перейти к входу
        </Button>
      </div>
    )
  }

  // ─── Main form ───────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Баннер о гостевых данных */}
      {guestHasData && (
        <div className="rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-2 text-xs text-violet-300">
          Ваш гостевой прогресс будет автоматически сохранён после регистрации.
        </div>
      )}

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

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Имя + Фамилия */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="firstName" className="text-white/80">Имя</Label>
            <Input
              id="firstName"
              placeholder="Иван"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              onBlur={() => touch("firstName")}
              autoComplete="given-name"
              disabled={isPending}
              aria-invalid={touched.firstName && !!errors.firstName}
              aria-describedby={touched.firstName ? "firstName-msg" : undefined}
              className={getClass("firstName")}
            />
            <FieldMsg field="firstName" id="firstName-msg" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="lastName" className="text-white/80">Фамилия</Label>
            <Input
              id="lastName"
              placeholder="Иванов"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              onBlur={() => touch("lastName")}
              autoComplete="family-name"
              disabled={isPending}
              aria-invalid={touched.lastName && !!errors.lastName}
              aria-describedby={touched.lastName ? "lastName-msg" : undefined}
              className={getClass("lastName")}
            />
            <FieldMsg field="lastName" id="lastName-msg" />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1">
          <Label htmlFor="email" className="text-white/80">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onBlur={() => touch("email")}
            autoComplete="email"
            disabled={isPending}
            aria-invalid={touched.email && !!errors.email}
            aria-describedby={touched.email ? "email-msg" : undefined}
            className={getClass("email")}
          />
          <FieldMsg field="email" id="email-msg" />
        </div>

        {/* Пароль */}
        <div className="space-y-1">
          <Label htmlFor="password" className="text-white/80">Пароль</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Минимум 8 символов"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onBlur={() => touch("password")}
              autoComplete="new-password"
              disabled={isPending}
              aria-invalid={touched.password && !!errors.password}
              aria-describedby="password-requirements"
              className={`${getClass("password")} pr-10`}
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
          <div id="password-requirements">
            <PasswordStrength password={password} />
          </div>
          {touched.password && errors.password && !password && (
            <p className="text-xs text-red-400 mt-1" role="alert">{errors.password}</p>
          )}
        </div>

        {/* Подтверждение пароля */}
        <div className="space-y-1">
          <Label htmlFor="confirm" className="text-white/50 text-xs">Подтвердите пароль</Label>
          <div className="relative">
            <Input
              id="confirm"
              type={showConfirm ? "text" : "password"}
              placeholder="Повторите пароль"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              onBlur={() => touch("confirm")}
              autoComplete="new-password"
              disabled={isPending}
              aria-invalid={touched.confirm && !!errors.confirm}
              aria-describedby={touched.confirm ? "confirm-msg" : undefined}
              className={`${getClass("confirm")} pr-10 opacity-80`}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
              aria-label={showConfirm ? "Скрыть пароль" : "Показать пароль"}
              tabIndex={-1}
            >
              {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          <FieldMsg field="confirm" id="confirm-msg" />
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="h-12 w-full rounded-2xl bg-white text-zinc-900 font-semibold hover:bg-white/90 transition-all disabled:opacity-60"
        >
          {isPending ? (
            <><Loader2 className="mr-2 size-4 animate-spin" />Создание аккаунта...</>
          ) : (
            "Начать прокачку"
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-xs text-white/40 shrink-0">или через</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {/* OAuth */}
      <Button
        variant="outline"
        onClick={() => handleOAuth("google")}
        disabled={isPending}
        className="h-12 w-full rounded-2xl bg-white/[0.07] border-transparent text-white hover:bg-white/[0.12] hover:text-white transition-colors"
      >
        <svg className="mr-2 size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Google
      </Button>

      <p className="text-center text-sm text-white/50">
        Уже есть аккаунт?{" "}
        <Link
          href="/auth/login"
          className="ml-1 text-white font-medium underline underline-offset-4 hover:text-white/80 transition-colors"
        >
          Войти
        </Link>
      </p>
    </div>
  )
}
