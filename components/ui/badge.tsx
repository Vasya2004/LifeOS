import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * LifeOS Badge - Deep Purple Theme
 */

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        // Default - subtle gray
        default: 'bg-white/[0.08] text-[#9ca3af] border border-white/[0.08]',
        
        // Secondary
        secondary: 'bg-white/[0.05] text-[#9ca3af]',
        
        // Outline
        outline: 'text-[#9ca3af] border border-white/[0.15]',
        
        // Destructive
        destructive: 'bg-red-500/15 text-red-400 border border-red-500/20',
        
        // Primary (deep purple)
        primary: 'bg-[#8b5cf6]/15 text-[#8b5cf6] border border-[#8b5cf6]/20',
        
        // Gamification
        xp: 'bg-[#8b5cf6]/15 text-[#8b5cf6] border border-[#8b5cf6]/20',
        coin: 'bg-[#a855f7]/15 text-[#a855f7] border border-[#a855f7]/20',
        streak: 'bg-[#f97316]/15 text-[#f97316] border border-[#f97316]/20',
        success: 'bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/20',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

// Helper components for gamification
export function XpBadge({ value, className }: { value: number; className?: string }) {
  return (
    <Badge variant="xp" className={className}>
      <span className="mr-1">⚡</span>
      {value} XP
    </Badge>
  )
}

export function CoinBadge({ value, className }: { value: number; className?: string }) {
  return (
    <Badge variant="coin" className={className}>
      <span className="mr-1">🪙</span>
      {value}
    </Badge>
  )
}

export function StreakBadge({ value, className }: { value: number; className?: string }) {
  return (
    <Badge variant="streak" className={className}>
      <span className="mr-1">🔥</span>
      {value}
    </Badge>
  )
}

export { Badge, badgeVariants }
