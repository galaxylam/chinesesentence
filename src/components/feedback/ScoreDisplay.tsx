import type { ScoringResult } from '../../types'
import { cn } from '../../lib/utils'

interface ScoreDisplayProps {
  result: ScoringResult
}

interface Row {
  label: string
  value: number
  max: number
}

const ROWS: Array<Omit<Row, 'value'>> = [
  { label: '三個詞都用對', max: 20 },
  { label: '句子結構完整', max: 20 },
  { label: '詞語位置正確', max: 20 },
  { label: '搭配自然', max: 15 },
  { label: '語意連貫', max: 15 },
  { label: '表達豐富', max: 10 },
]

const TIER: Record<string, { ring: string; text: string; label: string }> = {
  high: { ring: 'ring-emerald-400 bg-emerald-50 text-emerald-700', text: 'text-emerald-700', label: '很棒！' },
  mid:  { ring: 'ring-amber-400 bg-amber-50 text-amber-700',     text: 'text-amber-700',   label: '不錯' },
  low:  { ring: 'ring-orange-400 bg-orange-50 text-orange-700', text: 'text-orange-700',  label: '繼續加油' },
}

function tierFor(total: number): keyof typeof TIER {
  if (total >= 85) return 'high'
  if (total >= 65) return 'mid'
  return 'low'
}

export default function ScoreDisplay({ result }: ScoreDisplayProps) {
  const tier = tierFor(result.total)
  const t = TIER[tier]
  const values: Record<string, number> = {
    '三個詞都用對': result.breakdown.allWordsUsed,
    '句子結構完整': result.breakdown.structure,
    '詞語位置正確': result.breakdown.positions,
    '搭配自然': result.breakdown.naturalness,
    '語意連貫': result.breakdown.logic,
    '表達豐富': result.breakdown.richness,
  }

  return (
    <div className="flex flex-col items-center gap-4 animate-spring-in">
      <div
        className={cn(
          'w-32 h-32 rounded-full ring-4 flex items-center justify-center',
          t.ring,
        )}
      >
        <div className="text-center">
          <div className="text-5xl font-black leading-none">{result.total}</div>
          <div className="text-xs font-bold opacity-70 mt-1">/ 100</div>
        </div>
      </div>
      <div className={cn('text-zh-lg font-bold', t.text)}>{t.label}</div>

      <div className="w-full space-y-2 mt-2">
        {ROWS.map((row) => {
          const v = values[row.label]
          const pct = (v / row.max) * 100
          return (
            <div key={row.label} className="text-sm">
              <div className="flex justify-between mb-1 text-slate-600 font-bold">
                <span>{row.label}</span>
                <span>
                  {v} / {row.max}
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-400' : 'bg-orange-400',
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}