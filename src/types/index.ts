/**
 * 三詞造句挑戰 — Shared TypeScript types
 *
 * This file is the contract source of truth for the entire game.
 * Any change here ripples through quizGenerator, promptBuilder, storage, and UI.
 */

/** All word categories the game knows about. */
export type WordCategory =
  | 'time'
  | 'person'
  | 'place'
  | 'thing'
  | 'verb'
  | 'adjective'
  | 'adverb'
  | 'idiom_action'
  | 'idiom_mood'
  | 'idiom_result'
  | 'idiom_scene'
  | 'conjunction'
  | 'measure'
  | 'pronoun'

/** Difficulty levels 1–5, unlocked progressively. */
export type Difficulty = 1 | 2 | 3 | 4 | 5

/** Tailwind color token used by WordCard and highlights. */
export type ColorToken =
  | 'blue'
  | 'green'
  | 'yellow'
  | 'pink'
  | 'purple'
  | 'orange'
  | 'cyan'
  | 'violet'
  | 'slate'
  | 'lime'
  | 'amber'
  | 'red'

/** A single word in the library. */
export interface Word {
  /** Stable ID e.g. "time_昨天". Same id = same color & dedupe key. */
  id: string
  /** The displayed word, e.g. "昨天". */
  text: string
  /** Category this word belongs to. */
  category: WordCategory
  /** Minimum level at which this word appears. */
  minLevel: Difficulty
  /** Color hint for WordCard / ExampleSentence highlights. */
  colorToken: ColorToken
  /** Optional hint text shown if student clicks "?" on the card. */
  hint?: string
}

/** Chinese class name shown to students (e.g. "時間", "成語－動作類"). */
export const CATEGORY_LABEL: Record<WordCategory, string> = {
  time: '時間',
  person: '人物',
  place: '地點',
  thing: '事物',
  verb: '動詞',
  adjective: '形容詞',
  adverb: '副詞',
  idiom_action: '成語·動作',
  idiom_mood: '成語·心情',
  idiom_result: '成語·結果',
  idiom_scene: '成語·場面',
  conjunction: '連接詞',
  measure: '量詞',
  pronoun: '代詞',
}

/** Per-category color tokens. Keeps visual styling consistent. */
export const CATEGORY_COLOR: Record<WordCategory, ColorToken> = {
  time: 'blue',
  person: 'purple',
  place: 'cyan',
  thing: 'amber',
  verb: 'red',
  adjective: 'pink',
  adverb: 'violet',
  idiom_action: 'green',
  idiom_mood: 'green',
  idiom_result: 'green',
  idiom_scene: 'green',
  conjunction: 'slate',
  measure: 'lime',
  pronoun: 'slate',
}

/** A combination template for a level — describes which categories to draw from. */
export interface ComboTemplate {
  level: Difficulty
  /** Categories that MUST each appear at least once among the 3 words. */
  required: WordCategory[]
  /** Categories that add flavor; drawn from when needed. */
  optional: WordCategory[]
  /** Short narrative hint for the level. */
  theme: string
  /** Minimum sentence length expected for full credit. */
  minChars: number
}

/** A bonus challenge shown with the input. */
export type BonusKind = 'time' | 'place' | 'mood' | 'because_so' | 'long'

export interface BonusChallenge {
  kind: BonusKind
  /** Chinese label, e.g. "加入：時間" or "擴寫到 25 字以上". */
  label: string
  /** Did the student's sentence satisfy this bonus? Set by AI scoring. */
  satisfied: boolean
}

/** A round of play. */
export interface Quiz {
  id: string
  level: Difficulty
  /** Always exactly 3 words. */
  words: Word[]
  bonus: BonusChallenge
  createdAt: number
}

/** A student submission (before + after revision). */
export interface SentenceSubmission {
  quizId: string
  text: string
  /** false = first try, true = revised. */
  isRevision: boolean
  charCount: number
}

/** Granular feedback item. Max 2 returned per scoring round. */
export type FeedbackSeverity = 'info' | 'warn' | 'error'

