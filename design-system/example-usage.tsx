// ============================================
// ПРИМЕР ИСПОЛЬЗОВАНИЯ Design System
// ============================================
// 
// Этот файл показывает, как использовать Design System
// на примере реальных компонентов из LifeOS
//
// ============================================

import { cn } from '@/lib/utils'
import { button, card, input, badge, progress, text, layout, gamification, emptyState } from './components'

// ============================================
// 1. КНОПКИ
// ============================================

// Обычная кнопка
export function PrimaryButton({ children, onClick, size = 'md' }: any) {
  return (
    <button 
      className={cn(button.base, button.variants.primary, button.sizes[size])}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

// Кнопка с XP (для геймификации)
export function XpButton({ xp, children }: { xp: number; children: React.ReactNode }) {
  return (
    <button className={cn(button.base, button.variants.xp, button.sizes.md)}>
      <span>+{xp} XP</span>
      {children}
    </button>
  )
}

// Кнопка-иконка
export function IconButton({ icon, onClick }: { icon: React.ReactNode; onClick?: () => void }) {
  return (
    <button 
      className={cn(button.base, button.variants.ghost, button.sizes.icon)}
      onClick={onClick}
    >
      {icon}
    </button>
  )
}

// ============================================
// 2. КАРТОЧКИ
// ============================================

// Карточка задачи
export function TaskCard({ title, completed, priority }: any) {
  return (
    <div className={cn(card.base, card.variants.interactive, card.padding.md)}>
      <div className="flex items-start gap-3">
        <input type="checkbox" checked={completed} className="mt-1" />
        <div className="flex-1">
          <h4 className={cn(text.h4, completed && 'line-through opacity-50')}>
            {title}
          </h4>
        </div>
        <span className={cn(badge.base, badge.variants[priority as keyof typeof badge.variants])}>
          {priority}
        </span>
      </div>
    </div>
  )
}

// Карточка статистики
export function StatCard({ title, value, change, trend }: any) {
  return (
    <div className={cn(card.base, card.variants.elevated, card.padding.lg)}>
      <p className={text.caption}>{title}</p>
      <p className={cn(text.h2, 'mt-1')}>{value}</p>
      <div className="flex items-center gap-1 mt-2">
        <span className={trend === 'up' ? text.success : text.error}>
          {trend === 'up' ? '↑' : '↓'} {change}
        </span>
        <span className={text.caption}>vs прошлая неделя</span>
      </div>
    </div>
  )
}

// Карточка навыка
export function SkillCard({ name, level, progress: progressValue }: any) {
  return (
    <div className={cn(card.base, card.variants.default, card.padding.md)}>
      <div className="flex items-center justify-between mb-3">
        <h4 className={text.h4}>{name}</h4>
        <span className={cn(badge.base, badge.variants.xp)}>Lv. {level}</span>
      </div>
      <div className={progress.base}>
        <div 
          className={cn(progress.bar, progress.variants.xp)} 
          style={{ width: `${progressValue}%` }}
        />
      </div>
      <p className={cn(text.caption, 'mt-2')}>
        {progressValue}% до следующего уровня
      </p>
    </div>
  )
}

// ============================================
// 3. ФОРМЫ
// ============================================

// Поле ввода с лейблом
export function FormInput({ 
  label, 
  placeholder, 
  error,
  type = 'text' 
}: any) {
  return (
    <div className="space-y-2">
      <label className={text.label}>
        {label}
      </label>
      <input 
        type={type}
        placeholder={placeholder}
        className={cn(
          input.base, 
          input.sizes.md,
          error && input.states.error
        )}
      />
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  )
}

// ============================================
// 4. ГЕЙМИФИКАЦИЯ
// ============================================

// Блок XP с прогрессом
export function XpProgress({ current, max, level }: any) {
  const progressValue = (current / max) * 100
  
  return (
    <div className={cn(card.base, card.variants.primary, card.padding.md)}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={cn(gamification.levelBadge, 'w-8 h-8 text-sm')}>
            {level}
          </span>
          <span className={text.h4}>Уровень</span>
        </div>
        <span className={cn(text.bodySm, 'text-indigo-300')}>
          {current} / {max} XP
        </span>
      </div>
      <div className={gamification.xpBar.container}>
        <div 
          className={cn(gamification.xpBar.fill, gamification.xpBar.glow)}
          style={{ width: `${progressValue}%` }}
        />
      </div>
    </div>
  )
}

// Дисплей монет
export function CoinDisplay({ amount }: { amount: number }) {
  return (
    <div className={gamification.coin.container}>
      <span className={gamification.coin.icon}>💰</span>
      <span className={gamification.coin.value}>
        {amount.toLocaleString()}
      </span>
    </div>
  )
}

// Дисплей стрика
export function StreakDisplay({ days }: { days: number }) {
  return (
    <div className={gamification.streak.container}>
      <span className={cn(gamification.streak.icon, days > 7 && gamification.streak.fire)}>
        🔥
      </span>
      <span className={gamification.streak.value}>
        {days} дней
      </span>
    </div>
  )
}

// ============================================
// 5. ПУСТЫЕ СОСТОЯНИЯ
// ============================================

// Пустое состояние для списка
export function EmptyTasks({ onCreate }: { onCreate: () => void }) {
  return (
    <div className={emptyState.base}>
      <div className={emptyState.icon}>📋</div>
      <h3 className={emptyState.title}>Нет задач</h3>
      <p className={emptyState.description}>
        Создайте свою первую задачу, чтобы начать продуктивный день
      </p>
      <button 
        className={cn(button.base, button.variants.primary, button.sizes.md)}
        onClick={onCreate}
      >
        Создать задачу
      </button>
    </div>
  )
}

// Пустое состояние для достижений
export function EmptyAchievements() {
  return (
    <div className={emptyState.base}>
      <div className={emptyState.icon}>🏆</div>
      <h3 className={emptyState.title}>Пока нет достижений</h3>
      <p className={emptyState.description}>
        Выполняйте задачи и привычки, чтобы получать достижения
      </p>
    </div>
  )
}

// ============================================
// 6. СЕТКИ И РАЗМЕТКА
// ============================================

// Grid для карточек
export function StatsGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className={layout.grid[4]}>
      {children}
    </div>
  )
}

