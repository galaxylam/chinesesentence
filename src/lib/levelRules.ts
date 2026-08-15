import type { Difficulty, ProgressData } from '../types'

/**
 * Unlock rules — all levels are accessible from the start.
 * Star requirements were intentionally removed per user request.
 *
 * (Previously: L2 unlocked at 3 stars on L1, etc.)
 */
const ALL_UNLOCKED: Difficulty = 5

/** Apply unlock logic. Currently a no-op that marks every level unlocked. */
export function applyUnlocks(p: ProgressData): ProgressData {
  const perLevel = { ...p.perLevel }
  for (let l = 1; l <= 5; l++) {
    const lv = l as Difficulty
    perLevel[lv] = { ...perLevel[lv], unlocked: true }
  }
  return { ...p, unlockedLevel: ALL_UNLOCKED, perLevel }
}

/** Is the given level currently unlocked? Always true now. */
export function isUnlocked(_p: ProgressData, _level: Difficulty): boolean {
  return true
}