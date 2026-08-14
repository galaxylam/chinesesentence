import type { BonusChallenge } from '../../types'
import { cn } from '../../lib/utils'

interface BonusChallengeChipProps {
  bonus: BonusChallenge
  className?: string
}

/**
 * Small chip showing the optional bonus challenge for this round.
 * Pure display — the AI scorer decides if it was satisfied.
 */
export default function BonusChallengeChip({
  bonus,
  className,
}: BonusChallengeChipProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-2xl border-2 border-dashed border-accent/60',
        'bg-accent/10 px-3 py-2 text-sm font-bold text-amber-800',
        className,
      )}
    >
      <span aria-hidden>🎯</span>
      <span>Bonus：{bonus.label}</span>
    </div>
  )
}