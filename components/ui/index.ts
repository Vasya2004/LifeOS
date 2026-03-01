// ============================================
// LifeOS UI Components
// ============================================
// 
// Единая точка входа для всех UI компонентов
// 
// ============================================

// Buttons
export { Button, buttonVariants } from './button'
export type { ButtonProps } from './button'

// Cards
export { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent,
} from './card'

// Badges
export { 
  Badge, 
  badgeVariants,
  XpBadge,
  CoinBadge,
  StreakBadge,
} from './badge'
export type { BadgeProps } from './badge'

// Progress
export { 
  Progress, 
  progressVariants,
  XpProgress,
  HealthProgress,
  TasksProgress,
  GoalProgress,
} from './progress'
export type { ProgressProps } from './progress'

// Skeleton
export { 
  Skeleton,
  SkeletonCard,
  SkeletonList,
  SkeletonStats,
  SkeletonTable,
  SkeletonProfile,
} from './skeleton'

// Re-exports from shadcn
export * from './alert-dialog'
export * from './alert'
export * from './avatar'
export * from './calendar'
export * from './checkbox'
export * from './collapsible'
export * from './command'
export * from './dialog'
export * from './dropdown-menu'
export * from './form'
export * from './input'
export * from './label'
export * from './popover'
export * from './radio-group'
export * from './select'
export * from './separator'
export * from './sheet'
export * from './switch'
export * from './table'
export * from './tabs'
export * from './textarea'
export * from './toast'
export * from './tooltip'
