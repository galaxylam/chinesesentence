import type { FeedbackItem, FeedbackSeverity } from '../../types'
import { ERROR_LABEL } from '../../data/errorTypes'

interface FeedbackPanelProps {
  items: FeedbackItem[]
}

const ICON: Record<FeedbackSeverity, string> = {
  info: 'ℹ️',
  warn: '⚠️',
  error: '❗',
}

const RING: Record<FeedbackSeverity, string> = {
  info: 'bg-sky-50 border-sky-200 text-sky-800',
  warn: 'bg-amber-50 border-amber-200 text-amber-800',
  error: 'bg-rose-50 border-rose-200 text-rose-800',
}

export default function FeedbackPanel({ items }: FeedbackPanelProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800 font-bold animate-spring-in">
        🎉 太棒了！老師沒找到需要修改的地方。
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {items.map((item, i) => {
        const label =
          item.category in ERROR_LABEL ? ERROR_LABEL[item.category as keyof typeof ERROR_LABEL] : null
        return (
          <div
            key={i}
            className={
              'rounded-2xl border-2 px-4 py-3 animate-spring-in ' + RING[item.severity]
            }
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-start gap-2">
              <span className="text-xl leading-none">{ICON[item.severity]}</span>
              <div className="flex-1">
                <div className="font-bold leading-snug">{item.message}</div>
                {label && (
                  <div className="text-xs opacity-70 mt-1">
                    類別：{label}
                  </div>
                )}
                {item.suggestion && (
                  <div className="text-sm mt-1 italic opacity-90">
                    💡 {item.suggestion}
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}