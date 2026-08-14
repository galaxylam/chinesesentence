import { CATEGORY_COLOR, CATEGORY_LABEL } from '../../types'
import type { Word } from '../../types'
import { cn } from '../../lib/utils'

interface ExampleSentenceProps {
  sentence: string
  /** The 3 library words to highlight inside the sentence. */
  highlightWords: Word[]
  title?: string
}

const MARK_CLASS: Record<string, string> = {
  blue: 'mark-cat-time',
  green: 'mark-cat-idiom_action',
  amber: 'mark-cat-thing',
  red: 'mark-cat-verb',
  pink: 'mark-cat-adjective',
  purple: 'mark-cat-person',
  cyan: 'mark-cat-place',
  violet: 'mark-cat-adverb',
  slate: 'mark-cat-conjunction',
  lime: 'mark-cat-measure',
  yellow: 'mark-cat-thing',
  orange: 'mark-cat-thing',
}

/**
 * Renders an example sentence with the 3 library words highlighted in
 * their category colors. Falls back to plain text if highlighting fails.
 */
export default function ExampleSentence({
  sentence,
  highlightWords,
  title = '參考例句',
}: ExampleSentenceProps) {
  if (!sentence) return null

  const tokens = tokenize(sentence, highlightWords)
  return (
    <div>
      <div className="text-xs font-black uppercase tracking-wider text-emerald-700 mb-2">
        ✨ {title}
      </div>
      <p className="font-zhSerif text-zh-lg leading-relaxed text-slate-800">
        {tokens.map((t, i) =>
          t.kind === 'plain' ? (
            <span key={i}>{t.text}</span>
          ) : (
            <span
              key={i}
              className={cn(
                'inline-block',
                MARK_CLASS[CATEGORY_COLOR[t.word.category]] ?? 'bg-slate-100 rounded px-1',
              )}
              title={CATEGORY_LABEL[t.word.category]}
            >
              {t.text}
            </span>
          ),
        )}
      </p>
    </div>
  )
}

type Token =
  | { kind: 'plain'; text: string }
  | { kind: 'highlight'; text: string; word: Word }

/** Splits sentence into text + highlighted tokens for each library word. */
function tokenize(sentence: string, words: Word[]): Token[] {
  if (words.length === 0) return [{ kind: 'plain', text: sentence }]

  // Build a regex that matches any of the words (longest first to avoid overlap).
  const sorted = [...words].sort((a, b) => b.text.length - a.text.length)
  const escaped = sorted.map((w) => escapeRegex(w.text)).join('|')
  const regex = new RegExp(`(${escaped})`, 'g')
  const wordByText = new Map(words.map((w) => [w.text, w]))

  const parts = sentence.split(regex)
  const out: Token[] = []
  for (const p of parts) {
    if (!p) continue
    const w = wordByText.get(p)
    if (w) out.push({ kind: 'highlight', text: p, word: w })
    else out.push({ kind: 'plain', text: p })
  }
  return out
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}