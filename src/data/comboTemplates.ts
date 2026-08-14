import type { ComboTemplate, Difficulty } from '../types'

/**
 * Combination templates — the heart of the game design.
 *
 * Each level defines which WordCategory slots are REQUIRED (must each appear
 * at least once among the 3 drawn words) and which OPTIONAL categories the
 * generator can pull from to fill remaining slots.
 *
 * L4 / L5 intentionally have only ONE required slot (idiom / conjunction).
 * The student must then add person / time / place / reason themselves —
 * that's where the real composition skill is trained.
 */

export const COMBO_TEMPLATES: Record<Difficulty, ComboTemplate> = {
  1: {
    level: 1,
    required: ['time', 'place', 'verb'],
    optional: ['person'],
    theme: '日常校園與家庭生活',
    minChars: 12,
  },
  2: {
    level: 2,
    required: ['time', 'place', 'verb'],
    optional: ['adverb', 'adjective', 'person', 'thing'],
    theme: '帶有感受或描寫的一天',
    minChars: 18,
  },
  3: {
    level: 3,
    required: ['idiom_action', 'thing', 'verb'],
    optional: ['person', 'place', 'time', 'adverb'],
    theme: '用成語描述一次行動',
    minChars: 20,
  },
  4: {
    level: 4,
    required: ['idiom_mood'],
    optional: ['person', 'time', 'place', 'conjunction', 'adverb'],
    theme: '表達抽象心情',
    minChars: 22,
  },
  5: {
    level: 5,
    required: ['conjunction', 'person', 'verb'],
    optional: ['idiom_result', 'idiom_scene', 'time', 'place', 'adverb'],
    theme: '完整複雜句，含因果或轉折',
    minChars: 28,
  },
}