import type { Difficulty, Word, WordCategory } from '../types'

/**
 * Word library — the pedagogical content of the game.
 *
 * Each entry is hand-picked for primary-school students and labelled with the
 * lowest difficulty level at which it should appear. Words are kept short and
 * high-frequency so the student can focus on the *placement* task, not the
 * reading task.
 *
 * Adding new words: just append to the right category array; the generator
 * and UI will pick them up automatically.
 */

const make = (
  id: string,
  text: string,
  category: WordCategory,
  minLevel: Difficulty,
  hint?: string,
): Word => ({
  id,
  text,
  category,
  minLevel,
  colorToken:
    category === 'time' ? 'blue'
      : category === 'person' ? 'purple'
        : category === 'place' ? 'cyan'
          : category === 'thing' ? 'amber'
            : category === 'verb' ? 'red'
              : category === 'adjective' ? 'pink'
                : category === 'adverb' ? 'violet'
                  : category.startsWith('idiom') ? 'green'
                    : category === 'conjunction' ? 'slate'
                      : category === 'measure' ? 'lime'
                        : 'slate',
  hint,
})

// ──────────────────────────────────────────────────────────────────────────
// 時間 (Time) — 6 entries
// ──────────────────────────────────────────────────────────────────────────
const TIME = [
  make('time_今天',     '今天',     'time', 1, '現在這一天'),
  make('time_昨天',     '昨天',     'time', 1, '過去的一天'),
  make('time_明天',     '明天',     'time', 1, '即將來臨的一天'),
  make('time_早上',     '早上',     'time', 1, '上午時分'),
  make('time_晚上',     '晚上',     'time', 1, '夜晚時分'),
  make('time_星期日',   '星期日',   'time', 1, '週末的一天'),
  make('time_週末',     '週末',     'time', 2, '星期六日'),
  make('time_放學後',   '放學後',   'time', 2, '下課回家'),
  make('time_突然有一天', '突然有一天', 'time', 3, '意想不到的某天'),
  make('time_從前',     '從前',     'time', 3, '很久以前'),
]

// ──────────────────────────────────────────────────────────────────────────
// 人物 (People) — 6 entries
// ──────────────────────────────────────────────────────────────────────────
const PERSON = [
  make('person_小明',   '小明',     'person', 1),
  make('person_媽媽',   '媽媽',     'person', 1),
  make('person_爸爸',   '爸爸',     'person', 1),
  make('person_老師',   '老師',     'person', 1),
  make('person_同學',   '同學',     'person', 1),
  make('person_弟弟',   '弟弟',     'person', 1),
  make('person_朋友',   '朋友',     'person', 2),
  make('person_妹妹',   '妹妹',     'person', 2),
  make('person_校長',   '校長',     'person', 3),
]

// ──────────────────────────────────────────────────────────────────────────
// 地點 (Place) — 6 entries
// ──────────────────────────────────────────────────────────────────────────
const PLACE = [
  make('place_公園',    '公園',     'place', 1),
  make('place_家',      '家',       'place', 1),
  make('place_學校',    '學校',     'place', 1),
  make('place_操場',    '操場',     'place', 1),
  make('place_教室',    '教室',     'place', 1),
  make('place_圖書館',  '圖書館',   'place', 1),
  make('place_書店',    '書店',     'place', 2),
  make('place_海邊',    '海邊',     'place', 2),
  make('place_山上',    '山上',     'place', 3),
  make('place_車站',    '車站',     'place', 3),
]

// ──────────────────────────────────────────────────────────────────────────
// 事物 (Thing) — 6 entries
// ──────────────────────────────────────────────────────────────────────────
const THING = [
  make('thing_書',      '書',       'thing', 1),
  make('thing_球',      '球',       'thing', 1),
  make('thing_花',      '花',       'thing', 1),
  make('thing_蛋糕',    '蛋糕',     'thing', 1),
  make('thing_雨傘',    '雨傘',     'thing', 1),
  make('thing_禮物',    '禮物',     'thing', 2),
  make('thing_花瓶',    '花瓶',     'thing', 2, '裝花用的瓶子'),
  make('thing_錢包',    '錢包',     'thing', 2),
  make('thing_信件',    '信件',     'thing', 3),
  make('thing_鑰匙',    '鑰匙',     'thing', 3),
]

