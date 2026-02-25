import { BaseModule } from "./base"
import { KEYS } from "../keys"
import { statsModule } from "./stats"
import type { Reward } from "@/lib/types"
import { today } from "../utils/date"

const DEFAULT_REWARDS: Reward[] = [
    {
        id: "xp-boost-1",
        title: "XP Буст (100)",
        description: "Мгновенно получите 100 XP",
        cost: 50,
        icon: "zap",
        category: "experience",
        isRepeatable: true
    },
    {
        id: "streak-freeze",
        title: "Заморозка серии",
        description: "Сохраняет вашу серию, даже если вы пропустите день",
        cost: 150,
        icon: "snowflake",
        category: "privilege",
        isRepeatable: false
    },
    {
        id: "avatar-frame-gold",
        title: "Золотая рамка",
        description: "Эксклюзивная рамка для вашего аватара",
        cost: 500,
        icon: "frame",
        category: "item",
        isRepeatable: false
    },
    {
        id: "theme-dark-premium",
        title: "Премиум Темная Тема",
        description: "Стильная темно-фиолетовая тема оформления",
        cost: 300,
        icon: "palette",
        category: "item",
        isRepeatable: false
    }
]

class RewardsModule extends BaseModule<Reward> {
    protected key = KEYS.rewards
    protected getDefaultData = () => DEFAULT_REWARDS

    purchase(rewardId: string): { success: boolean; error?: string } {
        const reward = this.getById(rewardId)
        if (!reward) return { success: false, error: "Награда не найдена" }

        const stats = statsModule.get()
        if (stats.coins < reward.cost) {
            return { success: false, error: "Недостаточно монет" }
        }

        // Process purchase
        statsModule.spendCoins(reward.cost)

        if (reward.category === 'experience') {
            statsModule.addXp(100, "task_completed") // Using existing reason for simplicity
        }

        // Mark as purchased if not repeatable
        if (!reward.isRepeatable) {
            this.update(rewardId, {
                lastPurchasedAt: today()
            })
        }

        this.mutate()
        return { success: true }
    }

    getPurchasedItems(): Reward[] {
        return this.getAll().filter(r => r.lastPurchasedAt)
    }
}

export const rewardsModule = new RewardsModule()
