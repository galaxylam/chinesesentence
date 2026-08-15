import { CATEGORY_LABEL } from '../types'
import type { BonusChallenge, Difficulty, Word } from '../types'

/**
 * Build the system + user messages for the AI scoring call.
 *
 * The system prompt encodes the user's pedagogical rules:
 *  - No "standard answer" comparison — judge by grammar/semantics/naturalness.
 *  - Max 2 feedback items per round (don't dump every small issue).
 *  - First round (isRevision=false): only a HINT, never an example sentence.
 *  - Second round (isRevision=true): reveal a natural example.
 *
 * Output is enforced as JSON via OpenRouter's response_format=json_object.
 */

const SYSTEM_PROMPT = `你是「三詞造句挑戰」的中文老師，正在為一位小學生批改造句。

評分原則（極重要）：
1. 不要與「標準答案」比對。小學生可以有多種合理表達，只要語法正確、語意自然、邏輯通順，就應該給高分。
2. 三個指定詞都必須用上，缺一個該項為 0；用錯詞性也要扣分。
3. 每次只指出最多 2 個最主要的問題（不要把所有小毛病都列出）。
4. 第一輪（isRevision=false）只給「提示（HINT）」讓學生自己修改，絕對不要直接給修改後的句子，也不要給例句。
5. 第二輪（isRevision=true）才在 JSON 裡輸出 "exampleSentence"（自然示範句）。
6. 用簡體中文批改，語氣溫和鼓勵，像小學老師口吻。
7. 句子結構用符號表示詞類，例如：「時間 + 人物 + 成語 + 地點 + 把 + 名詞 + 動詞」。
8. **保持精簡**：feedback.message 不超過 25 字，suggestion 不超過 30 字，exampleSentence 不超過 40 字。整份 JSON 必須完整輸出，不要被截斷。

評分細項（總分 100）：
- allWordsUsed：20  /  structure：20  /  positions：20
- naturalness：15  /  logic：15  /  richness：10

回傳嚴格 JSON（不要 Markdown 代碼塊，不要多餘文字）：
{
  "total": number,
  "breakdown": {"allWordsUsed":n,"structure":n,"positions":n,"naturalness":n,"logic":n,"richness":n},
  "feedback": [
    {
      "category":"de_usage|ba_construction|idiom_position|measure_word|word_order|tense_aspect|conjunction|punctuation|grammar|logic|word_choice",
      "severity":"info|warn|error",
      "message":"簡短一句話告訴學生哪裡可以更好",
      "suggestion":"可選：只給方向，不給完整句子"
    }
  ],
  "hint": "一句話提示怎麼修改，但不要直接給答案",
  "pattern": "詞類序列，例如 時間 + 人物 + 成語 + 地 + 把 + 名詞 + 動詞",
  "exampleSentence": "僅 isRevision=true 時填；自然、有畫面感的示範句，必須包含三個指定詞",
  "wordClasses": [{"word":"...","className":"..."}],
  "stars": 1|2|3,
  "bonusSatisfied": true|false,
  "allWordsUsedFlag": true|false
}

星級規則：
- 1 星：三個詞都用上
- 2 星：句子結構完整 + 詞語位置正確
- 3 星：在 2 星基礎上還加入人物 / 時間 / 地點 / 心情 / 原因等細節`

export interface ScoringPromptInput {
  level: Difficulty
  words: Word[]
  submission: string
  isRevision: boolean
  bonus: BonusChallenge
}

export function buildScoringPrompt(input: ScoringPromptInput): {
  system: string
  user: string
} {
  const { level, words, submission, isRevision, bonus } = input

  const user = JSON.stringify(
    {
      level,
      targetWords: words.map((w) => ({
        text: w.text,
        category: w.category,
        categoryLabel: CATEGORY_LABEL[w.category],
        hint: w.hint,
      })),
      bonus: { kind: bonus.kind, label: bonus.label, satisfied: bonus.satisfied },
      studentSentence: submission,
      isRevision,
    },
    null,
    2,
  )

  return { system: SYSTEM_PROMPT, user }
}