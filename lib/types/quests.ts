export type QuestCategory = 'productivity' | 'fitness' | 'learning' | 'wellness' | 'social'

export interface Quest {
    id: string
    title: string
    description: string
    category: QuestCategory
    rewardXp: number
    rewardCoins: number
    isCompleted: boolean
    completedAt?: string

    // Progress tracking
    targetValue: number
    currentValue: number
    unit: string // e.g., "tasks", "xp", "minutes"

    // Link to other modules
    type: 'task_completion' | 'habit_completion' | 'xp_gain' | 'skill_progress'
}

export interface UserQuests {
    daily: Quest[]
    lastGenerated: string // ISO date
}
