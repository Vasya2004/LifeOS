// ============================================
// WISHES FEATURE MODULE
// ============================================

import type { Wish } from "@/lib/types"
import { getStore, setStore, KEYS, mutateKey, genId, now } from "@/lib/store/core"
import { spendCoins } from "@/lib/store/features/gamification"

// ============================================
// CRUD
// ============================================

export function getWishes(): Wish[] {
  return getStore(KEYS.wishes, [])
}

export function getWishById(id: string): Wish | undefined {
  return getWishes().find(w => w.id === id)
}

export function addWish(
  wish: Omit<Wish, "id" | "progress" | "status" | "purchasedAt">
): Wish {
  const wishes = getWishes()
  const newWish: Wish = {
    ...wish,
    id: genId(),
    progress: 0,
    status: "saving",
  }
  const updated = [...wishes, newWish]
  setStore(KEYS.wishes, updated)
  mutateKey(KEYS.wishes, updated)
  return newWish
}

export function updateWish(id: string, updates: Partial<Wish>) {
  const wishes = getWishes()
  const updated = wishes.map(w => w.id === id ? { ...w, ...updates } : w)
  setStore(KEYS.wishes, updated)
  mutateKey(KEYS.wishes, updated)
}

export function deleteWish(id: string) {
  const wishes = getWishes()
  const updated = wishes.filter(w => w.id !== id)
  setStore(KEYS.wishes, updated)
  mutateKey(KEYS.wishes, updated)
}

// ============================================
// CONTRIBUTIONS & PURCHASES
// ============================================

export interface ContributeResult {
  success: boolean
  newProgress: number
  error?: string
}

export function contributeToWish(id: string, amount: number): ContributeResult {
  const wish = getWishById(id)
  if (!wish || wish.status === "purchased") {
    return { 
      success: false, 
      newProgress: wish?.progress || 0, 
      error: "Wish not found or already purchased" 
    }
  }
  
  const newProgress = Math.min(wish.progress + amount, wish.cost)
  const isReady = newProgress >= wish.cost
  
  updateWish(id, {
    progress: newProgress,
    status: isReady ? "ready" : "saving",
  })
  
  return { success: true, newProgress }
}

export interface PurchaseResult {
  success: boolean
  error?: string
}

export function purchaseWish(id: string): PurchaseResult {
  const wish = getWishById(id)
  if (!wish || wish.status !== "ready") {
    return { success: false, error: "Wish not ready for purchase" }
  }
  
  const result = spendCoins(wish.cost)
  if (!result.success) {
    return { success: false, error: "Insufficient coins" }
  }
  
  updateWish(id, {
    status: "purchased",
    purchasedAt: now(),
  })
  
  return { success: true }
}

// ============================================
// QUERIES
// ============================================

export function getWishesByStatus(status: Wish["status"]): Wish[] {
  return getWishes().filter(w => w.status === status)
}

export function getActiveWishes(): Wish[] {
  return getWishes().filter(w => w.status === "saving" || w.status === "ready")
}

export function getWishesStats() {
  const wishes = getWishes()
  const totalCost = wishes.reduce((sum, w) => sum + w.cost, 0)
  const totalProgress = wishes.reduce((sum, w) => sum + w.progress, 0)
  
  return {
    total: wishes.length,
    saving: wishes.filter(w => w.status === "saving").length,
    ready: wishes.filter(w => w.status === "ready").length,
    purchased: wishes.filter(w => w.status === "purchased").length,
    totalCost,
    totalProgress,
    remaining: totalCost - totalProgress,
  }
}
