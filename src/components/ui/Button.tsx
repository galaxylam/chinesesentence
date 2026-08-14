import { forwardRef } from 'react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  size?: 'md' | 'lg'
  children: ReactNode
}

/**
 * Kid-friendly button — minimum 48×48 px target, large primary is 56 px tall.
 * Rounded-2xl corners, bold text, satisfying press feedback.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { variant = 'primary', size = 'lg', className, children, ...rest },
    ref,
  ) {
    return (
      <button
        ref={ref}
        {...rest}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-2xl font-bold',
          'transition-all duration-150 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed',
          'select-none tap',
          size === 'lg' ? 'h-14 px-6 text-zh-lg' : 'h-11 px-5 text-zh-base',
          variant === 'primary' &&
            'bg-primary text-white shadow-pop hover:bg-primary-dark',
          variant === 'secondary' &&
            'bg-secondary/15 text-cyan-700 hover:bg-secondary/25',
          variant === 'ghost' &&
            'bg-transparent text-slate-600 hover:bg-slate-100',
          variant === 'outline' &&
            'bg-white border-2 border-slate-200 text-slate-700 hover:border-primary hover:text-primary-dark',
          className,
        )}
      >
        {children}
      </button>
    )
  },
)