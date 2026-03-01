// ============================================
// AI PROMPTS FOR LIFEOS
// ============================================

export const SYSTEM_PROMPT = `You are LifeOS AI Advisor - a personalized productivity and life management coach.
You help users achieve their goals, build habits, and maintain life balance through data-driven insights.

Guidelines:
- Be concise but insightful (2-4 sentences max per advice)
- Be encouraging but honest about challenges
- Always suggest concrete, actionable next steps
- Reference specific data points when relevant
- Adapt tone to user's progress (celebrate wins, support struggles)
- Never be judgmental or overly critical
- Focus on progress, not perfection

Context you may receive:
- User stats: level, XP, streaks, coins
- Goals: active, completed, progress
- Tasks: pending, completed, overdue
- Habits: streaks, consistency, recent entries
- Skills: levels, recent activities
- Finance: accounts, budgets, recent transactions
- Health: metrics, recent entries

Advice types you can generate:
- urgent: Requires immediate attention
- warning: Potential issue developing
- tip: Helpful suggestion for improvement
- positive: Recognition of good progress

Always respond in Russian unless explicitly asked otherwise.`

// Prompt templates for different advice types
export const PROMPTS = {
  general: (context: UserContext) => `
Проанализируй текущее состояние пользователя и дай 1-2 конкретных совета:

Статистика:
- Уровень: ${context.stats.level}, XP: ${context.stats.xp}/${context.stats.xpToNext}
- Серия: ${context.stats.currentStreak} дней
- Монет: ${context.stats.coins}

Активные цели: ${context.activeGoals.length}
Задач на сегодня: ${context.todaysTasks.length} (${context.todaysTasks.filter(t => t.status === 'completed').length} выполнено)
Привычек на сегодня: ${context.todaysHabits.length}
Просроченных задач: ${context.overdueTasks.length}

Сформулируй конкретный, действительно полезный совет. Выбери тип: urgent (если есть просроченные), warning (если есть риски), tip (полезный совет), или positive (если всё идёт хорошо).

Ответь в JSON формате:
{
  "type": "urgent|warning|tip|positive",
  "title": "Краткий заголовок",
  "message": "Развёрнутый совет с конкретными шагами",
  "actionLabel": "Текст кнопки действия",
  "priority": 1-10
}`,

  habits: (context: UserContext) => `
Проанализируй привычки пользователя:

Привычки:
${context.habits.map(h => `- ${h.title}: серия ${h.streak}, всего ${h.totalCompletions} выполнений`).join('\n')}

Последние 7 дней:
${context.recentHabitEntries.map(e => `- ${e.date}: ${e.completed ? '✓' : '✗'}`).join('\n')}

Дай конкретный совет по привычкам. Что улучшить? Как поддержать серию? Стоит ли добавить новую привычку?

JSON ответ:
{
  "type": "tip|warning|positive",
  "title": "Заголовок",
  "message": "Совет по привычкам",
  "actionLabel": "Действие"
}`,

  goals: (context: UserContext) => `
Проанализируй прогресс по целям:

Цели:
${context.activeGoals.map(g => `- ${g.title}: ${g.progress}% (дедлайн: ${g.targetDate})`).join('\n')}

Какая цель требует внимания? Какие следующие шаги? 

JSON:
{
  "type": "warning|tip|positive",
  "title": "Заголовок",
  "message": "Совет по целям",
  "priority": 1-10
}`,

  finance: (context: UserContext) => `
Проанализируй финансы:

Счета: ${context.accounts.map(a => `${a.name}: ${a.balance} ${a.currency}`).join(', ')}
Последние транзакции: ${context.recentTransactions.length}
Бюджет: ${context.budgets.map(b => `${b.category}: ${b.limit}`).join(', ')}

Дай финансовый совет. Стоит ли сократить траты? Как сберечь больше?

JSON:
{
  "type": "tip|warning|positive",
  "title": "Финансовый совет",
  "message": "Конкретная рекомендация"
}`,

  health: (context: UserContext) => `
Проанализируй здоровье:

Метрики:
${context.healthMetrics.map(m => `- ${m.type}: ${m.value} ${m.unit} (${m.date})`).join('\n')}

Статус зон тела:
${context.bodyZones.map(z => `- ${z.displayName}: ${z.status}`).join('\n')}

Дай совет по здоровью. На что обратить внимание?

JSON:
{
  "type": "warning|tip|positive",
  "title": "Совет по здоровью",
  "message": "Рекомендация"
}`,

  skills: (context: UserContext) => `
Проанализируй навыки:

Навыки:
${context.skills.map(s => `- ${s.name}: уровень ${s.currentLevel}, XP: ${s.currentXp}/${s.xpNeeded}`).join('\n')}

Недавняя активность:
${context.recentSkillActivities.map(a => `- ${a.description}: +${a.xpAmount} XP`).join('\n')}

Какой навык развивать? Что требует внимания?

JSON:
{
  "type": "tip|positive",
  "title": "Совет по навыкам",
  "message": "Рекомендация"
}`,
}

// Types
export interface UserContext {
  stats: {
    level: number
    xp: number
    xpToNext: number
    currentStreak: number
    coins: number
  }
  activeGoals: Array<{
    title: string
    progress: number
    targetDate: string
  }>
  todaysTasks: Array<{
    title: string
    status: string
  }>
  overdueTasks: Array<{ title: string }>
  habits: Array<{
    title: string
    streak: number
    totalCompletions: number
  }>
  recentHabitEntries: Array<{
    date: string
    completed: boolean
  }>
  accounts: Array<{
    name: string
    balance: number
    currency: string
  }>
  recentTransactions: Array<unknown>
  budgets: Array<{
    category: string
    limit: number
  }>
  healthMetrics: Array<{
    type: string
    value: number
    unit: string
    date: string
  }>
  bodyZones: Array<{
    displayName: string
    status: string
  }>
  skills: Array<{
    name: string
    currentLevel: number
    currentXp: number
    xpNeeded: number
    lastActivityDate?: string
  }>
  recentSkillActivities: Array<{
    description: string
    xpAmount: number
  }>
  todaysHabits: Array<unknown>
}

export interface AIAdviceResponse {
  type: 'urgent' | 'warning' | 'tip' | 'positive'
  category?: 'productivity' | 'health' | 'finance' | 'skills' | 'balance' | 'streak'
  title: string
  message: string
  actionLabel?: string
  priority: number
}
