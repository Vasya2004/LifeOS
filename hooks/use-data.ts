// ============================================
// USE-DATA - Legacy Re-export
// ============================================
// 
// This file is kept for backward compatibility.
// All hooks have been moved to the modular structure.
// 
// Import from '@/hooks' instead for new code.
//
// ============================================

// Re-export everything from the new modular structure
export * from "./index"

// Legacy aliases for backward compatibility
export { 
  useOfflineFirst as useSWRData,
  useOfflineMutation as useSWRMutation,
} from "./core/use-offline-first"
