import { cn } from '@/lib/utils'

/**
 * LifeOS Skeleton Component - Deep Purple Theme
 * 
 * Плейсхолдер для загрузки контента.
 * Показывает анимированный "скелет" пока данные загружаются.
 * 
 * @example
 * ```tsx
 * // Простой скелетон
 * <Skeleton className="h-4 w-[250px]" />
 * 
 * // Карточка со скелетоном
 * <Card>
 *   <Skeleton className="h-12 w-12 rounded-full" />
 *   <div className="space-y-2">
 *     <Skeleton className="h-4 w-[200px]" />
 *     <Skeleton className="h-4 w-[150px]" />
 *   </div>
 * </Card>
 * 
 * // Скелетон с эффектом shimmer
 * <Skeleton className="h-32 w-full" shimmer />
 * ```
 */

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Эффект shimmer вместо pulse */
  shimmer?: boolean
}

function Skeleton({ 
  className, 
  shimmer = false,
  ...props 
}: SkeletonProps) {
  return (
    <div
      className={cn(
        'bg-slate-800/50',
        'rounded-md',
        shimmer 
          ? [
              'relative',
              'overflow-hidden',
              'before:absolute before:inset-0',
              'before:-translate-x-full',
              'before:animate-[shimmer_2s_infinite]',
              'before:bg-gradient-to-r',
              'before:from-transparent before:via-slate-700/50 before:to-transparent',
            ].join(' ')
          : 'animate-pulse',
        className
      )}
      {...props}
    />
  )
}

/**
 * Готовые паттерны скелетонов для частых случаев
 */

// Скелетон карточки
function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-xl border border-slate-800 bg-slate-900/50 p-6', className)}>
      <div className="flex items-start gap-4">
        <Skeleton className="h-12 w-12 rounded-lg" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  )
}

// Скелетон списка
function SkeletonList({ count = 5, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-3 w-[150px]" />
          </div>
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      ))}
    </div>
  )
}

// Скелетон статистики
function SkeletonStats({ count = 4, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-16 mb-1" />
          <Skeleton className="h-3 w-20" />
        </div>
      ))}
    </div>
  )
}

// Скелетон таблицы
function SkeletonTable({ rows = 5, cols = 4, className }: { rows?: number; cols?: number; className?: string }) {
  return (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      <div className="flex gap-4 pb-3 border-b border-slate-800">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-5 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 py-2">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

// Скелетон профиля
function SkeletonProfile({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-4', className)}>
      <Skeleton className="h-16 w-16 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-5 w-[150px]" />
        <Skeleton className="h-4 w-[100px]" />
      </div>
    </div>
  )
}

export { 
  Skeleton, 
  SkeletonCard, 
  SkeletonList, 
  SkeletonStats, 
  SkeletonTable,
  SkeletonProfile 
}
