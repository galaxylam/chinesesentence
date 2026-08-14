import { CATEGORY_LABEL, CATEGORY_COLOR } from '../../types'
import type { ColorToken, Word } from '../../types'
import { cn } from '../../lib/utils'

interface WordCardProps {
  word: Word
  index: number
}

/** Tailwind classes keyed by color token. Used by WordCard background ring + text. */
const COLOR_RING: Record<ColorToken, string> = {
  blue:   'bg-cat-time/10     ring-cat-time     text-cat-time',
  green:  'bg-cat-idiom_action/10 ring-emerald-500 text-emerald-700',
  yellow: 'bg-amber-50        ring-amber-400    text-amber-700',
  amber:  'bg-amber-50        ring-amber-400    text-amber-700',
  pink:   'bg-cat-adjective/10 ring-pink-400    text-pink-700',
  purple: 'bg-cat-person/10   ring-purple-400   text-purple-700',
  orange: 'bg-orange-50       ring-orange-400   text-orange-700',
  cyan:   'bg-cat-place/10    ring-cyan-400     text-cyan-700',
  violet: 'bg-cat-adverb/10   ring-violet-400   text-violet-700',
  slate:  'bg-slate-100       ring-slate-400    text-slate-700',
  lime:   'bg-cat-measure/10  ring-lime-500     text-lime-700',
  red:    'bg-cat-verb/10     ring-red-400      text-red-700',
}

/** A single colored tile showing the given word and its Chinese class label. */
export default function WordCard({ word, index }: WordCardProps) {
  const token = CATEGORY_COLOR[word.category]
  const colors = COLOR_RING[token]
  return (
    <div
      className={cn(
        'relative rounded-3xl ring-2 px-4 py-5 min-w-[110px] min-h-[120px]',
        'flex flex-col items-center justify-center gap-2',
        'animate-spring-in shadow-card',
        colors,
      )}
      style={{ animationDelay: `${index * 80}ms` }}
      title={word.hint}
    >
      <span className="absolute top-2 left-2 text-xs font-bold opacity-50">
        {index + 1}
      </span>
      <span className="text-zh-2xl font-black text-center leading-tight break-keep">
        {word.text}
      </span>
      <span className="text-xs font-bold opacity-70 text-center">
        {CATEGORY_LABEL[word.category]}
      </span>
      {word.hint && (
        <span className="absolute -bottom-2 right-2 text-base opacity-60" aria-hidden>
          💡
        </span>
      )}
    </div>
  )
}