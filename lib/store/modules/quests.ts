import { mutate } from "swr"
import { getStore, setStore } from "../utils/storage"
import { genId } from "../utils/id"
import { today } from "../utils/date"
import { KEYS } from "../keys"
import { statsModule } from "./stats"
import type { Quest, UserQuests } from "@/lib/types/quests"

const QUESTS_KEY = KEYS.quests || "quests"

class QuestsModule {
    private key = QUESTS_KEY

    getUserQuests(): UserQuests {
        const fallback: UserQuests = {
            daily: [],
            lastGenerated: ""
        }

        const quests = getStore<UserQuests>(this.key, fallback)

        if (quests.lastGenerated !== today()) {
            return this.generateDailyQuests()
        }

        return quests
    }

    private generateDailyQuests(): UserQuests {
        const newQuests: Quest[] = [
            {
                id: genId(),
                title: "Продуктивный старт",
                description: "Завершите 3 любые задачи",
                category: "productivity",
                rewardXp: 50,
                rewardCoins: 10,
                isCompleted: false,
                targetValue: 3,
                currentValue: 0,
                unit: "задач",
                type: "task_completion"
            },
            {
                id: genId(),
                title: "Сила привычки",
                description: "Выполните 2 полезные привычки",
                category: "wellness",
                rewardXp: 40,
                rewardCoins: 5,
                isCompleted: false,
                targetValue: 2,
                currentValue: 0,
                unit: "привычки",
                type: "habit_completion"
            },
            {
                id: genId(),
                title: "Мастерство",
                description: "Заработайте 100 XP в любой сфере",
                category: "learning",
                rewardXp: 60,
                rewardCoins: 15,
                isCompleted: false,
                targetValue: 100,
                currentValue: 0,
                unit: "XP",
                type: "xp_gain"
            }
        ]

        const userQuests: UserQuests = {
            daily: newQuests,
            lastGenerated: today()
        }

        setStore(this.key, userQuests)
        mutate(this.key)
        return userQuests
    }

    updateProgress(type: Quest['type'], amount: number = 1) {
        const quests = this.getUserQuests()
        let changed = false

        const updatedDaily = quests.daily.map(quest => {
            if (quest.type === type && !quest.isCompleted) {
                const newValue = Math.min(quest.currentValue + amount, quest.targetValue)
                if (newValue !== quest.currentValue) {
                    changed = true
                    const isCompleted = newValue === quest.targetValue

                    if (isCompleted) {
                        statsModule.addXp(quest.rewardXp, `Завершение квеста: ${quest.title}`)
                        statsModule.addCoins(quest.rewardCoins)
                    }

                    return {
                        ...quest,
                        currentValue: newValue,
                        isCompleted,
                        completedAt: isCompleted ? new Date().toISOString() : undefined
                    }
                }
            }
            return quest
        })

        if (changed) {
            setStore(this.key, { ...quests, daily: updatedDaily })
            mutate(this.key)
        }
    }
}

export const questsModule = new QuestsModule()
