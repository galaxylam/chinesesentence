import type { ErrorRecord } from '../../types'
import { ERROR_HINT, ERROR_LABEL } from '../../data/errorTypes'

interface ErrorSummaryProps {
  topErrors: ErrorRecord[]
}

const ROW_BG: Record<number, string> = {
  0: 'bg-rose-50 border-rose-200 text-rose-800',
  1: 'bg-amber-50 border-amber-200 text-amber-800',
  2: 'bg-sky-50 border-sky-200 text-sky-800',
}

/** Top-3 error types with example snippets from the student's recent answers. */
export default function ErrorSummary({ topErrors }: ErrorSummaryProps) {
  if (topErrors.length === 0) {
    return (
      <div className="rounded-2xl bg-emerald-50 border-2 border-emerald-200 px-4 py-4 text-emerald-800 text-center font-bold">
        🎉 老師還沒找到你常犯的錯 — 繼續保持！
      </div>
    )
  }

  return (
    <div>
      <div className="text-xs font-black uppercase tracking-wider text-rose-700 mb-2">
        🔍 最常見的 3 個問題
      </div>
      <div className="space-y-2">
        {topErrors.map((e, i) => (
          <div
            key={e.type}
            className={
              'rounded-2xl border-2 px-4 py-3 ' + (ROW_BG[i] ?? ROW_BG[2])
            }
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold">{ERROR_LABEL[e.type]}</span>
              <span className="text-xs font-bold opacity-70">
                出現 {e.count} 次
              </span>
            </div>
            <p className="text-xs opacity-80 mb-2">{ERROR_HINT[e.type]}</p>
            {e.examples.length > 0 && (
              <details className="text-xs">
                <summary className="cursor-pointer opacity-80 font-bold">
                  看 {e.examples.length} 個例子
                </summary>
                <ul className="mt-2 space-y-1 italic opacity-90">
                  {e.examples.map((ex, j) => (
                    <li key={j}>「{ex}」</li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}