// ──────────────────────────────────────────────────────────────────────────
// 動詞 (Verb) — 6 entries
// ──────────────────────────────────────────────────────────────────────────
const VERB = [
  make('verb_跑',       '跑',       'verb', 1),
  make('verb_走',       '走',       'verb', 1),
  make('verb_看書',     '看書',     'verb', 1),
  make('verb_吃',       '吃',       'verb', 1),
  make('verb_玩',       '玩',       'verb', 1),
  make('verb_笑',       '笑',       'verb', 1),
  make('verb_幫助',     '幫助',     'verb', 2),
  make('verb_發現',     '發現',     'verb', 2),
  make('verb_拾起',     '拾起',     'verb', 2),
  make('verb_打開',     '打開',     'verb', 2),
  make('verb_參加',     '參加',     'verb', 3),
  make('verb_等候',     '等候',     'verb', 3),
  make('verb_欣賞',     '欣賞',     'verb', 4),
  make('verb_堅持',     '堅持',     'verb', 5),
]

// ──────────────────────────────────────────────────────────────────────────
// 形容詞 (Adjective) — 6 entries
// ──────────────────────────────────────────────────────────────────────────
const ADJECTIVE = [
  make('adj_開心',      '開心',     'adjective', 1),
  make('adj_高興',      '高興',     'adjective', 1),
  make('adj_緊張',      '緊張',     'adjective', 2),
  make('adj_疲倦',      '疲倦',     'adjective', 2),
  make('adj_美麗',      '美麗',     'adjective', 2),
  make('adj_安靜',      '安靜',     'adjective', 2),
  make('adj_寒冷',      '寒冷',     'adjective', 3),
  make('adj_溫暖',      '溫暖',     'adjective', 3),
]

// ──────────────────────────────────────────────────────────────────────────
// 副詞 (Adverb) — 6 entries
// ──────────────────────────────────────────────────────────────────────────
const ADVERB = [
  make('adv_立刻',      '立刻',     'adverb', 2),
  make('adv_慢慢',      '慢慢',     'adverb', 2),
  make('adv_突然',      '突然',     'adverb', 2),
  make('adv_仍然',      '仍然',     'adverb', 3),
  make('adv_終於',      '終於',     'adverb', 3),
  make('adv_仔細',      '仔細',     'adverb', 3),
  make('adv_焦急地',    '焦急地',   'adverb', 4),
  make('adv_興奮地',    '興奮地',   'adverb', 4),
]

// ──────────────────────────────────────────────────────────────────────────
// 成語 — 動作類 (Idiom: action)
// ──────────────────────────────────────────────────────────────────────────
const IDIOM_ACTION = [
  make('idiom_action_小心翼翼', '小心翼翼', 'idiom_action', 3, '非常小心謹慎'),
  make('idiom_action_全神貫注', '全神貫注', 'idiom_action', 3, '專心致志'),
  make('idiom_action_迫不及待', '迫不及待', 'idiom_action', 3, '急著想做'),
  make('idiom_action_手舞足蹈', '手舞足蹈', 'idiom_action', 3, '高興得動手動腳'),
  make('idiom_action_左顧右盼', '左顧右盼', 'idiom_action', 4, '東張西望'),
]

// ──────────────────────────────────────────────────────────────────────────
// 成語 — 心情類 (Idiom: emotion)
// ──────────────────────────────────────────────────────────────────────────
const IDIOM_MOOD = [
  make('idiom_mood_忐忑不安',   '忐忑不安',   'idiom_mood', 4, '心裡七上八下'),
  make('idiom_mood_欣喜若狂',   '欣喜若狂',   'idiom_mood', 4, '高興到極點'),
  make('idiom_mood_垂頭喪氣',   '垂頭喪氣',   'idiom_mood', 4, '非常失落'),
  make('idiom_mood_興高采烈',   '興高采烈',   'idiom_mood', 3, '非常高興'),
  make('idiom_mood_心花怒放',   '心花怒放',   'idiom_mood', 5, '非常高興愉快'),
]

