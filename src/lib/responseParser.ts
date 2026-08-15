import type { FeedbackItem, ScoringResult } from '../types'

const MAX = {
  allWordsUsed: 15,
  structure: 15,
  positions: 10,
  naturalness: 15,
  logic: 15,
  punctuation: 10,
  semantics: 20,
} as const

/**
 * Parse the raw string returned by OpenRouter into a typed ScoringResult.
 * Validates structure, clamps values, enforces max 2 feedback items, and
 * falls back to a safe zero-score result if parsing completely fails.
 *
 * Handles:
 *  - Raw JSON
 *  - JSON wrapped in ```json ... ``` or ``` ... ``` markdown fences
 *  - Preamble text before the JSON object
 */
export function parseScoringResult(raw: string): ScoringResult {
  const cleaned = extractJson(raw)
  if (!cleaned) {
    console.warn('[parser] no JSON found in response', { raw: raw.slice(0, 300) })
    return safeFail('AI 回傳了非 JSON 內容，請再試一次。')
  }

  let json: unknown
  try {
    json = JSON.parse(cleaned)
  } catch (e) {
    console.warn('[parser] JSON.parse failed', { cleaned: cleaned.slice(0, 300), error: e })
    return safeFail('AI 回傳的 JSON 無法解析，請再試一次。')
  }
  if (!json || typeof json !== 'object') return safeFail('AI 回傳格式不正確。')

  const obj = json as Record<string, unknown>
  const b = (obj.breakdown ?? {}) as Record<string, unknown>

  const allWordsUsed = clamp(num(b.allWordsUsed), 0, MAX.allWordsUsed)
  const structure = clamp(num(b.structure), 0, MAX.structure)
  const positions = clamp(num(b.positions), 0, MAX.positions)
  const naturalness = clamp(num(b.naturalness), 0, MAX.naturalness)
  const logic = clamp(num(b.logic), 0, MAX.logic)
  const punctuation = clamp(num(b.punctuation ?? b.richness), 0, MAX.punctuation)
  const semantics = clamp(num(b.semantics), 0, MAX.semantics)

  const computedTotal =
    allWordsUsed + structure + positions + naturalness + logic + punctuation + semantics

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
      punctuation,
      semantics,
    },
    feedback,
    overallComment:
      typeof obj.overallComment === 'string'
        ? obj.overallComment
        : '老師還沒給整體評語，但細項回饋已在上方。',
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

function safeFail(hint = 'AI 沒有回傳有效結果，請再試一次。'): ScoringResult {
  return {
    total: 0,
    breakdown: {
      allWordsUsed: 0,
      structure: 0,
      positions: 0,
      naturalness: 0,
      logic: 0,
      punctuation: 0,
      semantics: 0,
    },
    feedback: [],
    overallComment: '老師這次沒辦法回傳，請再試一次。',
    hint,
    pattern: '',
    exampleSentence: '',
    wordClasses: [],
    stars: 1,
    bonusSatisfied: false,
    allWordsUsedFlag: false,
  }
}

/** Extract the first balanced JSON object from a possibly-noisy string. */
function extractJson(raw: string): string | null {
  const trimmed = raw.trim()

  // 1. Direct JSON
  if (trimmed.startsWith('{')) return trimmed

  // 2. Markdown fence: ```json ... ``` or ``` ... ```
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]+?)```/i)
  if (fence) return fence[1].trim()

  // 3. Find the first `{` and walk braces to find its matching `}`
  const start = trimmed.indexOf('{')
  if (start === -1) return null
  let depth = 0
  let inStr = false
  let escape = false
  for (let i = start; i < trimmed.length; i++) {
    const ch = trimmed[i]
    if (escape) { escape = false; continue }
    if (ch === '\\' && inStr) { escape = true; continue }
    if (ch === '"') { inStr = !inStr; continue }
    if (inStr) continue
    if (ch === '{') depth++
    else if (ch === '}') {
      depth--
      if (depth === 0) return trimmed.slice(start, i + 1)
    }
  }
  return null
}