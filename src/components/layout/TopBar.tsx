interface TopBarProps {
  score?: number
  streak?: number
  level?: number
}

/**
 * TopBar — sticky header with logo, current score, streak, and level badge.
 * Stays ≤48 px tall on mobile; shows placeholder chips when no game is active.
 */
export default function TopBar({ score, streak, level }: TopBarProps) {
  return (
    <header className="sticky top-0 z-20 safe-top bg-cream/85 backdrop-blur-md border-b border-slate-200/60">
      <div className="w-full max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden>✏️</span>
          <span className="font-black text-zh-lg text-slate-800">
            三詞造句
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          {score !== undefined && (
            <span className="px-2 py-1 rounded-full bg-primary/10 text-primary-dark font-bold">
              {score} 分
            </span>
          )}
          {streak !== undefined && streak > 0 && (
            <span className="px-2 py-1 rounded-full bg-accent/20 text-amber-700 font-bold">
              🔥 {streak}
            </span>
          )}
          {level !== undefined && (
            <span className="px-2 py-1 rounded-full bg-secondary/15 text-cyan-700 font-bold">
              L{level}
            </span>
          )}
        </div>
      </div>
    </header>
  )
}