// ──────────────────────────────────────────────────────────────────────────
// 成語 — 結果類 (Idiom: result)
// ──────────────────────────────────────────────────────────────────────────
const IDIOM_RESULT = [
  make('idiom_result_目瞪口呆', '目瞪口呆', 'idiom_result', 4, '震驚得說不出話'),
  make('idiom_result_筋疲力盡', '筋疲力盡', 'idiom_result', 5, '非常疲累'),
  make('idiom_result_滿載而歸', '滿載而歸', 'idiom_result', 5, '收穫豐富地回家'),
]

// ──────────────────────────────────────────────────────────────────────────
// 成語 — 場面類 (Idiom: scene)
// ──────────────────────────────────────────────────────────────────────────
const IDIOM_SCENE = [
  make('idiom_scene_人山人海',   '人山人海',   'idiom_scene', 5, '人群非常擁擠'),
  make('idiom_scene_鴉雀無聲',   '鴉雀無聲',   'idiom_scene', 5, '非常安靜'),
  make('idiom_scene_熱鬧非凡',   '熱鬧非凡',   'idiom_scene', 5, '非常熱鬧'),
]

// ──────────────────────────────────────────────────────────────────────────
// 連接詞 (Conjunction) — 6 entries
// ──────────────────────────────────────────────────────────────────────────
const CONJUNCTION = [
  make('conj_因為',     '因為',     'conjunction', 5, '表示原因'),
  make('conj_所以',     '所以',     'conjunction', 5, '表示結果'),
  make('conj_雖然',     '雖然',     'conjunction', 5, '表示讓步'),
  make('conj_但是',     '但是',     'conjunction', 5, '表示轉折'),
  make('conj_如果',     '如果',     'conjunction', 5, '表示假設'),
  make('conj_然後',     '然後',     'conjunction', 4, '表示先後順序'),
  make('conj_於是',     '於是',     'conjunction', 4, '表示承接'),
]

// ──────────────────────────────────────────────────────────────────────────
// 量詞組合 (Measure words) — 6 entries
// ──────────────────────────────────────────────────────────────────────────
const MEASURE = [
  make('measure_一本書',     '一本書',     'measure', 2),
  make('measure_一場比賽',   '一場比賽',   'measure', 3),
  make('measure_一份禮物',   '一份禮物',   'measure', 3),
  make('measure_一隻小狗',   '一隻小狗',   'measure', 3),
  make('measure_一束花',     '一束花',     'measure', 4),
  make('measure_一片葉子',   '一片葉子',   'measure', 4),
]

// ──────────────────────────────────────────────────────────────────────────
// 代詞 (Pronoun) — 6 entries
// ──────────────────────────────────────────────────────────────────────────
const PRONOUN = [
  make('pronoun_我',       '我',         'pronoun', 1),
  make('pronoun_你',       '你',         'pronoun', 1),
  make('pronoun_他',       '他',         'pronoun', 1),
  make('pronoun_她',       '她',         'pronoun', 1),
  make('pronoun_我們',     '我們',       'pronoun', 1),
  make('pronoun_他們',     '他們',       'pronoun', 2),
]

// ──────────────────────────────────────────────────────────────────────────
// Library export — indexed by category + flat list
// ──────────────────────────────────────────────────────────────────────────

export const WORD_LIBRARY: Record<WordCategory, Word[]> = {
  time: TIME,
  person: PERSON,
  place: PLACE,
  thing: THING,
  verb: VERB,
  adjective: ADJECTIVE,
  adverb: ADVERB,
  idiom_action: IDIOM_ACTION,
  idiom_mood: IDIOM_MOOD,
  idiom_result: IDIOM_RESULT,
  idiom_scene: IDIOM_SCENE,
  conjunction: CONJUNCTION,
  measure: MEASURE,
  pronoun: PRONOUN,
}

/** Flat list of all words in the library. */
export const ALL_WORDS: Word[] = Object.values(WORD_LIBRARY).flat()

/** Words eligible at or below a given difficulty. */
export function wordsAtLevel(level: Difficulty): Word[] {
  return ALL_WORDS.filter((w) => w.minLevel <= level)
}

/** Convenience: get one category's pool filtered by level. */
export function wordsByCategoryAtLevel(
  category: WordCategory,
  level: Difficulty,
): Word[] {
  return WORD_LIBRARY[category].filter((w) => w.minLevel <= level)
}

/** Total library size, used for self-tests. */
export const LIBRARY_SIZE = ALL_WORDS.length