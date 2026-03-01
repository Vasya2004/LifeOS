// ============================================
// FALLBACK AI - Rule-based engine
// ============================================

import type { AIAdvice, AIAdviceType } from "@/lib/types/dashboard.types"
import type { UserContext, AIAdviceResponse } from "./prompts"

export function generateLocalAdvice(context: Partial<UserContext>): AIAdvice[] {
  const advices: AIAdvice[] = []

  // Check for overdue tasks - URGENT
  if (context.overdueTasks && context.overdueTasks.length > 0) {
    const count = context.overdueTasks.length
    advices.push({
      id: "local-overdue-" + Date.now(),
      type: "urgent",
      category: "productivity",
      title: count === 1 ? "Просроченная задача" : `${count} просроченных задачи`,
      message: count === 1
        ? `У вас есть просроченная задача "${context.overdueTasks[0].title}". Постарайтесь выполнить её как можно скорее или перенесите срок.`
        : `У вас ${count} просроченных задач. Рекомендую разобраться с ними или перенести дедлайны, чтобы не терять мотивацию.`,
      actionHref: "/tasks",
      actionLabel: "К задачам",
      dismissible: true,
      priority: 10,
    })
  }

  // Check streak - WARNING if low
  if (context.stats && context.stats.currentStreak === 0) {
    advices.push({
      id: "local-streak-" + Date.now(),
      type: "warning",
      category: "streak",
      title: "Серия прервана",
      message: "Ваша ежедневная серия прервана. Не переживайте! Сегодня отличный день, чтобы начать новую серию. Выполните хотя бы одну привычку.",
      actionHref: "/habits",
      actionLabel: "К привычкам",
      dismissible: true,
      priority: 7,
    })
  }

  // Check streak - POSITIVE if high
  if (context.stats && context.stats.currentStreak >= 7) {
    advices.push({
      id: "local-streak-good-" + Date.now(),
      type: "positive",
      category: "streak",
      title: `🔥 Серия ${context.stats.currentStreak} дней!`,
      message: "Отличная работа! Вы поддерживаете ежедневную активность уже неделю и более. Продолжайте в том же духе!",
      actionHref: "/review",
      actionLabel: "Записать успех",
      dismissible: true,
      priority: 5,
    })
  }

  // Check habits with low streak
  if (context.habits) {
    const strugglingHabits = context.habits.filter(h => h.streak < 3 && h.totalCompletions > 5)
    if (strugglingHabits.length > 0) {
      const habit = strugglingHabits[0]
      advices.push({
        id: "local-habit-" + Date.now(),
        type: "tip",
      category: "productivity",
        title: `Восстановите привычку "${habit.title}"`,
        message: `У привычки "${habit.title}" сейчас серия ${habit.streak}. Попробуйте связать её с уже существующей рутиной — так проще восстановить регулярность.`,
        actionHref: "/habits",
        actionLabel: "К привычкам",
        dismissible: true,
        priority: 6,
      })
    }
  }

  // Check goals with approaching deadline
  if (context.activeGoals) {
    const now = new Date()
    const urgentGoals = context.activeGoals.filter(g => {
      const deadline = new Date(g.targetDate)
      const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return daysLeft <= 3 && daysLeft >= 0 && g.progress < 80
    })
    
    if (urgentGoals.length > 0) {
      const goal = urgentGoals[0]
      advices.push({
        id: "local-goal-" + Date.now(),
        type: "warning",
      category: "streak",
        title: `Близится дедлайн: ${goal.title}`,
        message: `До дедлайна цели "${goal.title}" осталось менее 3 дней, а прогресс ${goal.progress}%. Рекомендую разбить оставшуюся работу на мелкие задачи и выполнить хотя бы часть.`,
        actionHref: "/goals",
        actionLabel: "К целям",
        dismissible: true,
        priority: 8,
      })
    }
  }

  // Check today's tasks
  if (context.todaysTasks) {
    const completed = context.todaysTasks.filter(t => t.status === 'completed').length
    const total = context.todaysTasks.length
    
    if (total > 0 && completed === 0) {
      advices.push({
        id: "local-tasks-" + Date.now(),
        type: "tip",
      category: "productivity",
        title: "Начните с малого",
        message: `У вас ${total} задач на сегодня. Выберите самую простую и выполните её — это даст импульс для остальных.`,
        actionHref: "/tasks",
        actionLabel: "К задачам",
        dismissible: true,
        priority: 5,
      })
    } else if (total > 0 && completed === total) {
      advices.push({
        id: "local-tasks-done-" + Date.now(),
        type: "positive",
      category: "streak",
        title: "✅ Все задачи выполнены!",
        message: "Отличная работа! Вы справились со всеми задачами на сегодня. Можете отдохнуть или поработать над привычками.",
        actionHref: "/review",
        actionLabel: "Записать день",
        dismissible: true,
        priority: 4,
      })
    }
  }

  // Check skills needing attention
  if (context.skills) {
    const inactiveSkills = context.skills.filter(s => {
      const lastActivity = new Date(s.lastActivityDate || Date.now())
      const daysInactive = Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
      return daysInactive > 5 && s.currentLevel < 5
    })
    
    if (inactiveSkills.length > 0) {
      const skill = inactiveSkills[0]
      advices.push({
        id: "local-skill-" + Date.now(),
        type: "tip",
      category: "productivity",
        title: `Потренируйте "${skill.name}"`,
        message: `Навык "${skill.name}" не прокачивался несколько дней. Потратьте 15 минут на практику — это сохранит прогресс и предотвратит деградацию.`,
        actionHref: "/skills",
        actionLabel: "К навыкам",
        dismissible: true,
        priority: 5,
      })
    }
  }

  // Check coins for wish
  if (context.stats && context.stats.coins > 0) {
    // Simple encouragement for having coins
    if (context.stats.coins >= 100) {
      advices.push({
        id: "local-coins-" + Date.now(),
        type: "positive",
      category: "streak",
        title: `💰 ${context.stats.coins} монет!`,
        message: "У вас накопилось достаточно монет. Можете купить награду в магазине или продолжить копить на большую цель.",
        actionHref: "/shop",
        actionLabel: "В магазин",
        dismissible: true,
        priority: 3,
      })
    }
  }

  // No active goals — nudge to create one
  if ((!context.activeGoals || context.activeGoals.length === 0) && advices.length < 2) {
    advices.push({
      id: "local-no-goals-" + Date.now(),
      type: "tip",
      category: "productivity",
      title: "Поставь первую цель",
      message: "Без цели задачи теряют смысл. Определи одно желаемое достижение — даже самое маленькое. Это придаст направление всем дальнейшим действиям.",
      actionHref: "/goals",
      actionLabel: "Создать цель",
      dismissible: true,
      priority: 6,
    })
  }

  // Low activity — no tasks today and no habits scheduled
  const hasTasksToday = context.todaysTasks && context.todaysTasks.length > 0
  const hasHabitsToday = context.todaysHabits && (context.todaysHabits as unknown[]).length > 0
  if (!hasTasksToday && !hasHabitsToday && advices.length < 2) {
    advices.push({
      id: "local-low-activity-" + Date.now(),
      type: "warning",
      category: "streak",
      title: "День без плана",
      message: "На сегодня нет ни задач, ни привычек. Добавь хотя бы одно действие — маленький шаг лучше, чем бездействие.",
      actionHref: "/tasks",
      actionLabel: "Добавить задачу",
      dismissible: true,
      priority: 5,
    })
  }

  // Default tip if no other advice
  if (advices.length === 0) {
    advices.push({
      id: "local-default-" + Date.now(),
      type: "tip",
      category: "productivity",
      title: "Время для рефлексии",
      message: "Запишите, что получилось сегодня хорошо. Рефлексия помогает лучше понимать свой прогресс и сохранять мотивацию.",
      actionHref: "/review",
      actionLabel: "Записать успех",
      dismissible: true,
      priority: 2,
    })
  }

  // Sort by priority descending
  return advices.sort((a, b) => (b.priority || 0) - (a.priority || 0)).slice(0, 3)
}
