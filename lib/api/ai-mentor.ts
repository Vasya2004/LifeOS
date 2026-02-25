import type { Task, Habit, Goal } from "@/lib/types"

export interface AIInsight {
    id: string
    title: string
    content: string
    type: 'positive' | 'warning' | 'tip'
    icon: string
    category: 'productivity' | 'balance' | 'energy' | 'growth'
}

export function generateInsights(
    tasks: Task[] | undefined,
    habits: Habit[] | undefined,
    goals: Goal[] | undefined
): AIInsight[] {
    const insights: AIInsight[] = []

    if (!tasks || !habits) return []

    const completedTasks = tasks.filter(t => t.status === 'completed')
    const totalTasks = tasks.length

    // 1. Productivity Trend
    if (completedTasks.length > 5) {
        insights.push({
            id: 'prod-trend',
            title: 'Стабильный прогресс',
            content: 'Вы показываете отличные результаты на этой неделе. Продолжайте в том же духе!',
            type: 'positive',
            icon: 'trending-up',
            category: 'productivity'
        })
    }

    // 2. Energy Balance
    const energyCounts = {
        physical: completedTasks.filter(t => t.energyType === 'physical').length,
        mental: completedTasks.filter(t => t.energyType === 'mental').length,
        emotional: completedTasks.filter(t => t.energyType === 'emotional').length,
        creative: completedTasks.filter(t => t.energyType === 'creative').length,
    }

    const maxEnergy = Object.entries(energyCounts).reduce((a, b) => b[1] > a[1] ? b : a)
    if (maxEnergy[1] > completedTasks.length * 0.7) {
        insights.push({
            id: 'energy-imbalance',
            title: 'Энергетический перекос',
            content: `Вы тратите много ${getEnergyLabelRu(maxEnergy[0])} энергии. Попробуйте разбавить день творческими или физическими задачами.`,
            type: 'warning',
            icon: 'zap',
            category: 'energy'
        })
    } else {
        insights.push({
            id: 'energy-tip',
            title: 'Совет по планированию',
            content: 'Старайтесь планировать самые сложные "ментальные" задачи на утро, когда когнитивный ресурс на пике.',
            type: 'tip',
            icon: 'lightbulb',
            category: 'energy'
        })
    }

    // 3. Habit Check
    const brokenStreaks = habits.filter(h => h.streak === 0 && h.bestStreak > 5)
    if (brokenStreaks.length > 0) {
        insights.push({
            id: 'habit-recovery',
            title: 'Восстановление привычек',
            content: `Похоже, вы пропустили "${brokenStreaks[0].title}". Помните про правило "Никогда не пропускай дважды"!`,
            type: 'warning',
            icon: 'rotate-ccw',
            category: 'growth'
        })
    }

    // 4. Focus Tip
    const pendingHighPriority = tasks.filter(t => (t.priority === 'high' || t.priority === 'critical') && t.status !== 'completed')
    if (pendingHighPriority.length > 3) {
        insights.push({
            id: 'priority-focus',
            title: 'Фокус на важном',
            content: `У вас ${pendingHighPriority.length} важных задачи в ожидании. Попробуйте метод "Eat the Frog" завтра утром.`,
            type: 'tip',
            icon: 'target',
            category: 'productivity'
        })
    }

    return insights
}

function getEnergyLabelRu(type: string): string {
    switch (type) {
        case 'physical': return 'физической'
        case 'mental': return 'ментальной'
        case 'emotional': return 'эмоциональной'
        case 'creative': return 'творческой'
        default: return type
    }
}
