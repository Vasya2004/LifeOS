"use client"

import { useOfflineFirst } from "@/hooks/core/use-offline-first"
import * as localStore from "@/lib/store"
import type { Principle } from "@/lib/store"

const PRINCIPLES_KEY = "principles"

export type { Principle }

export function usePrinciples() {
  return useOfflineFirst<Principle[]>(PRINCIPLES_KEY, {
    storageKey: PRINCIPLES_KEY,
    getLocal: localStore.getPrinciples,
    setLocal: () => {}, // mutations handled directly via store
  })
}

export function useCreatePrinciple() {
  return (p: Pick<Principle, 'text' | 'emoji'>) => {
    localStore.addPrinciple(p)
  }
}

export function useUpdatePrinciple() {
  return (id: string, updates: Partial<Pick<Principle, 'text' | 'emoji' | 'order'>>) => {
    localStore.updatePrinciple(id, updates)
  }
}

export function useDeletePrinciple() {
  return (id: string) => {
    localStore.deletePrinciple(id)
  }
}
