import type { Difficulty } from '../../types'

interface DifficultyBadgeProps {
  level: Difficulty
  size?: 'sm' | 'md'
}

/**
 * Small chip showing the current level (L1–L5) with a difficulty-appropriate color.
 */
export default function DifficultyBadge({ level, size = 'md' }: DifficultyBadgeProps) {
  const colorByLevel: Record<Difficulty, string> = {
    1: 'bg-green-100 text-green-700 border-green-300',
    2: 'bg-sky-100 text-sky-700 border-sky-300',
    3: 'bg-amber-100 text-amber-700 border-amber-300',
    4: 'bg-orange-100 text-orange-700 border-orange-300',
    5: 'bg-rose-100 text-rose-700 border-rose-300',
  }

  return (
    <span
      className={
        'inline-flex items-center gap-1 rounded-full border font-bold ' +
        (size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm') +
        ' ' +
        colorByLevel[level]
      }
    >
      L{level}
    </span>
  )
}