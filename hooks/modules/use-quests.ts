"use client"

import useSWR from "swr"
import { questsModule } from "@/lib/store/modules/quests"
import { KEYS } from "@/lib/store/keys"
import type { UserQuests } from "@/lib/types/quests"

export function useQuests() {
    const { data, error, mutate } = useSWR<UserQuests>(
        KEYS.quests,
        () => questsModule.getUserQuests()
    )

    return {
        quests: data?.daily || [],
        lastGenerated: data?.lastGenerated,
        isLoading: !error && !data,
        isError: error,
        mutate
    }
}
