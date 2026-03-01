// ============================================
// STORE REGISTRY - Lazy Loading Manager
// ============================================
//
// Manages dynamic imports and code splitting for store modules.
// Critical modules are preloaded immediately, heavy modules are loaded on demand.
//
// Usage:
//   const finance = await StoreRegistry.finance()
//   const accounts = finance.getAccounts()
//
// ============================================

import type * as FinanceModule from "../finance"
import type * as HealthModule from "../health"
import type * as SkillsModule from "../skills"

// ============================================
// Module Types
// ============================================

type FinanceAPI = typeof FinanceModule
type HealthAPI = typeof HealthModule
type SkillsAPI = typeof SkillsModule

// ============================================
// Loading States
// ============================================

export type LoadingState = "idle" | "loading" | "loaded" | "error"

interface ModuleState<T> {
  module: T | null
  state: LoadingState
  error: Error | null
  promise: Promise<T> | null
}

// ============================================
// Store Registry Class
// ============================================

class StoreRegistryClass {
  // Module states
  private financeState: ModuleState<FinanceAPI> = {
    module: null,
    state: "idle",
    error: null,
    promise: null,
  }

  private healthState: ModuleState<HealthAPI> = {
    module: null,
    state: "idle",
    error: null,
    promise: null,
  }

  private skillsState: ModuleState<SkillsAPI> = {
    module: null,
    state: "idle",
    error: null,
    promise: null,
  }

  // Preload configuration
  private preloadedModules = new Set<string>()
  private preloadPromise: Promise<void> | null = null

  // ============================================
  // Finance Module (Lazy)
  // ============================================

  async finance(): Promise<FinanceAPI> {
    // Return cached module
    if (this.financeState.module) {
      return this.financeState.module
    }

    // Return existing promise if loading
    if (this.financeState.promise) {
      return this.financeState.promise
    }

    // Start loading
    this.financeState.state = "loading"
    this.financeState.promise = this.loadFinanceModule()

    return this.financeState.promise
  }

  private async loadFinanceModule(): Promise<FinanceAPI> {
    try {
      const module = await import("../finance")
      this.financeState.module = module
      this.financeState.state = "loaded"
      this.financeState.error = null
      return module
    } catch (error) {
      this.financeState.state = "error"
      this.financeState.error = error instanceof Error ? error : new Error(String(error))
      throw this.financeState.error
    }
  }

  getFinanceState(): LoadingState {
    return this.financeState.state
  }

  // ============================================
  // Health Module (Lazy)
  // ============================================

  async health(): Promise<HealthAPI> {
    if (this.healthState.module) {
      return this.healthState.module
    }

    if (this.healthState.promise) {
      return this.healthState.promise
    }

    this.healthState.state = "loading"
    this.healthState.promise = this.loadHealthModule()

    return this.healthState.promise
  }

  private async loadHealthModule(): Promise<HealthAPI> {
    try {
      const module = await import("../health")
      this.healthState.module = module
      this.healthState.state = "loaded"
      this.healthState.error = null
      return module
    } catch (error) {
      this.healthState.state = "error"
      this.healthState.error = error instanceof Error ? error : new Error(String(error))
      throw this.healthState.error
    }
  }

  getHealthState(): LoadingState {
    return this.healthState.state
  }

  // ============================================
  // Skills Module (Lazy)
  // ============================================

  async skills(): Promise<SkillsAPI> {
    if (this.skillsState.module) {
      return this.skillsState.module
    }

    if (this.skillsState.promise) {
      return this.skillsState.promise
    }

    this.skillsState.state = "loading"
    this.skillsState.promise = this.loadSkillsModule()

    return this.skillsState.promise
  }

  private async loadSkillsModule(): Promise<SkillsAPI> {
    try {
      const module = await import("../skills")
      this.skillsState.module = module
      this.skillsState.state = "loaded"
      this.skillsState.error = null
      return module
    } catch (error) {
      this.skillsState.state = "error"
      this.skillsState.error = error instanceof Error ? error : new Error(String(error))
      throw this.skillsState.error
    }
  }

  getSkillsState(): LoadingState {
    return this.skillsState.state
  }

  // ============================================
  // Preload API
  // ============================================

  /**
   * Preload critical modules immediately
   * Call this during app initialization
   */
  preloadCritical(): void {
    // Critical modules are already imported synchronously in index.ts
    // This method exists for explicit documentation and future extensibility
    this.preloadedModules.add("identity")
    this.preloadedModules.add("stats")
    this.preloadedModules.add("tasks")
  }

  /**
   * Preload heavy modules in the background
   * Call this after app is interactive
   */
  preloadHeavy(): Promise<void> {
    if (this.preloadPromise) {
      return this.preloadPromise
    }

    this.preloadPromise = this.doPreloadHeavy()
    return this.preloadPromise
  }

  private async doPreloadHeavy(): Promise<void> {
    const promises: Promise<void>[] = []

    // Preload finance in background
    if (!this.preloadedModules.has("finance")) {
      promises.push(
        this.finance()
          .then(() => { this.preloadedModules.add("finance") })
          .catch(() => { /* Silent fail for preload */ })
      )
    }

    // Preload health in background
    if (!this.preloadedModules.has("health")) {
      promises.push(
        this.health()
          .then(() => { this.preloadedModules.add("health") })
          .catch(() => { /* Silent fail for preload */ })
      )
    }

    // Preload skills in background
    if (!this.preloadedModules.has("skills")) {
      promises.push(
        this.skills()
          .then(() => { this.preloadedModules.add("skills") })
          .catch(() => { /* Silent fail for preload */ })
      )
    }

    await Promise.all(promises)
  }

  /**
   * Check if a module is preloaded
   */
  isPreloaded(moduleName: "finance" | "health" | "skills"): boolean {
    return this.preloadedModules.has(moduleName)
  }

  /**
   * Get loading state of all lazy modules
   */
  getAllStates(): Record<string, LoadingState> {
    return {
      finance: this.financeState.state,
      health: this.healthState.state,
      skills: this.skillsState.state,
    }
  }

  /**
   * Clear all cached modules (useful for testing or memory management)
   */
  clearCache(): void {
    this.financeState = { module: null, state: "idle", error: null, promise: null }
    this.healthState = { module: null, state: "idle", error: null, promise: null }
    this.skillsState = { module: null, state: "idle", error: null, promise: null }
    this.preloadedModules.clear()
    this.preloadPromise = null
  }
}

// ============================================
// Singleton Export
// ============================================

export const StoreRegistry = new StoreRegistryClass()

// ============================================
// Helper Functions
// ============================================

/**
 * Convenience function to get finance module
 */
export async function getFinanceModule(): Promise<FinanceAPI> {
  return StoreRegistry.finance()
}

/**
 * Convenience function to get health module
 */
export async function getHealthModule(): Promise<HealthAPI> {
  return StoreRegistry.health()
}

/**
 * Convenience function to get skills module
 */
export async function getSkillsModule(): Promise<SkillsAPI> {
  return StoreRegistry.skills()
}

/**
 * Preload all heavy modules in background
 */
export function preloadHeavyModules(): Promise<void> {
  return StoreRegistry.preloadHeavy()
}

/**
 * Preload critical modules
 */
export function preloadCriticalModules(): void {
  StoreRegistry.preloadCritical()
}
