// ============================================
// WISHES HOOKS
// ============================================

"use client"

import useSWR from "swr"
import * as localStore from "@/lib/store"
import type { Wish } from "@/lib/types"

const WISHES_KEY = "wishes"

export function useWishes() {
  return useSWR(WISHES_KEY, localStore.getWishes, { revalidateOnFocus: false })
}

export function useCreateWish() {
  return async (wish: Omit<Wish, "id" | "progress" | "status">) => {
    return localStore.addWish(wish)
  }
}

export function useUpdateWish() {
  return async (id: string, updates: Partial<Wish>) => {
    localStore.updateWish(id, updates)
  }
}

export function useDeleteWish() {
  return async (id: string) => {
    localStore.deleteWish(id)
  }
}

export function useContributeToWish() {
  return async (wishId: string, amount: number) => {
    return localStore.contributeToWish(wishId, amount)
  }
}

export function usePurchaseWish() {
  return async (wishId: string) => {
    return localStore.purchaseWish(wishId)
  }
}

export function useWishesByStatus(status: Wish["status"]) {
  return useSWR(
    `${WISHES_KEY}/status/${status}`,
    () => localStore.getWishesByStatus(status),
    { revalidateOnFocus: false }
  )
}

export function useActiveWishes() {
  return useSWR(
    `${WISHES_KEY}/active`,
    localStore.getActiveWishes,
    { revalidateOnFocus: false }
  )
}
