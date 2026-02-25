// ============================================
// STORE - Re-export for backward compatibility
// ============================================
//
// This file now re-exports all functions from the modular store.
// The store has been refactored into domain-specific modules:
//
// lib/store/
// ├── core.ts           # Storage utilities
// ├── defaults.ts       # Default values
// ├── gamification.ts   # XP, coins, levels
// ├── identity.ts       # Identity, values, areas, roles
// ├── goals.ts          # Goals and projects
// ├── tasks.ts          # Tasks
// ├── habits.ts         # Habits
// ├── reflection.ts     # Reviews and journal
// ├── wishes.ts         # Wishlist
// ├── finance.ts        # Financial tracking
// ├── health.ts         # Health monitoring
// ├── skills.ts         # RPG skill system
// ├── backup.ts         # Export/import
// └── index.ts          # Main exports
//
// ============================================

export * from "./store/index"
