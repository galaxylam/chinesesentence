import { cn } from '../../lib/utils'

interface StarChallengeProps {
  earned: 1 | 2 | 3
}

const STARS = [
  { label: '三詞齊全', threshold: 1 },
  { label: '結構位置', threshold: 2 },
  { label: '加入細節', threshold: 3 },
]

export default function StarChallenge({ earned }: StarChallengeProps) {
  return (
    <div className="flex items-end justify-center gap-4">
      {STARS.map((s, i) => {
        const filled = earned >= s.threshold
        return (
          <div key={s.label} className="flex flex-col items-center gap-1">
            <div
              className={cn(
                'text-4xl transition-all duration-300',
                filled
                  ? 'text-accent scale-110 drop-shadow-[0_2px_4px_rgba(255,212,59,0.6)]'
                  : 'text-slate-300',
                filled && 'animate-spring-in',
              )}
              style={{ animationDelay: `${i * 120}ms` }}
            >
              {filled ? '⭐' : '☆'}
            </div>
            <div
              className={cn(
                'text-xs font-bold',
                filled ? 'text-amber-700' : 'text-slate-400',
              )}
            >
              {s.label}
            </div>
          </div>
        )
      })}
    </div>
  )
}