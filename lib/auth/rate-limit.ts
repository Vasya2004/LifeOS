// ============================================
// CLIENT-SIDE RATE LIMITING — защита от перебора
// ============================================

"use client"

import { useState, useEffect, useRef } from "react"

const ATTEMPTS_KEY = "lifeos_login_attempts"
const MAX_ATTEMPTS = 5
const LOCKOUT_MS = 5 * 60 * 1000 // 5 минут

interface AttemptData {
  count: number
  lockedUntil: number | null
}

function readData(): AttemptData {
  if (typeof window === "undefined") return { count: 0, lockedUntil: null }
  try {
    const raw = localStorage.getItem(ATTEMPTS_KEY)
    if (!raw) return { count: 0, lockedUntil: null }
    return JSON.parse(raw) as AttemptData
  } catch {
    return { count: 0, lockedUntil: null }
  }
}

function writeData(data: AttemptData) {
  if (typeof window === "undefined") return
  localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(data))
}

// Зафиксировать неудачную попытку
export function recordFailedAttempt(): void {
  const data = readData()
  const newCount = data.count + 1
  const lockedUntil = newCount >= MAX_ATTEMPTS ? Date.now() + LOCKOUT_MS : null
  writeData({ count: newCount, lockedUntil })
}

// Сбросить счётчик (после успешного входа)
export function clearAttempts(): void {
  if (typeof window !== "undefined") localStorage.removeItem(ATTEMPTS_KEY)
}

// Получить текущее состояние блокировки
export function getLockoutState(): { isLocked: boolean; remainingMs: number; attemptsLeft: number } {
  const data = readData()
  if (data.lockedUntil && Date.now() < data.lockedUntil) {
    return {
      isLocked: true,
      remainingMs: data.lockedUntil - Date.now(),
      attemptsLeft: 0,
    }
  }
  // Если блокировка истекла — сбросить
  if (data.lockedUntil && Date.now() >= data.lockedUntil) {
    clearAttempts()
  }
  return {
    isLocked: false,
    remainingMs: 0,
    attemptsLeft: Math.max(0, MAX_ATTEMPTS - data.count),
  }
}

function formatCountdown(ms: number): string {
  const totalSec = Math.ceil(ms / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

export interface RateLimitState {
  isLocked: boolean
  countdown: string
  attemptsLeft: number
  recordFailed: () => void
  clearAttempts: () => void
}

// React hook для использования в форме
export function useLoginRateLimit(): RateLimitState {
  const [state, setState] = useState(() => getLockoutState())
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (state.isLocked) {
      intervalRef.current = setInterval(() => {
        const next = getLockoutState()
        setState(next)
        if (!next.isLocked && intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
      }, 1000)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [state.isLocked])

  const recordFailed = () => {
    recordFailedAttempt()
    setState(getLockoutState())
  }

  const clear = () => {
    clearAttempts()
    setState(getLockoutState())
  }

  return {
    isLocked: state.isLocked,
    countdown: formatCountdown(state.remainingMs),
    attemptsLeft: state.attemptsLeft,
    recordFailed,
    clearAttempts: clear,
  }
}
