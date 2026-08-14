import type { FeedbackItem, ScoringResult } from '../types'

const MAX = {
  allWordsUsed: 20,
  structure: 20,
  positions: 20,
  naturalness: 15,
  logic: 15,
  richness: 10,
} as const

/**
 * Parse the raw string returned by OpenRouter into a typed ScoringResult.
 * Validates structure, clamps values, enforces max 2 feedback items, and
 * falls back to a safe zero-score result if parsing completely fails.
 */
export function parseScoringResult(raw: string): ScoringResult {
  let json: unknown
  try {
    json = JSON.parse(raw)
  } catch {
    return safeFail()
  }
  if (!json || typeof json !== 'object') return safeFail()

  const obj = json as Record<string, unknown>
  const b = (obj.breakdown ?? {}) as Record<string, unknown>

  const allWordsUsed = clamp(num(b.allWordsUsed), 0, MAX.allWordsUsed)
  const structure = clamp(num(b.structure), 0, MAX.structure)
  const positions = clamp(num(b.positions), 0, MAX.positions)
  const naturalness = clamp(num(b.naturalness), 0, MAX.naturalness)
  const logic = clamp(num(b.logic), 0, MAX.logic)
  const richness = clamp(num(b.richness), 0, MAX.richness)

  const computedTotal =
    allWordsUsed + structure + positions + naturalness + logic + richness

  const feedback = sanitizeFeedback(obj.feedback)
  const wordClasses = sanitizeWordClasses(obj.wordClasses)
  const stars = clamp(num(obj.stars), 1, 3) as 1 | 2 | 3

  return {
    total: clamp(num(obj.total) || computedTotal, 0, 100),
    breakdown: {
      allWordsUsed,
      structure,
      positions,
      naturalness,
      logic,
      richness,
    },
    feedback,
    hint: typeof obj.hint === 'string' ? obj.hint : '再想想看，可以怎樣寫得更通順？',
    pattern: typeof obj.pattern === 'string' ? obj.pattern : '',
    exampleSentence: typeof obj.exampleSentence === 'string' ? obj.exampleSentence : '',
    wordClasses,
    stars,
    bonusSatisfied: obj.bonusSatisfied === true,
    allWordsUsedFlag: obj.allWordsUsedFlag !== false && allWordsUsed >= MAX.allWordsUsed,
  }
}

function sanitizeFeedback(input: unknown): FeedbackItem[] {
  if (!Array.isArray(input)) return []
  const out: FeedbackItem[] = []
  for (const raw of input.slice(0, 2)) {
    if (!raw || typeof raw !== 'object') continue
    const r = raw as Record<string, unknown>
    if (typeof r.message !== 'string' || !r.message.trim()) continue
    out.push({
      category: (typeof r.category === 'string' ? r.category : 'grammar') as FeedbackItem['category'],
      severity: (typeof r.severity === 'string' && ['info', 'warn', 'error'].includes(r.severity)
        ? r.severity
        : 'info') as FeedbackItem['severity'],
      message: r.message,
      suggestion: typeof r.suggestion === 'string' ? r.suggestion : undefined,
    })
  }
  return out
}

function sanitizeWordClasses(input: unknown): ScoringResult['wordClasses'] {
  if (!Array.isArray(input)) return []
  const out: ScoringResult['wordClasses'] = []
  for (const raw of input.slice(0, 12)) {
    if (!raw || typeof raw !== 'object') continue
    const r = raw as Record<string, unknown>
    if (typeof r.word !== 'string') continue
    out.push({
      word: r.word,
      className: typeof r.className === 'string' ? r.className : '',
    })
  }
  return out
}

function clamp(n: number, lo: number, hi: number): number {
  if (typeof n !== 'number' || Number.isNaN(n)) return 0
  return Math.max(lo, Math.min(hi, Math.round(n)))
}

function num(v: unknown): number {
  return typeof v === 'number' ? v : 0
}

function safeFail(): ScoringResult {
  return {
    total: 0,
    breakdown: {
      allWordsUsed: 0,
      structure: 0,
      positions: 0,
      naturalness: 0,
      logic: 0,
      richness: 0,
    },
    feedback: [],
    hint: 'AI 沒有回傳有效結果，請再試一次。',
    pattern: '',
    exampleSentence: '',
    wordClasses: [],
    stars: 1,
    bonusSatisfied: false,
    allWordsUsedFlag: false,
  }
}