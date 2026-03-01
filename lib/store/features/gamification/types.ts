// ============================================
// GAMIFICATION TYPES - Локальные типы модуля
// ============================================

import type { UserStats } from "@/lib/types"

/** Результат операции с монетами */
export interface CoinsOperationResult {
  success: boolean
  newBalance: number
}

/** Награды за действие */
export interface ActionRewards {
  xp: number
  coins: number
  reason: string
}

/** Конфигурация уровня */
export interface LevelConfig {
  level: number
  title: string
  xpToNext: number
  color: string
}

/** Событие геймификации */
export interface GamificationEvent {
  type: "level_up" | "xp_gained" | "coins_earned" | "coins_spent" | "streak_changed"
  timestamp: string
  data: unknown
}

/** Состояние геймификации с метаданными */
export interface GamificationState extends UserStats {
  recentEvents: GamificationEvent[]
  levelProgress: number // 0-100
}
