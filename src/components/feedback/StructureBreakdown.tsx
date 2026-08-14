import { CATEGORY_COLOR, CATEGORY_LABEL } from '../../types'
import type { ColorToken, ScoringResult } from '../../types'
import { cn } from '../../lib/utils'

interface StructureBreakdownProps {
  result: ScoringResult
}

const CHIP_BG: Record<ColorToken, string> = {
  blue: 'bg-cat-time/15 text-cat-time',
  green: 'bg-emerald-100 text-emerald-700',
  amber: 'bg-amber-100 text-amber-700',
  yellow: 'bg-amber-100 text-amber-700',
  red: 'bg-cat-verb/15 text-red-700',
  pink: 'bg-cat-adjective/15 text-pink-700',
  purple: 'bg-cat-person/15 text-purple-700',
  cyan: 'bg-cat-place/15 text-cyan-700',
  violet: 'bg-cat-adverb/15 text-violet-700',
  slate: 'bg-slate-200 text-slate-700',
  lime: 'bg-cat-measure/15 text-lime-700',
  orange: 'bg-orange-100 text-orange-700',
}

/**
 * Renders the sentence pattern (e.g. "時間 + 人物 + 成語 + 把 + 名詞 + 動詞")
 * and a list of word-class chips for the example sentence.
 */
export default function StructureBreakdown({ result }: StructureBreakdownProps) {
  const pattern = result.pattern
  const wc = result.wordClasses

  return (
    <div className="space-y-3">
      {pattern && (
        <div>
          <div className="text-xs font-black uppercase tracking-wider text-violet-700 mb-2">
            🧱 句式結構
          </div>
          <div className="rounded-2xl bg-violet-50 border border-violet-200 px-3 py-2 font-zh text-zh-base font-bold text-violet-900 leading-relaxed">
            {pattern}
          </div>
        </div>
      )}

      {wc.length > 0 && (
        <div>
          <div className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
            詞類拆解
          </div>
          <div className="flex flex-wrap gap-2">
            {wc.map((w, i) => {
              const cat = StringToCategory(w.className)
              const token: ColorToken = cat ? CATEGORY_COLOR[cat] : 'slate'
              return (
                <span
                  key={`${w.word}-${i}`}
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold',
                    CHIP_BG[token],
                  )}
                >
                  <span>{w.word}</span>
                  <span className="opacity-60 text-xs">·</span>
                  <span className="text-xs opacity-80">
                    {cat ? CATEGORY_LABEL[cat] : w.className}
                  </span>
                </span>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

/** Loose map: AI may return various zh class names; pick the closest enum value. */
function StringToCategory(s: string): import('../../types').WordCategory | null {
  const map: Record<string, import('../../types').WordCategory> = {
    時間: 'time',
    人物: 'person',
    代詞: 'pronoun',
    代名詞: 'pronoun',
    地點: 'place',
    事物: 'thing',
    名詞: 'thing',
    動詞: 'verb',
    形容詞: 'adjective',
    副詞: 'adverb',
    成語: 'idiom_action',
    '成語·動作': 'idiom_action',
    '成語·心情': 'idiom_mood',
    '成語·結果': 'idiom_result',
    '成語·場面': 'idiom_scene',
    連接詞: 'conjunction',
    量詞: 'measure',
  }
  return map[s] ?? null
}