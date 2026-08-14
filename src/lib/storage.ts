import type {
  Difficulty,
  ErrorRecord,
  ErrorType,
  LevelStats,
  ProgressData,
} from '../types'
import { PROGRESS_STORAGE_KEY } from '../constants/config'

/**
 * Typed LocalStorage adapter for ProgressData.
 *
 * Schema is versioned (`version: 1`). Any future migration should branch on
 * the version field and transform older shapes into the current one.
 */

export function defaultProgress(): ProgressData {
  return {
    version: 1,
    unlockedLevel: 1,
    totalQuestions: 0,
    totalScore: 0,
    streak: 0,
    perLevel: emptyPerLevel(),
    errors: [],
    recentQuizzes: [],
    lastReportAtCount: 0,
    settings: {
      apiKeySet: false,
      soundOn: true,
    },
  }
}

function emptyPerLevel(): Record<Difficulty, LevelStats> {
  return {
    1: emptyStats(),
    2: emptyStats(),
    3: emptyStats(),
    4: emptyStats(),
    5: emptyStats(),
  }
}

function emptyStats(): LevelStats {
  return { attempts: 0, totalScore: 0, bestScore: 0, stars: 0, unlocked: false }
}

export function loadProgress(): ProgressData {
  if (typeof localStorage === 'undefined') return defaultProgress()
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY)
    if (!raw) return defaultProgress()
    const parsed = JSON.parse(raw) as Partial<ProgressData> | null
    if (!parsed || parsed.version !== 1) return defaultProgress()
    return migrate(parsed)
  } catch {
    return defaultProgress()
  }
}

export function saveProgress(p: ProgressData): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(p))
  } catch {
    /* quota or private mode — silently ignore */
  }
}

function migrate(p: Partial<ProgressData>): ProgressData {
  const base = defaultProgress()
  return {
    ...base,
    ...p,
    perLevel: { ...base.perLevel, ...(p.perLevel ?? {}) },
    errors: p.errors ?? [],
    recentQuizzes: p.recentQuizzes ?? [],
    settings: { ...base.settings, ...(p.settings ?? {}) },
  } as ProgressData
}

/** Update progress after a scored round. Returns a new ProgressData object. */
export function recordRound(
  current: ProgressData,
  patch: {
    level: Difficulty
    score: number
    stars: 1 | 2 | 3
    errors: ErrorType[]
    words: string[]
    submission: string
    quizId: string
  },
): ProgressData {
  const lvl = current.perLevel[patch.level]
  const newStreak = patch.score >= 90 ? current.streak + 1 : 0

  const updated: ProgressData = {
    ...current,
    totalQuestions: current.totalQuestions + 1,
    totalScore: current.totalScore + patch.score,
    streak: newStreak,
    perLevel: {
      ...current.perLevel,
      [patch.level]: {
        attempts: lvl.attempts + 1,
        totalScore: lvl.totalScore + patch.score,
        bestScore: Math.max(lvl.bestScore, patch.score),
        stars: lvl.stars + patch.stars,
        unlocked: lvl.unlocked,
      },
    },
    errors: mergeErrors(current.errors, patch.errors, patch.submission),
    recentQuizzes: pushRecent(current.recentQuizzes, {
      quizId: patch.quizId,
      level: patch.level,
      words: patch.words,
      submission: patch.submission,
      score: patch.score,
      stars: patch.stars,
      errorTypes: patch.errors,
      timestamp: Date.now(),
    }),
    lastReportAtCount: current.lastReportAtCount,
  }
  return updated
}

function mergeErrors(
  current: ErrorRecord[],
  types: ErrorType[],
  example: string,
): ErrorRecord[] {
  if (types.length === 0) return current
  const map = new Map(current.map((e) => [e.type, { ...e }]))
  for (const t of types) {
    const e = map.get(t) ?? {
      type: t,
      count: 0,
      lastSeenAt: 0,
      examples: [],
    }
    e.count += 1
    e.lastSeenAt = Date.now()
    if (!e.examples.includes(example) && e.examples.length < 3) {
      e.examples.push(example)
    }
    map.set(t, e)
  }
  return [...map.values()]
}

function pushRecent<T>(arr: T[], item: T, max = 50): T[] {
  const next = [...arr, item]
  if (next.length > max) return next.slice(next.length - max)
  return next
}

/** Reset everything (for "Clear progress" button in settings). */
export function clearProgress(): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.removeItem(PROGRESS_STORAGE_KEY)
  } catch {
    /* noop */
  }
}