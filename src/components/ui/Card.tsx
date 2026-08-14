import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  tone?: 'default' | 'soft' | 'accent'
}

/** Rounded-16px card with soft drop shadow. Three tonal variants. */
export default function Card({
  children,
  tone = 'default',
  className,
  ...rest
}: CardProps) {
  return (
    <div
      {...rest}
      className={cn(
        'rounded-3xl p-5',
        tone === 'default' && 'bg-white shadow-card',
        tone === 'soft' && 'bg-white/70 shadow-soft backdrop-blur-sm',
        tone === 'accent' && 'bg-accent/15 shadow-soft border-2 border-accent/40',
        className,
      )}
    >
      {children}
    </div>
  )
}