import { useEffect, useState } from 'react'

interface ConfettiProps {
  /** Trigger key — change to replay the animation. */
  trigger: number
  /** Number of confetti particles. */
  count?: number
  /** Optional message shown at the top. */
  message?: string
}

const COLORS = ['#FF7A45', '#FFD43B', '#36CFC9', '#8B5CF6', '#EC4899', '#10B981']

/**
 * Lightweight CSS-only confetti. No canvas; no dependency. Renders fixed to
 * the viewport so it works over any background. Auto-disposes after 1.6 s.
 */
export default function Confetti({ trigger, count = 60, message }: ConfettiProps) {
  const [pieces, setPieces] = useState<Array<{ id: number; left: number; color: string; delay: number }>>([])

  useEffect(() => {
    if (!trigger) return
    const next = Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 0.3,
    }))
    setPieces(next)
    const t = setTimeout(() => setPieces([]), 1600)
    return () => clearTimeout(t)
  }, [trigger, count])

  if (pieces.length === 0) return null

  return (
    <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
      {message && (
        <div className="absolute inset-x-0 top-[20%] text-center text-zh-3xl font-black text-amber-500 drop-shadow-[0_4px_8px_rgba(0,0,0,0.15)] animate-spring-in">
          🎉 {message} 🎉
        </div>
      )}
      {pieces.map((p) => (
        <span
          key={p.id}
          className="absolute top-0 w-2 h-3 rounded-sm animate-confetti-pop"
          style={{
            left: `${p.left}%`,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  )
}