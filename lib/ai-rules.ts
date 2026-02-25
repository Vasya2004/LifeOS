// ============================================
// AI ADVISOR RULES ENGINE
// 18 правил If/Then без внешних API
// ============================================

import type { Task, Habit, Goal, Skill } from "@/lib/types"
import type { AIAdvice } from "@/lib/types/dashboard.types"

export interface AIRulesInput {
  tasks: Task[] | undefined
  habits: Habit[] | undefined
  goals: Goal[] | undefined
  skills: Skill[] | undefined
  stats: {
    currentStreak: number
    longestStreak: number
    level: number
    xp: number
    totalTasksCompleted: number
  } | undefined
  financialStats: {
    savingsRate: number
    netWorth: number
    monthlyExpenses: number
    monthlyIncome: number
  } | undefined
  healthStats: {
    healthScore: number
    red: number
    yellow: number
  } | undefined
}

export function generateAIAdvice(input: AIRulesInput): AIAdvice[] {
  const advice: AIAdvice[] = []
  const now = new Date()
  const hour = now.getHours()

  const tasks = input.tasks ?? []
  const habits = input.habits ?? []
  const goals = input.goals ?? []
  const skills = input.skills ?? []
  const stats = input.stats
  const fin = input.financialStats
  const health = input.healthStats

  const today = new Date().toISOString().split("T")[0]
  const completedToday = tasks.filter(
    (t) => t.status === "completed" && t.completedAt?.startsWith(today)
  ).length
  const pendingHighPriority = tasks.filter(
    (t) => (t.priority === "high" || t.priority === "critical") && t.status !== "completed"
  )
  const activeTasks = tasks.filter((t) => t.status !== "completed")
  const activeGoals = goals.filter((g) => g.status === "active")
  const allHabitsCompleted =
    habits.length > 0 && habits.every((h) => h.streak > 0)
  const decayingSkills = skills.filter((s) => s.isDecaying)
  const brokenStreakHabits = habits.filter(
    (h) => h.streak === 0 && h.bestStreak >= 3
  )

  // ── Продуктивность ─────────────────────────────────────────────────

  // P1: Нулевой день (вечером, ничего не сделано)
  if (completedToday === 0 && hour >= 17 && tasks.length > 0) {
    advice.push({
      id: "zero-day",
      type: "urgent",
      category: "productivity",
      title: "Нулевой день?",
      message: "Сегодня ещё ни одной выполненной задачи. Выберите одну — самую маленькую — и закройте её прямо сейчас.",
      actionLabel: "Открыть задачи",
      actionHref: "/tasks",
      dismissible: true,
    })
  }

  // P2: Слишком много важных задач
  if (pendingHighPriority.length >= 5) {
    advice.push({
      id: "too-many-high",
      type: "warning",
      category: "productivity",
      title: "Очередь важных задач растёт",
      message: `${pendingHighPriority.length} задач высокого приоритета ждут. Примените метод "Ешь лягушку" — закройте самую неприятную утром.`,
      actionLabel: "К задачам",
      actionHref: "/tasks",
      dismissible: true,
    })
  }

  // P3: Хороший день (5+ задач)
  if (completedToday >= 5) {
    advice.push({
      id: "great-day",
      type: "positive",
      category: "productivity",
      title: "Продуктивный день!",
      message: `Вы выполнили ${completedToday} задач сегодня. Отличный результат — не забудьте сделать ежедневный обзор.`,
      actionLabel: "Обзор дня",
      actionHref: "/review",
      dismissible: true,
    })
  }

  // P4: Нет целей — нет направления
  if (activeGoals.length === 0 && tasks.length > 0) {
    advice.push({
      id: "no-goals",
      type: "tip",
      category: "productivity",
      title: "Задачи есть, цели — нет",
      message: "Вы выполняете задачи, но без целей трудно понять, куда движетесь. Создайте хотя бы одну главную цель.",
      actionLabel: "Создать цель",
      actionHref: "/goals",
      dismissible: true,
    })
  }

  // P5: Утренний буст (с 6 до 10)
  if (hour >= 6 && hour <= 10 && activeTasks.length > 0) {
    advice.push({
      id: "morning-boost",
      type: "tip",
      category: "productivity",
      title: "Утренний пик — лучшее время",
      message: "Ваш когнитивный ресурс на максимуме. Начните с самой сложной задачи — всё остальное будет легче.",
      dismissible: true,
    })
  }

  // ── Стрик ────────────────────────────────────────────────────────

  // S1: Стрик прерван (был длинный)
  if (stats && stats.currentStreak === 0 && stats.longestStreak >= 3) {
    advice.push({
      id: "streak-broken",
      type: "urgent",
      category: "streak",
      title: "Стрик прерван",
      message: `Ваш рекорд серии — ${stats.longestStreak} дней. Восстановите стрик сегодня — зайдите и выполните любое действие.`,
      dismissible: false,
    })
  }

  // S2: Стрик 7+ дней
  if (stats && stats.currentStreak >= 7) {
    advice.push({
      id: "streak-7",
      type: "positive",
      category: "streak",
      title: `🔥 ${stats.currentStreak} дней подряд!`,
      message: "Отличная серия! Постоянство — это сила. Не прерывайте цепочку сегодня.",
      dismissible: true,
    })
  }

  // S3: Привычка сломана (была серия)
  if (brokenStreakHabits.length > 0) {
    const h = brokenStreakHabits[0]
    advice.push({
      id: `habit-broken-${h.id}`,
      type: "warning",
      category: "streak",
      title: "Привычка прервана",
      message: `"${h.title}" — серия в ${h.bestStreak} дней прервана. Правило: никогда не пропускай дважды. Выполните сегодня.`,
      actionLabel: "К привычкам",
      actionHref: "/habits",
      dismissible: true,
    })
  }

  // ── Здоровье ────────────────────────────────────────────────────

  // H1: Красные зоны тела
  if (health && health.red >= 2) {
    advice.push({
      id: "health-red-zones",
      type: "urgent",
      category: "health",
      title: "Внимание: здоровье",
      message: `${health.red} зон тела требуют внимания. Отметьте приоритет здоровья: даже короткая прогулка или растяжка имеет значение.`,
      actionLabel: "Здоровье",
      actionHref: "/health",
      dismissible: true,
    })
  }

  // H2: Все зоны зелёные
  if (health && health.healthScore === 100 && health.red === 0) {
    advice.push({
      id: "health-perfect",
      type: "positive",
      category: "health",
      title: "Здоровье в норме",
      message: "Все зоны тела — зелёные. Отличная работа по поддержанию физического состояния!",
      dismissible: true,
    })
  }

  // H3: Жёлтые зоны — предупреждение
  if (health && health.yellow >= 3 && health.red === 0) {
    advice.push({
      id: "health-yellow",
      type: "warning",
      category: "health",
      title: "Здоровье под наблюдением",
      message: `${health.yellow} зон тела в жёлтом статусе. Обратите внимание до того, как они станут красными.`,
      actionLabel: "Обновить статус",
      actionHref: "/health",
      dismissible: true,
    })
  }

  // H4: Все привычки выполнены
  if (allHabitsCompleted) {
    advice.push({
      id: "habits-all-done",
      type: "positive",
      category: "health",
      title: "Все привычки выполнены!",
      message: "Все привычки закрыты на сегодня. Вы строите систему — это важнее мотивации.",
      dismissible: true,
    })
  }

  // ── Финансы ──────────────────────────────────────────────────────

  // F1: Низкая норма сбережений
  if (fin && fin.monthlyIncome > 0 && fin.savingsRate < 0.1) {
    advice.push({
      id: "low-savings",
      type: "warning",
      category: "finance",
      title: "Накопления ниже нормы",
      message: `Текущая норма сбережений: ${Math.round(fin.savingsRate * 100)}%. Рекомендуется минимум 10%. Попробуйте автоматизировать перевод в день зарплаты.`,
      actionLabel: "Финансы",
      actionHref: "/finance",
      dismissible: true,
    })
  }

  // F2: Хорошая норма сбережений
  if (fin && fin.savingsRate >= 0.2) {
    advice.push({
      id: "good-savings",
      type: "positive",
      category: "finance",
      title: "Сбережения на хорошем уровне",
      message: `Вы откладываете ${Math.round(fin.savingsRate * 100)}% дохода. Отличная финансовая дисциплина!`,
      dismissible: true,
    })
  }

  // F3: Нет финансовых данных
  if (fin && fin.monthlyIncome === 0 && fin.monthlyExpenses === 0) {
    advice.push({
      id: "no-finance-data",
      type: "tip",
      category: "finance",
      title: "Финансы не отслеживаются",
      message: "Добавьте первую транзакцию. Контроль финансов начинается с осознанности, а не с дохода.",
      actionLabel: "Добавить транзакцию",
      actionHref: "/finance",
      dismissible: true,
    })
  }

  // ── Навыки ───────────────────────────────────────────────────────

  // K1: Навыки деградируют
  if (decayingSkills.length > 0) {
    advice.push({
      id: "skills-decaying",
      type: "warning",
      category: "skills",
      title: "Навык деградирует",
      message: `"${decayingSkills[0].name}" теряет XP без практики. Потратьте 20 минут сегодня — этого достаточно.`,
      actionLabel: "Навыки",
      actionHref: "/skills",
      dismissible: true,
    })
  }

  // K2: Нет навыков
  if (skills.length === 0 && stats && stats.level >= 3) {
    advice.push({
      id: "no-skills",
      type: "tip",
      category: "skills",
      title: "Создайте свой Skill Tree",
      message: "Вы уже на уровне " + (stats?.level ?? 1) + ", но навыки не заведены. Добавьте 3 ключевых навыка для прокачки.",
      actionLabel: "К навыкам",
      actionHref: "/skills",
      dismissible: true,
    })
  }

  // K3: Быстрый рост навыка
  const highLevelSkills = skills.filter((s) => s.currentLevel >= 5)
  if (highLevelSkills.length > 0) {
    advice.push({
      id: "skill-master",
      type: "positive",
      category: "skills",
      title: "Мастерство растёт",
      message: `"${highLevelSkills[0].name}" достиг уровня ${highLevelSkills[0].currentLevel}. Продолжайте практиковаться для достижения мастерства.`,
      dismissible: true,
    })
  }

  // ── Баланс ───────────────────────────────────────────────────────

  // B1: Нет целей и нет задач (пустой старт)
  if (tasks.length === 0 && goals.length === 0) {
    advice.push({
      id: "empty-start",
      type: "tip",
      category: "balance",
      title: "Начните своё путешествие",
      message: "Добавьте первую задачу или цель. Любой прогресс начинается с первого шага.",
      actionLabel: "Добавить задачу",
      actionHref: "/tasks",
      dismissible: false,
    })
  }

  // B2: Уровень вырос — поздравление
  if (stats && stats.level > 1 && stats.xp < 50) {
    advice.push({
      id: "level-up-recent",
      type: "positive",
      category: "balance",
      title: `Уровень ${stats.level} достигнут!`,
      message: "Поздравляем с повышением уровня! Ваш персонаж эволюционирует. Загляните в магазин за наградой.",
      actionLabel: "Магазин",
      actionHref: "/shop",
      dismissible: true,
    })
  }

  // Возвращаем max 3 совета — приоритет: urgent > warning > tip > positive
  const priorityOrder: Record<string, number> = {
    urgent: 0,
    warning: 1,
    tip: 2,
    positive: 3,
  }

  return advice
    .sort((a, b) => priorityOrder[a.type] - priorityOrder[b.type])
    .slice(0, 3)
}
