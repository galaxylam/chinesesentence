import type { ErrorType } from '../types'

/** Human-readable Chinese label for each error type (used in reports & tooltips). */
export const ERROR_LABEL: Record<ErrorType, string> = {
  de_usage: '的 / 地 / 得',
  ba_construction: '把字句',
  idiom_position: '成語位置',
  measure_word: '量詞',
  word_order: '語序',
  tense_aspect: '動態助詞 (了/過/著)',
  conjunction: '連接詞',
  punctuation: '標點符號',
}

/** Short hint shown next to the error label in the report. */
export const ERROR_HINT: Record<ErrorType, string> = {
  de_usage: '記住：形容「誰的」用「的」，形容「怎樣做」用「地」，形容「做得多好」用「得」。',
  ba_construction: '「把」字句常用於「把 + 物件 + 動詞 + 補語 / 位置」。',
  idiom_position: '成語通常放在動詞前面作狀語，記得加「地」：成語 + 地 + 動詞。',
  measure_word: '每個名詞都有專屬的量詞：書 → 本，狗 → 隻，花 → 束。',
  word_order: '中文順序：時間 / 地點 → 人物 → 動作 → 物件。',
  tense_aspect: '「了」表示已完成，「過」表示曾經，「著」表示持續中。',
  conjunction: '「因為…所以…」「雖然…但是…」要成對使用。',
  punctuation: '中文使用全形標點：，。？！「」。',
}