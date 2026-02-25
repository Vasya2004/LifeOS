"use client"

import { useOfflineFirst } from "@/hooks/core/use-offline-first"
import { ACHIEVEMENT_TYPE_CONFIG } from "@/lib/types/achievements"
import { toast } from "sonner"
import * as localStore from "@/lib/store/modules/achievements"
import { setStore } from "@/lib/store/utils/storage"
import { useAuth } from "@/lib/auth/context"
import { mutate } from "swr"
import type {
    Achievement,
    CreateAchievementInput,
    UpdateAchievementInput,
    AchievementStats,
    AchievementFilters,
    AchievementSort
} from "@/lib/types/achievements"

const ACHIEVEMENTS_KEY = "achievements"
const STATS_KEY = "achievement_stats"

export function useAchievements(filters?: AchievementFilters, sort?: AchievementSort) {
    const { isAuthenticated } = useAuth()

    const { data, ...rest } = useOfflineFirst<Achievement[]>(ACHIEVEMENTS_KEY, {
        storageKey: ACHIEVEMENTS_KEY,
        getLocal: localStore.getAchievements,
        // getServer: isAuthenticated ? db.getAchievements : undefined, // Add when DB API is ready
        setLocal: (data) => setStore(ACHIEVEMENTS_KEY, data),
    })

    let filtered = data || []
    if (filters) {
        filtered = localStore.filterAchievements(filtered, filters)
    }
    if (sort) {
        filtered = localStore.sortAchievements(filtered, sort)
    }

    return { data: filtered, ...rest }
}

export function useAchievementStats() {
    const { isAuthenticated } = useAuth()

    return useOfflineFirst<AchievementStats>(STATS_KEY, {
        storageKey: STATS_KEY,
        getLocal: localStore.getStats,
        // getServer: isAuthenticated ? db.getAchievementStats : undefined, // Add when DB API is ready
        setLocal: (data) => setStore(STATS_KEY, data),
    })
}

export function useCreateAchievement() {
    const { isAuthenticated } = useAuth()

    return async (input: CreateAchievementInput) => {
        const achievement = localStore.createAchievement(input)

        // Show Toast Notification
        const typeConfig = ACHIEVEMENT_TYPE_CONFIG[achievement.type]
        toast.success(`Новое достижение: ${achievement.title}`, {
            description: typeConfig.labelRu,
            duration: 5000,
        })

        if (isAuthenticated) {
            // await syncToServer("insert", "achievements", achievement, () => {})
        }

        // Revalidate related keys
        mutate(ACHIEVEMENTS_KEY)
        mutate(STATS_KEY)

        return achievement
    }
}

export function useUpdateAchievement() {
    const { isAuthenticated } = useAuth()

    return async (input: UpdateAchievementInput) => {
        const updated = localStore.updateAchievement(input)

        if (isAuthenticated && updated) {
            // await syncToServer("update", "achievements", updated, () => {})
        }

        mutate(ACHIEVEMENTS_KEY)
        return updated
    }
}

export function useDeleteAchievement() {
    const { isAuthenticated } = useAuth()

    return async (id: string) => {
        const success = localStore.deleteAchievement(id)

        if (isAuthenticated && success) {
            // await syncToServer("delete", "achievements", id, () => {})
        }

        mutate(ACHIEVEMENTS_KEY)
        mutate(STATS_KEY)
        return success
    }
}

export function useToggleFavoriteAchievement() {
    const { isAuthenticated } = useAuth()

    return async (id: string) => {
        const success = localStore.toggleFavorite(id)

        if (isAuthenticated && success) {
            const updated = localStore.getAchievementById(id)
            if (updated) {
                // await syncToServer("update", "achievements", updated, () => {})
            }
        }

        mutate(ACHIEVEMENTS_KEY)
        mutate(STATS_KEY)
        return success
    }
}
