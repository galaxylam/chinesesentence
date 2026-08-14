import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { PropsWithChildren } from 'react'
import type {
  Difficulty,
  ErrorType,
  ProgressData,
  ScoringResult,
} from '../types'
import {
  defaultProgress,
  loadProgress,
  recordRound,
  saveProgress,
} from '../lib/storage'
import { applyUnlocks } from '../lib/levelRules'

interface ProgressContextValue {
  progress: ProgressData
  setProgress: (next: ProgressData | ((p: ProgressData) => ProgressData)) => void
  /** Imperative: record a freshly scored round and persist. */
  recordScoring(input: {
    quizId: string
    level: Difficulty
    score: number
    stars: 1 | 2 | 3
    result: ScoringResult
    words: string[]
    submission: string
  }): void
  reset(): void
}

const ProgressContext = createContext<ProgressContextValue | null>(null)

export function ProgressProvider({ children }: PropsWithChildren) {
  const [progress, setProgressState] = useState<ProgressData>(() =>
    loadProgress(),
  )

  // Persist whenever progress changes (debounced via microtask).
  useEffect(() => {
    saveProgress(progress)
  }, [progress])

  const setProgress = useCallback<ProgressContextValue['setProgress']>(
    (next) => {
      setProgressState((prev) =>
        typeof next === 'function'
          ? (next as (p: ProgressData) => ProgressData)(prev)
          : next,
      )
    },
    [],
  )

  const recordScoring = useCallback<ProgressContextValue['recordScoring']>(
    ({ quizId, level, score, stars, result, words, submission }) => {
      setProgressState((prev) =>
        applyUnlocks(
          recordRound(prev, {
            level,
            score,
            stars,
            errors: extractErrorTypes(result),
            words,
            submission,
            quizId,
          }),
        ),
      )
    },
    [],
  )

  const reset = useCallback(() => {
    setProgressState(defaultProgress())
  }, [])

  const value = useMemo<ProgressContextValue>(
    () => ({ progress, setProgress, recordScoring, reset }),
    [progress, setProgress, recordScoring, reset],
  )

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  )
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider')
  return ctx
}

/** Extract ErrorType[] from a ScoringResult's feedback items + keyword fallback. */
function extractErrorTypes(result: ScoringResult): ErrorType[] {
  const set = new Set<ErrorType>()
  for (const fb of result.feedback) {
    const c = fb.category
    if (
      c === 'de_usage' ||
      c === 'ba_construction' ||
      c === 'idiom_position' ||
      c === 'measure_word' ||
      c === 'word_order' ||
      c === 'tense_aspect' ||
      c === 'conjunction' ||
      c === 'punctuation'
    ) {
      set.add(c)
    }
    const m = fb.message
    if (/把字句|把.+放|把.+拿/.test(m)) set.add('ba_construction')
    if (/的.*地|地.*得|的地/.test(m)) set.add('de_usage')
    if (/量詞/.test(m)) set.add('measure_word')
    if (/語序|順序|位置不當/.test(m)) set.add('word_order')
    if (/成語.*位置|位置.*成語/.test(m)) set.add('idiom_position')
    if (/因為.*所以|雖然.*但是|連接詞/.test(m)) set.add('conjunction')
    if (/了|過|著|動態助詞/.test(m)) set.add('tense_aspect')
    if (/，。|標點/.test(m)) set.add('punctuation')
  }
  return [...set]
}