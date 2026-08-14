import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react'
import type { PropsWithChildren } from 'react'
import type { GameAction, GameState } from './progressReducer'
import { initialGameState, progressReducer } from './progressReducer'
import { chat } from '../lib/openrouter'
import { buildScoringPrompt } from '../lib/promptBuilder'
import { parseScoringResult } from '../lib/responseParser'
import type { Difficulty, Quiz, ScoringResult } from '../types'
import { generateQuiz } from '../lib/quizGenerator'
import { API_KEY_STORAGE_KEY } from '../constants/config'
import { useProgress } from './ProgressContext'

interface GameContextValue {
  state: GameState
  dispatch: React.Dispatch<GameAction>
  /** Imperative: send the current submission for AI scoring. */
  scoreCurrent(submission: string): Promise<void>
  /** Start a fresh round at the given level. */
  startLevel(level: Difficulty): void
  /** API key currently in effect (from localStorage). */
  apiKey: string
  /** Set API key at runtime. */
  setApiKey(key: string): void
}

const GameContext = createContext<GameContextValue | null>(null)

/** Load the API key from localStorage on first mount. */
function loadApiKey(): string {
  try {
    return localStorage.getItem(API_KEY_STORAGE_KEY) ?? ''
  } catch {
    return ''
  }
}

export function GameProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(progressReducer, initialGameState)
  // apiKey is real state (not a ref) so updates trigger a re-render and
  // the context value memo recomputes correctly.
  const [apiKey, setApiKeyState] = useState<string>(() => loadApiKey())
  const { recordScoring } = useProgress()

  const startLevel = useCallback((level: Difficulty) => {
    const quiz = generateQuiz(level)
    dispatch({ type: 'START', level, quiz })
  }, [])

  const setApiKey = useCallback((key: string) => {
    try {
      if (key) localStorage.setItem(API_KEY_STORAGE_KEY, key)
      else localStorage.removeItem(API_KEY_STORAGE_KEY)
    } catch {
      /* noop */
    }
    setApiKeyState(key)
  }, [])

  const scoreCurrent = useCallback(
    async (submission: string) => {
      // Determine which phase we are scoring in: first try or revision.
      const currentQuiz: Quiz | undefined =
        state.phase === 'answering'
          ? state.quiz
          : state.phase === 'revising'
            ? state.quiz
            : undefined
      const isRevision =
        state.phase === 'revising' || state.phase === 'rescoring'

      if (!currentQuiz) return

      const { system, user } = buildScoringPrompt({
        level: currentQuiz.level,
        words: currentQuiz.words,
        submission,
        isRevision,
        bonus: currentQuiz.bonus,
      })

      try {
        const raw = await chat(
          [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
          {},
          apiKey,
        )
        const result: ScoringResult = parseScoringResult(raw)

        if (isRevision) {
          dispatch({ type: 'RESCORE_SUCCESS', result })
        } else {
          dispatch({ type: 'SCORE_SUCCESS', result })
        }

        // Persist progress only for first-try scoring (revision is the same round).
        if (!isRevision) {
          recordScoring({
            quizId: currentQuiz.id,
            level: currentQuiz.level,
            score: result.total,
            stars: result.stars,
            result,
            words: currentQuiz.words.map((w) => w.text),
            submission,
          })
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'AI 評分失敗'
        dispatch({ type: 'SCORE_ERROR', message })
      }
    },
    [state, recordScoring, apiKey],
  )

  // Expose a window-level helper for debugging.
  useEffect(() => {
    ;(window as unknown as { __gameDispatch?: typeof dispatch }).__gameDispatch =
      dispatch
    return () => {
      delete (window as unknown as { __gameDispatch?: typeof dispatch }).__gameDispatch
    }
  }, [dispatch])

  const value = useMemo<GameContextValue>(
    () => ({
      state,
      dispatch,
      scoreCurrent,
      startLevel,
      apiKey,
      setApiKey,
    }),
    [state, scoreCurrent, startLevel, setApiKey, apiKey],
  )

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within GameProvider')
  return ctx
}