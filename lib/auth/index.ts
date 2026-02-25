// ============================================
// AUTH MODULE - Main Export
// ============================================

export {
  AuthProvider,
  useAuth,
  type AuthUser,
  type UserProfile,
  type AuthState,
  type AuthContextValue,
} from "./context"

export {
  getCurrentUserId,
  setCurrentUserId,
  clearCurrentUserId,
} from "./user-id"
