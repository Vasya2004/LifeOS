// ============================================
// GUEST MIGRATION — перенос данных гостя в аккаунт
// ============================================

import { exportAllData } from "@/lib/store/legacy"
import { syncToCloud } from "@/lib/sync/cloud-sync"

const PENDING_KEY = "lifeos_migration_pending"

// Есть ли значимые гостевые данные для миграции
export function hasGuestData(): boolean {
  try {
    const data = exportAllData()
    const tasks = data.tasks?.length ?? 0
    const habits = data.habits?.length ?? 0
    const xp = (data.stats as { totalXp?: number })?.totalXp ?? 0
    return tasks > 0 || habits > 0 || xp > 0
  } catch {
    return false
  }
}

// Вызывается ПЕРЕД signUp — отмечает что нужна миграция
export function markMigrationPending(): void {
  if (typeof window === "undefined") return
  if (hasGuestData()) {
    localStorage.setItem(PENDING_KEY, "true")
  }
}

// Вызывается ПОСЛЕ успешной аутентификации
// Возвращает true если миграция была выполнена
export async function executeMigrationIfPending(): Promise<boolean> {
  if (typeof window === "undefined") return false
  if (localStorage.getItem(PENDING_KEY) !== "true") return false

  try {
    // Данные уже лежат в IndexedDB — просто синхронизируем их в Supabase
    const success = await syncToCloud()

    if (success) {
      // Очищаем флаг миграции
      localStorage.removeItem(PENDING_KEY)

      // Очищаем гостевой режим
      localStorage.removeItem("lifeos_guest_mode")
      localStorage.removeItem("lifeos_current_user_id")

      // Убираем cookie гостевого режима
      if (typeof document !== "undefined") {
        document.cookie = "lifeos_guest_mode=; max-age=0; path=/"
      }

      return true
    }

    return false
  } catch {
    return false
  }
}
