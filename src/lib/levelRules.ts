import type { Difficulty, ProgressData } from '../types'

/**
 * Level unlock rules.
 *
 *   L1  — always unlocked
 *   L2  — unlocked after earning 3 stars on L1
 *   L3  — unlocked after 5 stars on L2 (avg ~80 score)
 *   L4  — unlocked after 5 stars on L3
 *   L5  — unlocked after 5 stars on L4
 */
const STAR_REQUIREMENT: Record<Difficulty, number> = {
  1: 0,
  2: 3,
  3: 5,
  4: 5,
  5: 5,
}

/** Apply unlock logic to a ProgressData and return the updated shape. */
export function applyUnlocks(p: ProgressData): ProgressData {
  let unlocked: Difficulty = 1
  for (let l = 1; l <= 5; l++) {
    const lv = l as Difficulty
    const stats = p.perLevel[lv]
    if (stats.stars >= STAR_REQUIREMENT[lv]) {
      unlocked = lv
    }
  }
  const perLevel = { ...p.perLevel }
  for (let l = 1; l <= 5; l++) {
    const lv = l as Difficulty
    perLevel[lv] = { ...perLevel[lv], unlocked: lv <= unlocked }
  }
  return { ...p, unlockedLevel: unlocked, perLevel }
}

/** Is the given level currently unlocked? */
export function isUnlocked(p: ProgressData, level: Difficulty): boolean {
  return p.unlockedLevel >= level
}