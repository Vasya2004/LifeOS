// ============================================
// WISHES - Reward System
// ============================================

import type { Wish } from "@/lib/types"
import { getStore, setStore, KEYS, mutateKey, genId, now } from "./core"
import { updateStats, getStats } from "./gamification"

export function getWishes(): Wish[] {
  return getStore(KEYS.wishes, [])
}

export function getWishById(id: string): Wish | undefined {
  return getWishes().find(w => w.id === id)
}

export function addWish(wish: Omit<Wish, "id" | "progress" | "status">) {
  const wishes = getWishes()
  const newWish: Wish = {
    ...wish,
    id: genId(),
    progress: 0,
    status: "saving",
  }
  setStore(KEYS.wishes, [...wishes, newWish])
  mutateKey(KEYS.wishes)
  return newWish
}

export function updateWish(id: string, updates: Partial<Wish>) {
  const wishes = getWishes()
  setStore(KEYS.wishes, wishes.map(w => w.id === id ? { ...w, ...updates } : w))
  mutateKey(KEYS.wishes)
}

export function deleteWish(id: string) {
  const wishes = getWishes()
  setStore(KEYS.wishes, wishes.filter(w => w.id !== id))
  mutateKey(KEYS.wishes)
}

export function contributeToWish(wishId: string, amount: number): { success: boolean; error?: string; newProgress?: number } {
  const wishes = getWishes()
  const wish = wishes.find(w => w.id === wishId)
  if (!wish) return { success: false, error: "Wish not found" }
  
  const stats = getStats()
  if (stats.coins < amount) return { success: false, error: "Not enough coins" }
  
  const newProgress = Math.min(100, wish.progress + (amount / wish.cost * 100))
  const newStatus = newProgress >= 100 ? "ready" : "saving"
  
  setStore(KEYS.wishes, wishes.map(w => 
    w.id === wishId ? { ...w, progress: newProgress, status: newStatus } : w
  ))
  mutateKey(KEYS.wishes)
  
  updateStats({ coins: stats.coins - amount })
  
  return { success: true, newProgress }
}

export function purchaseWish(wishId: string): { success: boolean; error?: string } {
  const wish = getWishById(wishId)
  if (!wish) return { success: false, error: "Wish not found" }
  if (wish.status !== "ready") return { success: false, error: "Wish is not ready for purchase" }
  
  updateWish(wishId, { 
    status: "purchased", 
    purchasedAt: now() 
  })
  
  return { success: true }
}

export function getWishesByStatus(status: Wish["status"]): Wish[] {
  return getWishes().filter(w => w.status === status)
}

export function getActiveWishes(): Wish[] {
  return getWishes().filter(w => w.status === "saving" || w.status === "ready")
}