// Страница с контейнером
export function PageContainer({ children, title }: any) {
  return (
    <div className={layout.page}>
      <div className={layout.container}>
        <div className={layout.section}>
          <h1 className={text.h1}>{title}</h1>
          <div className="mt-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

// Stack для вертикального расположения
export function Stack({ children, gap = 4 }: { children: React.ReactNode; gap?: 1 | 2 | 3 | 4 | 6 | 8 }) {
  return (
    <div className={layout.stack[gap]}>
      {children}
    </div>
  )
}

// ============================================
// 7. ПОЛНЫЙ ПРИМЕР СТРАНИЦЫ
// ============================================

export function ExampleDashboard() {
  return (
    <PageContainer title="Дашборд">
      {/* XP и валюта */}
      <div className={layout.grid[2]}>
        <XpProgress current={750} max={1000} level={12} />
        <div className={cn(card.base, card.variants.default, card.padding.md)}>
          <div className="flex items-center justify-around">
            <CoinDisplay amount={1250} />
            <StreakDisplay days={7} />
          </div>
        </div>
      </div>

      {/* Статистика */}
      <StatsGrid>
        <StatCard title="Задач выполнено" value="24" change="12%" trend="up" />
        <StatCard title="Привычек" value="5" change="2" trend="up" />
        <StatCard title="Уровень навыков" value="156" change="8%" trend="up" />
        <StatCard title="Доход" value="₽45,000" change="5%" trend="down" />
      </StatsGrid>

      {/* Навыки */}
      <div className={layout.grid[3]}>
        <SkillCard name="Программирование" level={15} progress={65} />
        <SkillCard name="Фитнес" level={8} progress={40} />
        <SkillCard name="Чтение" level={12} progress={80} />
      </div>

      {/* Пустое состояние (пример) */}
      <EmptyTasks onCreate={() => console.log('create')} />
    </PageContainer>
  )
}

// ============================================
// ЭКСПОРТЫ
// ============================================

export {
  PrimaryButton,
  XpButton,
  IconButton,
  TaskCard,
  StatCard,
  SkillCard,
  FormInput,
  XpProgress,
  CoinDisplay,
  StreakDisplay,
  EmptyTasks,
  EmptyAchievements,
  StatsGrid,
  PageContainer,
  Stack,
  ExampleDashboard,
}
