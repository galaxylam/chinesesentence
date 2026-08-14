import type {
  Difficulty,
  GameState,
  Quiz,
  ScoringResult,
} from '../types'

export type { GameState }

/**
 * Pure reducer for the game loop state machine.
 *
 * Phase graph:
 *
 *   idle ─START(lvl)─► showing ─BEGIN_ANSWERING─► answering
 *                                                       │
 *                                                  SUBMIT
 *                                                       ▼
 *                                                  scoring
 *                                                       │
 *                                          ┌────────────┴────────────┐
 *                                          ▼                         ▼
 *                                      feedback                    error
 *                                          │                         │
 *                                BEGIN_REVISE                  BEGIN_ANSWERING
 *                                          ▼
 *                                       revising
 *                                          │
 *                                       RESUBMIT
 *                                          ▼
 *                                      rescoring
 *                                          │
 *                                          ▼
 *                                       example
 *                                          │
 *                                      NEXT_QUIZ
 *                                          ▼
 *                                       showing
 */

export type GameAction =
  | { type: 'START'; level: Difficulty; quiz: Quiz }
  | { type: 'BEGIN_ANSWERING' }
  | { type: 'UPDATE_DRAFT'; draft: string }
  | { type: 'SUBMIT'; submission: string }
  | { type: 'SCORE_SUCCESS'; result: ScoringResult }
  | { type: 'SCORE_ERROR'; message: string }
  | { type: 'BEGIN_REVISE' }
  | { type: 'RESUBMIT'; submission: string }
  | { type: 'RESCORE_SUCCESS'; result: ScoringResult }
  | { type: 'NEXT_QUIZ'; quiz: Quiz }
  | { type: 'RESET' }

export const initialGameState: GameState = { phase: 'idle' }

export function progressReducer(
  state: GameState,
  action: GameAction,
): GameState {
  switch (action.type) {
    case 'START':
      return { phase: 'showing', quiz: action.quiz }

    case 'BEGIN_ANSWERING':
      if (state.phase === 'showing') {
        return { phase: 'answering', quiz: state.quiz, draft: '' }
      }
      if (state.phase === 'error') {
        // Retry the failed submission by going straight back to scoring.
        return { phase: 'answering', quiz: state.quiz, draft: state.submission }
      }
      return state

    case 'UPDATE_DRAFT':
      if (state.phase !== 'answering' && state.phase !== 'revising') return state
      return { ...state, draft: action.draft }

    case 'SUBMIT':
      if (state.phase !== 'answering') return state
      return {
        phase: 'scoring',
        quiz: state.quiz,
        submission: action.submission,
      }

    case 'SCORE_SUCCESS':
      if (state.phase !== 'scoring') return state
      return {
        phase: 'feedback',
        quiz: state.quiz,
        submission: state.submission,
        result: action.result,
      }

    case 'SCORE_ERROR':
      if (state.phase !== 'scoring' && state.phase !== 'rescoring') {
        return state
      }
      const errorQuiz = state.quiz
      const errorSubmission =
        state.phase === 'scoring' ? state.submission : state.revisedSubmission
      return {
        phase: 'error',
        message: action.message,
        quiz: errorQuiz,
        submission: errorSubmission,
      }

    case 'BEGIN_REVISE':
      if (state.phase !== 'feedback') return state
      return {
        phase: 'revising',
        quiz: state.quiz,
        firstResult: state.result,
        firstSubmission: state.submission,
        draft: '',
      }

    case 'RESUBMIT':
      if (state.phase !== 'revising') return state
      return {
        phase: 'rescoring',
        quiz: state.quiz,
        firstResult: state.firstResult,
        firstSubmission: state.firstSubmission,
        revisedSubmission: action.submission,
      }

    case 'RESCORE_SUCCESS':
      if (state.phase !== 'rescoring') return state
      return {
        phase: 'example',
        quiz: state.quiz,
        firstResult: state.firstResult,
        firstSubmission: state.firstSubmission,
        revisedResult: action.result,
        revisedSubmission: state.revisedSubmission,
      }

    case 'NEXT_QUIZ':
      return { phase: 'showing', quiz: action.quiz }

    case 'RESET':
      return initialGameState

    default:
      return state
  }
}