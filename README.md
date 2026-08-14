# 三詞造句挑戰 (Three-Word Sentence Challenge)

每日 10–15 分鐘的中文造句訓練。系統隨機給三個詞，學生寫一個完整句子；AI 老師會即時評分、給提示（不直接給答案），學生可修改一次再看老師示範句。

> 重點不是考學生背成語，而是訓練他們把不同詞類放在正確位置，組成自然、完整、有意思的中文句子。

## 玩法

1. 進入關卡選擇畫面，挑戰 **L1 → L5** 五個難度
2. 系統抽出 3 個詞（時間／人物／動作／成語／連接詞…）
3. 學生用 **zh-Hant** 輸入框寫一句完整中文句子
4. AI 老師 100 分評分：
   - 三個詞都用對 (20)
   - 句子結構完整 (20)
   - 詞語位置正確 (20)
   - 搭配自然 (15)
   - 語意連貫 (15)
   - 表達豐富 (10)
5. 老師**最多指出 2 個主要問題**，第一輪只給提示，不給答案
6. 學生可**修改一次**，第二輪才看到老師的示範句 + 句式結構拆解
7. 答得好得 ⭐⭐⭐；每玩 50 題自動顯示**學習報告**

### 兩種輸入方式

每題都可以選擇用「**⌨️ 打字**」或「**🎤 語音**」回答。

- **語音模式** 使用瀏覽器內建的 Web Speech API（`zh-TW` 繁體中文），逐句邊講邊即時顯示在畫面上
- 完成後按「提交答案」即可
- 模式偏好會自動記住，下次開啟自動沿用
- ⚠️ 語音識別目前只在 Chrome / Edge / Safari 完整支援；若瀏覽器不支援，會提示切換回打字模式

## 5 個難度

| L | 主題 | 必出詞類 |
| --- | --- | --- |
| 1 | 日常校園與家庭 | 時間 + 地點 + 動詞 |
| 2 | 帶感受或描寫 | 時間 + 地點 + 動詞 (+ 形容詞/副詞) |
| 3 | 用成語描述行動 | 成語·動作 + 事物 + 動詞 |
| 4 | 表達抽象心情 | 成語·心情 (+ 自己加人物/時間/地點) |
| 5 | 完整複雜句 | 連接詞 + 人物 + 動詞 + 成語·結果/場面 |

## 快速開始

```bash
# 1. 安裝依賴
npm install

# 2. 設定 API key（見下方「AI 設定」）
cp .env.example .env.local
# 然後編輯 .env.local，把 sk-or-... 換成你的 key

# 3. 啟動 dev server
npm run dev          # http://localhost:5173

# 4. 構建生產版本
npm run build
npm run preview
```

## AI 設定

