"use client"

import useSWR from "swr"
import { rewardsModule } from "@/lib/store/modules/rewards"
import { KEYS } from "@/lib/store/keys"
import type { Reward } from "@/lib/types"
import { toast } from "sonner"

export function useRewards() {
    const { data: rewards, error, mutate } = useSWR<Reward[]>(
        KEYS.rewards,
        () => rewardsModule.getAll()
    )

    const purchase = async (id: string) => {
        const result = rewardsModule.purchase(id)
        if (result.success) {
            toast.success("Покупка совершена!")
            mutate()
        } else {
            toast.error(result.error || "Ошибка при покупке")
        }
        return result
    }

    return {
        rewards: rewards || [],
        isLoading: !error && !rewards,
        isError: error,
        purchase,
        mutate
    }
}
