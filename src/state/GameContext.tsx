import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react'
import type { PropsWithChildren } from 'react'
import type { GameAction, GameState } from './progressReducer'
import { initialGameState, progressReducer } from './progressReducer'
import { AuthError, chat } from '../lib/openrouter'
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
  /** Friendly reason the user was bounced back to the API-key gate. */
  authMessage: string | null
  /** Clear the authMessage after the user sees it. */
  clearAuthMessage(): void
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
  const [authMessage, setAuthMessage] = useState<string | null>(null)
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

  const clearAuthMessage = useCallback(() => setAuthMessage(null), [])

  /** Called when OpenRouter rejects the key — wipes stored key + returns to gate. */
  const bounceToApiGate = useCallback(
    (reason: string) => {
      console.warn('[game] bouncing to API key gate:', reason)
      try {
        localStorage.removeItem(API_KEY_STORAGE_KEY)
      } catch {
        /* noop */
      }
      setApiKeyState('')
      setAuthMessage(reason)
      dispatch({ type: 'RESET' })
    },
    [],
  )

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
        // Auth errors → boot the user back to the API-key setup screen.
        if (err instanceof AuthError) {
          bounceToApiGate(
            err.status === 403
              ? 'API key 已被停用或過期，請重新輸入。'
              : 'API key 無效，請重新輸入。',
          )
          return
        }
        const message = err instanceof Error ? err.message : 'AI 評分失敗'
        dispatch({ type: 'SCORE_ERROR', message })
      }
    },
    [state, recordScoring, apiKey, bounceToApiGate],
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
      authMessage,
      clearAuthMessage,
    }),
    [state, scoreCurrent, startLevel, setApiKey, apiKey, authMessage, clearAuthMessage],
  )

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within GameProvider')
  return ctx
}