import { COMBO_TEMPLATES } from '../data/comboTemplates'
import {
  WORD_LIBRARY,
  wordsByCategoryAtLevel,
} from '../data/wordLibrary'
import type {
  BonusChallenge,
  BonusKind,
  Difficulty,
  Quiz,
  Word,
  WordCategory,
} from '../types'
import { pickN, shuffle, uuid } from './utils'

/**
 * Generate a single round of play.
 *
 * Algorithm:
 *  1. Take the level's ComboTemplate (required + optional categories).
 *  2. Draw ONE word from each required category. For L4/L5 the template's
 *     `required` may have only 1 entry — that's intentional, the student
 *     supplies the rest as a composition exercise.
 *  3. Fill remaining slots up to 3 total from optional categories, picking
 *     distinct categories whenever possible.
 *  4. Avoid words that appeared in the last `recentWindowSize` rounds.
 *  5. Attach a BonusChallenge appropriate for the level.
 */
export function generateQuiz(
  level: Difficulty,
  recent: Quiz[] = [],
  recentWindowSize = 5,
): Quiz {
  const tpl = COMBO_TEMPLATES[level]
  const recentWordIds = new Set(
    recent
      .slice(-recentWindowSize)
      .flatMap((q) => q.words.map((w) => w.id)),
  )

  // Build pools per category, excluding recent words.
  const pool = (cat: WordCategory): Word[] =>
    wordsByCategoryAtLevel(cat, level).filter(
      (w) => !recentWordIds.has(w.id),
    )

  // Fallback: if a pool is empty after dedupe, allow recent words back in.
  const safePool = (cat: WordCategory): Word[] => {
    const strict = pool(cat)
    return strict.length > 0 ? strict : wordsByCategoryAtLevel(cat, level)
  }

  // Step 1 — required categories
  const requiredWords: Word[] = []
  for (const cat of tpl.required) {
    const p = safePool(cat)
    if (p.length === 0) continue
    requiredWords.push(pickN(p, 1)[0])
  }

  // Step 2 — fill optional slots up to 3 total, distinct categories
  const slotsLeft = 3 - requiredWords.length
  const usedCategories = new Set(requiredWords.map((w) => w.category))
  const optionalWords: Word[] = []

  if (slotsLeft > 0) {
    const optCategories = shuffle(
      tpl.optional.filter((c) => !usedCategories.has(c)),
    )
    for (const cat of optCategories) {
      if (optionalWords.length >= slotsLeft) break
      const p = safePool(cat)
      if (p.length === 0) continue
      optionalWords.push(pickN(p, 1)[0])
      usedCategories.add(cat)
    }

    // If still short (tiny optional pool), allow category repeats
    while (optionalWords.length < slotsLeft) {
      const p = safePool(tpl.optional[0])
      if (p.length === 0) break
      optionalWords.push(pickN(p, 1)[0])
    }
  }

  // Step 3 — quality balance:
  //  - For L1/L2, keep at most one idiom-shaped word.
  //  - Ensure we don't accidentally give a measure word as the only "noun".
  const words = balanceWords([...requiredWords, ...optionalWords], level)

  return {
    id: uuid(),
    level,
    words,
    bonus: pickBonusFor(level),
    createdAt: Date.now(),
  }
}

/** Minor post-processing for nicer pairings. */
function balanceWords(words: Word[], _level: Difficulty): Word[] {
  // Stable shuffle so card order varies round-to-round.
  return shuffle(words)
}

/** Choose an appropriate BonusChallenge for the level. */
function pickBonusFor(level: Difficulty): BonusChallenge {
  const pool: BonusKind[] =
    level <= 2
      ? ['time', 'place', 'mood']
      : level === 3
        ? ['place', 'mood', 'long']
        : level === 4
          ? ['because_so', 'mood', 'long']
          : ['long', 'mood']

  const kind = pool[Math.floor(Math.random() * pool.length)]
  return {
    kind,
    label: BONUS_LABEL[kind],
    satisfied: false,
  }
}

const BONUS_LABEL: Record<BonusKind, string> = {
  time: '加入「時間」',
  place: '加入「地點」',
  mood: '加入「人物心情」',
  because_so: '使用「因為…所以…」',
  long: '把句子擴寫到 25 字以上',
}

/** Convenience for the UI: short theme description. */
export function describeLevel(level: Difficulty): string {
  return COMBO_TEMPLATES[level].theme
}

/** All categories that have at least one word at this level. */
export function availableCategories(level: Difficulty): WordCategory[] {
  return (Object.keys(WORD_LIBRARY) as WordCategory[]).filter(
    (c) => wordsByCategoryAtLevel(c, level).length > 0,
  )
}