export interface FeedbackItem {
  category: ErrorType | 'grammar' | 'logic' | 'word_choice'
  severity: FeedbackSeverity
  /** Short zh-CN message for the student. */
  message: string
  /** Optional direction (never the full corrected sentence). */
  suggestion?: string
}

/** Canonical error taxonomy tracked across sessions. */
export type ErrorType =
  | 'de_usage'         // 的/地/得 混淆
  | 'ba_construction'  // 把字句錯誤
  | 'idiom_position'   // 成語位置不當
  | 'measure_word'     // 量詞錯誤
  | 'word_order'       // 語序錯誤
  | 'tense_aspect'     // 時態/動態助詞
  | 'conjunction'      // 連接詞用法
  | 'punctuation'      // 標點符號

/** Per-error statistics persisted across sessions. */
export interface ErrorRecord {
  type: ErrorType
  count: number
  lastSeenAt: number
  /** Up to 3 anonymised example sentence snippets. */
  examples: string[]
}

/** AI scoring response (post-parsed). */
export interface ScoringResult {
  total: number // 0–100
  breakdown: {
    allWordsUsed: number // /15
    structure: number // /15
    positions: number // /10
    naturalness: number // /15
    logic: number // /15
    punctuation: number // /10
    semantics: number // /20 — heaviest weight
  }
  feedback: FeedbackItem[] // ≤2 main issues
  /** 整體評語 — 1–3 句整體性的深入評論（涵蓋詞意、標點、自然度等） */
  overallComment: string
  hint: string
  pattern: string // e.g. "時間 + 人物 + 成語 + 地 + 把 + 名詞 + 動詞"
  /** Always present from round 1 onwards. */
  exampleSentence: string
  wordClasses: Array<{ word: string; className: string }>
  stars: 1 | 2 | 3
  bonusSatisfied: boolean
  allWordsUsedFlag: boolean
}

/** Per-level statistics. */
export interface LevelStats {
  attempts: number
  totalScore: number
  bestScore: number
  stars: number
  unlocked: boolean
}

/** Snapshot of a recent quiz (used for the 50-question report). */
export interface RecentQuiz {
  quizId: string
  level: Difficulty
  words: string[]
  submission: string
  score: number
  stars: 1 | 2 | 3
  errorTypes: ErrorType[]
  timestamp: number
}

/** Aggregate learning report surfaced every 50 questions. */
export interface LearningReport {
  generatedAt: number
  totalQuestions: number
  averageScore: number
  perLevel: Record<Difficulty, { attempts: number; averageScore: number; stars: number }>
  topErrors: ErrorRecord[]
  recentQuizzes: RecentQuiz[]
}

/** Top-level persisted progress. */
export interface ProgressData {
  version: 1
  unlockedLevel: Difficulty
  totalQuestions: number
  totalScore: number
  streak: number
  perLevel: Record<Difficulty, LevelStats>
  errors: ErrorRecord[]
  recentQuizzes: RecentQuiz[]
  /** Marker to avoid showing the report twice at the same count. */
  lastReportAtCount: number
  settings: {
    apiKeySet: boolean
    soundOn: boolean
  }
}

/** Game-loop state machine phases. */
export type GameState =
  | { phase: 'idle' }
  | { phase: 'showing'; quiz: Quiz }
  | { phase: 'answering'; quiz: Quiz; draft: string }
  | { phase: 'scoring'; quiz: Quiz; submission: string }
  | {
      phase: 'feedback'
      quiz: Quiz
      submission: string
      result: ScoringResult
    }
  | {
      phase: 'revising'
      quiz: Quiz
      firstResult: ScoringResult
      firstSubmission: string
      draft: string
    }
  | {
      phase: 'rescoring'
      quiz: Quiz
      firstResult: ScoringResult
      firstSubmission: string
      revisedSubmission: string
    }
  | {
      phase: 'example'
      quiz: Quiz
      firstResult: ScoringResult
      firstSubmission: string
      revisedResult: ScoringResult
      revisedSubmission: string
    }
  | { phase: 'report'; report: LearningReport }
  | { phase: 'error'; message: string; quiz: Quiz; submission: string }