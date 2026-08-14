import { useMemo } from 'react'
import type { Difficulty, LearningReport, ProgressData } from '../types'

/**
 * Compute a LearningReport snapshot from the current ProgressData.
 * Memoised — recomputes only when progress changes.
 */
export function useReport(progress: ProgressData): LearningReport {
  return useMemo(() => buildReport(progress), [progress])
}

export function buildReport(p: ProgressData): LearningReport {
  const perLevel = {} as Record<Difficulty, { attempts: number; averageScore: number; stars: number }>
  for (let l = 1; l <= 5; l++) {
    const lv = l as Difficulty
    const s = p.perLevel[lv]
    perLevel[lv] = {
      attempts: s.attempts,
      averageScore: s.attempts > 0 ? Math.round(s.totalScore / s.attempts) : 0,
      stars: s.stars,
    }
  }

  const topErrors = [...p.errors].sort((a, b) => b.count - a.count).slice(0, 3)

  return {
    generatedAt: Date.now(),
    totalQuestions: p.totalQuestions,
    averageScore:
      p.totalQuestions > 0 ? Math.round(p.totalScore / p.totalQuestions) : 0,
    perLevel,
    topErrors,
    recentQuizzes: p.recentQuizzes.slice(-20).reverse(),
  }
}

/**
 * Decide whether the report modal should be shown right now (every 50 qs).
 * Caller triggers this after recording a new round.
 */
export function shouldShowReport(
  beforeCount: number,
  afterCount: number,
  lastReportAtCount: number,
): boolean {
  const newMilestone = Math.floor(afterCount / 50) * 50
  if (newMilestone <= 0) return false
  if (newMilestone <= lastReportAtCount) return false
  return afterCount > beforeCount && afterCount >= newMilestone
}