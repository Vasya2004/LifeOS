import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

/**
 * LifeOS Progress Component
 * 
 * Прогресс-бар для отображения прогресса:
 * - XP прогресс (с градиентом и glow)
 * - Здоровье (зелёный)
 * - Задачи/цели (стандартный)
 * - Привычки
 * 
 * @example
 * ```tsx
 * // XP прогресс
 * <Progress value={65} variant="xp" max={100} label="750 / 1000 XP" />
 * 
 * // Health
 * <Progress value={80} variant="health" />
 * 
 * // С меткой
 * <Progress value={45} label="45%" />
 * 
 * // Размеры
 * <Progress value={50} size="sm" />
 * <Progress value={50} size="lg" />
 * ```
 */

const progressVariants = cva(
  'relative w-full overflow-hidden rounded-full bg-slate-800',
  {
    variants: {
      variant: {
        default: '',
        xp: '',
        health: '',
        success: '',
        warning: '',
        error: '',
      },
      size: {
        sm: 'h-1.5',
        default: 'h-2',
        lg: 'h-3',
        xl: 'h-4',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

const progressBarVariants = cva(
  'h-full w-full flex-1 transition-all duration-500 ease-out',
  {
    variants: {
      variant: {
        default: 'bg-[#8b5cf6]',
        xp: 'bg-gradient-to-r from-[#8b5cf6] via-[#a78bfa] to-[#c4b5fd] shadow-[0_0_10px_rgba(139,92,246,0.5)]',
        health: 'bg-gradient-to-r from-emerald-500 to-teal-500',
        success: 'bg-emerald-500',
        warning: 'bg-amber-500',
        error: 'bg-red-500',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface ProgressProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressVariants> {
  value: number
  max?: number
  label?: string
  showValue?: boolean
  animated?: boolean
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ 
    className, 
    value, 
    max = 100,
    label,
    showValue = false,
    animated = true,
    variant,
    size,
    ...props 
  }, ref) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100))
    
    return (
      <div className="w-full space-y-2">
        {/* Label row */}
        {(label || showValue) && (
          <div className="flex justify-between text-sm">
            {label && (
              <span className="text-slate-300">{label}</span>
            )}
            {showValue && (
              <span className="text-slate-400 font-medium">
                {Math.round(percentage)}%
              </span>
            )}
          </div>
        )}
        
        {/* Progress bar */}
        <div
          ref={ref}
          className={cn(progressVariants({ variant, size }), className)}
          {...props}
        >
          <div
            className={cn(
              progressBarVariants({ variant }),
              animated && 'transition-all duration-500'
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    )
  }
)

Progress.displayName = 'Progress'

export { Progress, progressVariants }

/**
 * Специализированные прогресс-бары для геймификации
 */

// XP Progress с уровнем
export function XpProgress({ 
  current, 
  max, 
  level,
  showLabel = true,
}: { 
  current: number
  max: number
  level: number
  showLabel?: boolean
}) {
  const percentage = (current / max) * 100
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-[#7c3aed] to-purple-600 text-white font-bold text-sm">
            {level}
          </span>
          <span className="text-slate-200 font-medium">Уровень</span>
        </div>
        {showLabel && (
          <span className="text-sm text-indigo-300">
            {current} / {max} XP
          </span>
        )}
      </div>
      <Progress value={current} max={max} variant="xp" size="lg" animated />
    </div>
  )
}

// Прогресс здоровья
export function HealthProgress({ 
  current, 
  max = 100,
  label,
}: { 
  current: number
  max?: number
  label?: string
}) {
  return (
    <Progress 
      value={current} 
      max={max} 
      variant="health" 
      label={label || `Здоровье: ${current}%`}
      showValue
    />
  )
}

// Прогресс задач
export function TasksProgress({ 
  completed, 
  total,
}: { 
  completed: number
  total: number
}) {
  const percentage = total > 0 ? (completed / total) * 100 : 0
  
  return (
    <Progress 
      value={completed} 
      max={total} 
      variant="default"
      label={`Задач выполнено: ${completed} / ${total}`}
      showValue
    />
  )
}

// Прогресс цели
export function GoalProgress({ 
  current, 
  target,
  title,
}: { 
  current: number
  target: number
  title: string
}) {
  const percentage = target > 0 ? (current / target) * 100 : 0
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-slate-300">{title}</span>
        <span className="text-slate-400">
          {current.toLocaleString()} / {target.toLocaleString()}
        </span>
      </div>
      <Progress 
        value={current} 
        max={target} 
        variant={percentage >= 100 ? 'success' : 'default'}
        size="lg"
      />
    </div>
  )
}