本遊戲使用 [OpenRouter](https://openrouter.ai/) 統一 API 評分句子。
第一次開啟時 UI 會要求你貼上 API key（只存在瀏覽器 localStorage，不會上傳）。

**取得 key：**
1. 到 [openrouter.ai/keys](https://openrouter.ai/keys) 註冊並建立一個免費 key
2. 在 App 內貼上即可開始

**預設模型：** `~deepseek/deepseek-v4-flash-latest` — `~` 前綴讓 OpenRouter 自動路由到免費變體（若可用）。
可在 `src/constants/config.ts` 改用其他 OpenRouter 支援的模型。

> 💡 安全性提示：本 MVP 為了零依賴，直接由前端打 API。Key 雖然只在 localStorage，
> 但任何人都能從 DevTools 取出。如要在多人共用裝置上使用，建議改為小型後端代理。

## 評分 Prompt（給老師 AI 的提示詞）

`src/lib/promptBuilder.ts` 包含完整的 system prompt，重點規則：

1. **不要與標準答案比對** — 小學生有多種合理表達，只要語法正確就應該給高分
2. **每次只指出最多 2 個主要問題**，不堆砌小毛病
3. **第一輪只給 HINT**，不直接給修改後的句子
4. **第二輪才給 exampleSentence**
5. 用簡體中文，語氣像小學老師
6. 必須用 OpenRouter 的 `response_format: json_object` 強制 JSON 輸出

## 技術棧

- React 19 + TypeScript
- Vite 5
- Tailwind 3（含自訂兒童友善色盤 + Noto 字體）
- OpenRouter API (`anthropic/claude-3.5-haiku`)
- 純前端 LocalStorage 持久化（versioned schema）
- 無後端，可靜態託管

## 檔案結構

```
src/
├── types/index.ts              # 所有 TypeScript interface
├── data/
│   ├── wordLibrary.ts          # 104 個中文字詞，13 個詞類
│   ├── comboTemplates.ts       # L1–L5 抽詞規則
│   └── errorTypes.ts           # 8 種錯誤分類標籤
├── lib/
│   ├── openrouter.ts           # fetch wrapper，JSON mode + 重試 + 25s timeout
│   ├── promptBuilder.ts        # AI 評分 prompt（編碼關鍵教學規則）
│   ├── responseParser.ts       # 安全解析 + clamp + 預設值
│   ├── quizGenerator.ts        # 按 L1–L5 規則抽詞，避免重複
│   ├── errorClassifier.ts      # （邏輯嵌入 ProgressContext）
│   ├── storage.ts              # versioned localStorage
│   ├── levelRules.ts           # 關卡解鎖邏輯
│   └── utils.ts                # cn() / uuid() / shuffle()
├── state/
│   ├── GameContext.tsx         # 評分流程 + 遊戲 state
│   ├── ProgressContext.tsx     # 學習進度 + 錯誤追蹤
│   └── progressReducer.ts      # 純函式 reducer（9 個 phase）
├── hooks/
│   ├── useReport.ts            # 50 題報告生成 + 觸發判斷
│   └── useSpeechRecognition.ts # Web Speech API 包裝 (zh-TW)
├── components/
│   ├── layout/         AppShell, TopBar
│   ├── onboarding/     LevelSelector, IntroModal
│   ├── quiz/           WordCard, WordTray, SentenceInput, BonusChallenge, DifficultyBadge
│   ├── feedback/       ScoreDisplay, FeedbackPanel, HintBox, ExampleSentence,
│   │                   StructureBreakdown, StarChallenge, ReviseCTA
│   ├── progress/       ProgressReport, ErrorSummary, LevelProgress
│   └── ui/             Button, Card, Confetti, Toast
└── App.tsx                     # 組合 + Provider + 路由
```

## 詞庫擴充

加新詞很簡單 — 在 `src/data/wordLibrary.ts` 對應的 `make(...)` 陣列裡 append：

```ts
make('time_黃昏', '黃昏', 'time', 2, '傍晚的時分')
```

`colorToken` 會依 category 自動決定。你也可以指定 `hint` 顯示額外說明。

## 學習報告

每 50 題自動觸發，也可在主畫面點擊「累計 X 題 · 平均 Y 分」手動開啟。

報告內容：
- 總題數 / 平均分 / 總得星數
- L1–L5 各關的平均分和星數
- **前 3 名錯誤類型**（的/地/得、把字句、成語位置、量詞、語序…）
  - 每個錯誤含 1–3 個學生的真實例句
  - 老師評語（按平均分動態生成）

## 開發指令

| 指令 | 作用 |
| --- | --- |
| `npm run dev` | 啟動 Vite dev server (HMR) |
| `npm run build` | 構建生產版本到 `dist/` |
| `npm run preview` | 本地預覽生產版本 |
| `npm run typecheck` | TypeScript 類型檢查 |

## 路線圖

- [ ] 5 個關卡已有，更多詞類組合
- [ ] 個人化題目權重：根據錯誤類型提高對應詞類的抽中率
- [ ] 句子朗讀 TTS
- [ ] 視覺化詞類樹（讓學生看到整個中文句子結構地圖）
- [ ] 後端代理 + 用戶帳號（多人共用裝置）

## 授權

MIT