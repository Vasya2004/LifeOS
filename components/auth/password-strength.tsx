// ============================================
// PASSWORD STRENGTH — визуальная проверка требований
// ============================================

"use client"

import { CheckCircle2, Circle } from "lucide-react"
import { cn } from "@/lib/utils"

const REQUIREMENTS = [
  { id: "length",  label: "Минимум 8 символов",   test: (p: string) => p.length >= 8 },
  { id: "upper",   label: "1 заглавная буква",     test: (p: string) => /[A-Z]/.test(p) },
  { id: "lower",   label: "1 строчная буква",      test: (p: string) => /[a-z]/.test(p) },
  { id: "digit",   label: "1 цифра",               test: (p: string) => /\d/.test(p) },
  { id: "special", label: "1 спецсимвол (!@#$...)",test: (p: string) => /[^A-Za-z0-9]/.test(p) },
]

function getStrength(password: string): number {
  return REQUIREMENTS.filter(r => r.test(password)).length
}

function getStrengthLabel(strength: number): string {
  if (strength <= 1) return "Слабый"
  if (strength <= 3) return "Средний"
  return "Надёжный"
}

function getStrengthColor(strength: number): string {
  if (strength <= 1) return "bg-red-500"
  if (strength <= 3) return "bg-amber-400"
  return "bg-green-500"
}

function getStrengthTextColor(strength: number): string {
  if (strength <= 1) return "text-red-400"
  if (strength <= 3) return "text-amber-400"
  return "text-green-400"
}

interface PasswordStrengthProps {
  password: string
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null

  const strength = getStrength(password)
  const strengthPercent = (strength / REQUIREMENTS.length) * 100

  return (
    <div className="mt-2 space-y-2">
      {/* Прогресс-бар */}
      <div className="flex items-center gap-2">
        <div className="h-1.5 flex-1 rounded-full bg-white/10 overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-300", getStrengthColor(strength))}
            style={{ width: `${strengthPercent}%` }}
          />
        </div>
        <span className={cn("text-xs font-medium tabular-nums", getStrengthTextColor(strength))}>
          {getStrengthLabel(strength)}
        </span>
      </div>

      {/* Список требований */}
      <ul className="grid grid-cols-1 gap-0.5" aria-label="Требования к паролю">
        {REQUIREMENTS.map(req => {
          const passed = req.test(password)
          return (
            <li
              key={req.id}
              className={cn(
                "flex items-center gap-1.5 text-xs transition-colors",
                passed ? "text-green-400" : "text-white/40"
              )}
            >
              {passed ? (
                <CheckCircle2 className="size-3 shrink-0" aria-hidden />
              ) : (
                <Circle className="size-3 shrink-0" aria-hidden />
              )}
              {req.label}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

// Утилита для валидации пароля (используется в форме)
export function validatePassword(password: string): string {
  if (!password) return "Введите пароль"
  if (password.length < 8) return "Пароль слишком короткий (минимум 8 символов)"
  const strength = getStrength(password)
  if (strength < 4) return "Пароль должен содержать заглавные, строчные буквы, цифру и спецсимвол"
  return ""
}
