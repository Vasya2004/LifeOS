import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * LifeOS Button - Deep Purple Theme
 * Primary: #8b5cf6
 */

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap ' +
  'rounded-lg text-sm font-medium transition-all duration-200 ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6] focus-visible:ring-offset-2 focus-visible:ring-offset-black ' +
  'disabled:pointer-events-none disabled:opacity-50 ' +
  'active:scale-[0.98]',
  {
    variants: {
      variant: {
        // Primary: Deep Purple
        default: [
          'bg-[#8b5cf6] text-white',
          'hover:bg-[#7c3aed]',
        ].join(' '),
        
        // Secondary
        secondary: [
          'bg-white/[0.08] text-white',
          'border border-white/[0.08]',
          'hover:bg-white/[0.12] hover:border-white/[0.12]',
        ].join(' '),
        
        // Outline
        outline: [
          'bg-transparent text-white',
          'border border-white/[0.15]',
          'hover:bg-white/[0.05] hover:border-white/[0.2]',
        ].join(' '),
        
        // Ghost
        ghost: [
          'bg-transparent text-[#9ca3af]',
          'hover:text-white hover:bg-white/[0.05]',
        ].join(' '),
        
        // Destructive
        destructive: [
          'bg-red-500 text-white',
          'hover:bg-red-600',
        ].join(' '),
        
        // Gamification
        xp: [
          'bg-[#8b5cf6] text-white',
          'hover:bg-[#7c3aed]',
        ].join(' '),
        
        coin: [
          'bg-[#a855f7] text-white',
          'hover:bg-[#9333ea]',
        ].join(' '),
        
        streak: [
          'bg-[#f97316] text-white',
          'hover:bg-[#ea580c]',
        ].join(' '),
        
        success: [
          'bg-[#22c55e] text-white',
          'hover:bg-[#16a34a]',
        ].join(' '),
      },
      
      size: {
        sm: 'h-8 px-3 text-xs',
        default: 'h-10 px-4',
        lg: 'h-11 px-6',
        icon: 'h-10 w-10 p-2',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : (
          children
        )}
      </Comp>
    )
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants }
