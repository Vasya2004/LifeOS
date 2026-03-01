// ============================================
// USE-DATA - Legacy Re-export
// ============================================
//
// Оставлен для обратной совместимости. Все хуки перенесены в
// модульную структуру (hooks/index.ts, hooks/modules/*, hooks/core/*).
//
// Для нового кода: импортируйте из '@/hooks' или конкретного модуля,
// например useGoals из '@/hooks/modules/use-goals'.
//
// Легаси-алиасы (useSWRData, useSWRMutation) — deprecated,
// используйте useOfflineFirst / useOfflineMutation.
//
// ============================================

// Re-export everything from the new modular structure
export * from "./index"

/** @deprecated Use useOfflineFirst from '@/hooks/core/use-offline-first' */
export { useOfflineFirst as useSWRData } from "./core/use-offline-first"

/** @deprecated Use useOfflineMutation from '@/hooks/core/use-offline-first' */
export { useOfflineMutation as useSWRMutation } from "./core/use-offline-first"
