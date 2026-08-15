import { useEffect, useRef, useState } from 'react'
import AppShell from './components/layout/AppShell'
import DifficultyBadge from './components/quiz/DifficultyBadge'
import WordTray from './components/quiz/WordTray'
import SentenceInput from './components/quiz/SentenceInput'
import BonusChallengeChip from './components/quiz/BonusChallenge'
import ScoreDisplay from './components/feedback/ScoreDisplay'
import FeedbackPanel from './components/feedback/FeedbackPanel'
import HintBox from './components/feedback/HintBox'
import StarChallenge from './components/feedback/StarChallenge'
import ExampleSentence from './components/feedback/ExampleSentence'
import StructureBreakdown from './components/feedback/StructureBreakdown'
import OverallComment from './components/feedback/OverallComment'
import ReviseCTA from './components/feedback/ReviseCTA'
import LevelSelector from './components/onboarding/LevelSelector'
import IntroModal from './components/onboarding/IntroModal'
import ProgressReport from './components/progress/ProgressReport'
import Confetti from './components/ui/Confetti'
import Card from './components/ui/Card'
import { Button } from './components/ui/Button'
import { GameProvider, useGame } from './state/GameContext'
import { ProgressProvider, useProgress } from './state/ProgressContext'
import { COMBO_TEMPLATES } from './data/comboTemplates'
import { describeLevel, generateQuiz } from './lib/quizGenerator'
import { buildReport, shouldShowReport } from './hooks/useReport'
import { INTRO_DISMISSED_KEY } from './constants/config'
import type { Difficulty } from './types'

/**
 * Top-level App — wraps everything in providers and routes between
 * the landing LevelSelector and the active GameScreen.
 */
export default function App() {
  return (
    <ProgressProvider>
      <GameProvider>
        <Shell />
      </GameProvider>
    </ProgressProvider>
  )
}

function Shell() {
  const { apiKey, setApiKey } = useGame()
  const { progress, reset } = useProgress()
  const [introOpen, setIntroOpen] = useState<boolean>(
    () => !localStorage.getItem(INTRO_DISMISSED_KEY),
  )
  const [screen, setScreen] = useState<'menu' | 'play'>('menu')
  const [showReport, setShowReport] = useState(false)

  // Detect 50-question milestone — open the report modal automatically.
  useEffect(() => {
    if (
      shouldShowReport(
        progress.lastReportAtCount,
        progress.totalQuestions,
        progress.lastReportAtCount,
      )
    ) {
      setShowReport(true)
    }
  }, [progress.totalQuestions, progress.lastReportAtCount])

  // If no API key, show the gate even before intro.
  if (!apiKey) {
    return (
      <AppShell>
        <ApiKeyGate
          onSet={(k) => {
            setApiKey(k)
          }}
        />
      </AppShell>
    )
  }

  const report = buildReport(progress)

  return (
    <AppShell>
      <div className="flex items-center justify-between pt-3 mb-2">
        <h1 className="text-zh-lg font-black">三詞造句</h1>
        <button
          onClick={() => setShowReport(true)}
          className="text-xs text-slate-500 hover:text-primary tap"
        >
          累計 {progress.totalQuestions} 題 · 平均{' '}
          {progress.totalQuestions > 0
            ? Math.round(progress.totalScore / progress.totalQuestions)
            : '—'}{' '}
          分
          {progress.streak >= 3 && (
            <span className="ml-2 text-amber-600">🔥 {progress.streak}</span>
          )}
        </button>
      </div>

      {screen === 'menu' ? (
        <LevelSelector
          progress={progress}
          onSelect={() => setScreen('play')}
        />
      ) : (
        <GameScreen
          progress={progress}
          onBackToMenu={() => setScreen('menu')}
        />
      )}

      {introOpen && (
        <IntroModal
          onDismiss={() => {
            setIntroOpen(false)
            try {
              localStorage.setItem(INTRO_DISMISSED_KEY, '1')
            } catch {
              /* noop */
            }
          }}
        />
      )}

      {showReport && (
        <ProgressReport
          report={report}
          onClose={() => setShowReport(false)}
          onClear={() => {
            if (confirm('確定清除所有學習紀錄？')) reset()
            setShowReport(false)
          }}
        />
      )}
    </AppShell>
  )
}

function GameScreen({
  progress,
  onBackToMenu,
}: {
  progress: ReturnType<typeof useProgress>['progress']
  onBackToMenu: () => void
}) {
  const { state, dispatch, scoreCurrent, startLevel } = useGame()
  const [confettiKey, setConfettiKey] = useState(0)
  const lastScoredTotal = useRef<number | null>(null)

  const quiz =
    state.phase === 'showing' ||
    state.phase === 'answering' ||
    state.phase === 'scoring' ||
    state.phase === 'feedback' ||
    state.phase === 'revising' ||
    state.phase === 'rescoring' ||
    state.phase === 'example'
      ? state.quiz
      : null

  // Trigger confetti when a 100-point score lands.
  useEffect(() => {
    const resultTotal =
      state.phase === 'feedback'
        ? state.result.total
        : state.phase === 'example'
          ? state.revisedResult.total
          : null
    if (
      resultTotal !== null &&
      resultTotal >= 100 &&
      resultTotal !== lastScoredTotal.current
    ) {
      lastScoredTotal.current = resultTotal
      setConfettiKey((k) => k + 1)
    }
  }, [state])

  // Initialise a round if none exists.
  useEffect(() => {
    if (!quiz) startLevel(progress.unlockedLevel)
  }, [quiz, startLevel, progress.unlockedLevel])

  const tpl = quiz ? COMBO_TEMPLATES[quiz.level] : null

  if (!quiz || !tpl) {
    return (
      <Card className="mt-6 text-center text-slate-500">載入中…</Card>
    )
  }

  return (
    <>
      <Confetti trigger={confettiKey} message="完美！" />
      {/* Compact level picker + back button */}
      <div className="flex items-center gap-2 pt-1 pb-2">
        <Button size="md" variant="ghost" onClick={onBackToMenu}>
          ← 選關
        </Button>
        <div className="flex gap-1 overflow-x-auto">
          {([1, 2, 3, 4, 5] as Difficulty[]).map((l) => (
              <button
                key={l}
                onClick={() => startLevel(l)}
                className={
                  'shrink-0 px-3 py-1 rounded-full text-sm font-bold border-2 transition-colors tap ' +
                  (quiz.level === l
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-primary')
                }
              >
                L{l}
              </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mt-1 mb-3 px-1">
        <div className="flex items-center gap-2">
          <DifficultyBadge level={quiz.level} size="sm" />
          <span className="text-sm font-bold text-slate-500">
            {describeLevel(quiz.level)}
          </span>
        </div>
        <span className="text-xs text-slate-400">建議 ≥ {tpl.minChars} 字</span>
      </div>

      {state.phase === 'showing' && (
        <div className="space-y-5 mt-2">
          <WordTray words={quiz.words} />
          <BonusChallengeChip bonus={quiz.bonus} />
          <Card tone="soft" className="text-center text-slate-500 text-sm">
            請用上面三個詞寫一句完整的句子
          </Card>
          <Button onClick={() => dispatch({ type: 'BEGIN_ANSWERING' })} className="w-full">
            開始作答 ✏️
          </Button>
        </div>
      )}

      {(state.phase === 'answering' || state.phase === 'scoring') && (
        <div className="space-y-5 mt-2">
          <WordTray words={quiz.words} />
          <BonusChallengeChip bonus={quiz.bonus} />
          <SentenceInput
            value={state.phase === 'answering' ? state.draft : ''}
            onChange={(v) => dispatch({ type: 'UPDATE_DRAFT', draft: v })}
            onSubmit={() => {
              const text =
                state.phase === 'answering' ? state.draft.trim() : ''
              if (!text) return
              dispatch({ type: 'SUBMIT', submission: text })
              scoreCurrent(text)
            }}
            disabled={state.phase === 'scoring'}
            minChars={tpl.minChars}
            placeholder={`例如：${quiz.words[0].text}，我…${quiz.words[quiz.words.length - 1].text}…`}
          />
          {state.phase === 'scoring' && (
            <div className="text-center text-sm text-slate-500 py-2">
              老師批改中… ⏳
            </div>
          )}
        </div>
      )}

      {state.phase === 'feedback' && (
        <div className="space-y-5 mt-2 animate-spring-in">
          {/* 你的答案 — always shown alongside feedback */}
          <Card tone="accent">
            <div className="text-xs font-black uppercase tracking-wider text-amber-700 mb-1">
              📝 你的答案
            </div>
            <p className="font-zhSerif text-zh-lg leading-relaxed text-slate-800 break-keep">
              {state.submission}
            </p>
          </Card>

          <Card>
            <ScoreDisplay result={state.result} />
          </Card>
          <StarChallenge earned={state.result.stars} />
          <OverallComment comment={state.result.overallComment} />
          <FeedbackPanel items={state.result.feedback} />
          <HintBox hint={state.result.hint} />

          {/* 老師示範例句 — always shown from round 1 */}
          {state.result.exampleSentence && (
            <Card tone="soft">
              <ExampleSentence
                sentence={state.result.exampleSentence}
                highlightWords={state.quiz.words}
              />
            </Card>
          )}

          {state.result.pattern && (
            <Card tone="soft">
              <StructureBreakdown result={state.result} />
            </Card>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => dispatch({ type: 'BEGIN_REVISE' })}
            >
              ✏️ 再修改一次
            </Button>
            <Button
              className="flex-1"
              onClick={() =>
                dispatch({
                  type: 'NEXT_QUIZ',
                  quiz: generateQuiz(state.quiz.level),
                })
              }
            >
              🎲 下一題
            </Button>
          </div>
        </div>
      )}

      {(state.phase === 'revising' || state.phase === 'rescoring') && (
        <div className="space-y-5 mt-2">
          <Card tone="accent">
            <div className="text-xs font-black uppercase tracking-wider text-amber-700 mb-1">
              📝 你的初稿
            </div>
            <p className="font-zhSerif text-zh-lg leading-relaxed text-slate-800 break-keep">
              {state.firstSubmission}
            </p>
          </Card>
          <Card tone="soft">
            <div className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
              第一次評分
            </div>
            <ScoreDisplay result={state.firstResult} />
          </Card>
          <OverallComment comment={state.firstResult.overallComment} />
          <FeedbackPanel items={state.firstResult.feedback} />
          <HintBox hint={state.firstResult.hint} />
          {state.firstResult.exampleSentence && (
            <Card tone="soft">
              <ExampleSentence
                sentence={state.firstResult.exampleSentence}
                highlightWords={state.quiz.words}
              />
            </Card>
          )}
          <WordTray words={state.quiz.words} />
          <SentenceInput
            value={state.phase === 'revising' ? state.draft : ''}
            onChange={(v) => dispatch({ type: 'UPDATE_DRAFT', draft: v })}
            onSubmit={() => {
              const text =
                state.phase === 'revising' ? state.draft.trim() : ''
              if (!text) return
              dispatch({ type: 'RESUBMIT', submission: text })
              scoreCurrent(text)
            }}
            disabled={state.phase === 'rescoring'}
            minChars={tpl.minChars}
            placeholder="根據提示修改你的句子…"
          />
          {state.phase === 'rescoring' && (
            <div className="text-center text-sm text-slate-500 py-2">
              老師再批改中… ⏳
            </div>
          )}
        </div>
      )}

      {state.phase === 'example' && (
        <div className="space-y-5 mt-2 animate-spring-in">
          <Card tone="accent">
            <div className="text-xs font-black uppercase tracking-wider text-amber-700 mb-1">
              📝 你的初稿（之前）
            </div>
            <p className="font-zhSerif text-zh-base leading-relaxed text-slate-700 break-keep">
              {state.firstSubmission}
            </p>
          </Card>
          <Card tone="soft">
            <div className="text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
              你的修改
            </div>
            <p className="font-zhSerif text-zh-lg leading-relaxed text-slate-800 break-keep">
              {state.revisedSubmission}
            </p>
          </Card>
          <Card>
            <div className="text-xs font-black uppercase tracking-wider text-emerald-700 mb-2">
              ✅ 最後得分
            </div>
            <ScoreDisplay result={state.revisedResult} />
          </Card>
          <StarChallenge earned={state.revisedResult.stars} />
          <OverallComment comment={state.revisedResult.overallComment} />
          {state.revisedResult.exampleSentence && (
            <Card tone="soft">
              <ExampleSentence
                sentence={state.revisedResult.exampleSentence}
                highlightWords={state.quiz.words}
              />
            </Card>
          )}
          {state.revisedResult.pattern && (
            <Card tone="soft">
              <StructureBreakdown result={state.revisedResult} />
            </Card>
          )}
          <ReviseCTA
            hasRevised
            onRevise={() => dispatch({ type: 'BEGIN_REVISE' })}
            onNext={() =>
              dispatch({
                type: 'NEXT_QUIZ',
                quiz: generateQuiz(state.quiz.level),
              })
            }
          />
        </div>
      )}

      {state.phase === 'error' && (
        <Card tone="accent" className="mt-4 space-y-3">
          <div className="flex items-start gap-2">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <div className="font-bold text-amber-800 mb-1">老師批改失敗</div>
              <div className="text-sm text-amber-700 leading-relaxed break-words">
                {state.message}
              </div>
            </div>
          </div>
          <details className="text-xs text-amber-700/80">
            <summary className="cursor-pointer font-bold">查看你的答案</summary>
            <p className="mt-2 p-2 bg-white/60 rounded-lg italic">{state.submission}</p>
          </details>
          <p className="text-xs text-amber-700/70">
            💡 提示：打開瀏覽器 DevTools (F12) → Console 可以看到詳細錯誤
          </p>
          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                dispatch({ type: 'BEGIN_ANSWERING' })
                // Auto-resubmit the same sentence after a short delay.
                setTimeout(() => scoreCurrent(state.submission), 50)
              }}
            >
              🔁 重試這次
            </Button>
            <Button
              className="flex-1"
              onClick={() =>
                dispatch({
                  type: 'NEXT_QUIZ',
                  quiz: generateQuiz(state.quiz.level),
                })
              }
            >
              跳過這題
            </Button>
          </div>
        </Card>
      )}
    </>
  )
}

function ApiKeyGate({ onSet }: { onSet: (k: string) => void }) {
  return (
    <Card className="mt-6">
      <h2 className="text-zh-2xl font-black mb-2">歡迎來到三詞造句挑戰！</h2>
      <p className="text-slate-500 mb-4 leading-relaxed">
        老師會用 AI 幫你批改句子，所以需要一個 OpenRouter API key。
      </p>
      <ol className="text-sm text-slate-600 space-y-1 mb-4 list-decimal pl-5">
        <li>
          前往{' '}
          <a
            href="https://openrouter.ai/keys"
            target="_blank"
            rel="noreferrer"
            className="text-primary underline"
          >
            openrouter.ai/keys
          </a>{' '}
          取得免費 key
        </li>
        <li>貼到下面輸入框（只會儲存在你的瀏覽器）</li>
        <li>按「開始遊戲」即可</li>
      </ol>
      <ApiKeyForm onSet={onSet} />
      <p className="text-xs text-slate-400 mt-4">
        💡 OpenRouter 新用戶通常有少量免費額度，足夠試玩。
      </p>
    </Card>
  )
}

function ApiKeyForm({ onSet }: { onSet: (k: string) => void }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const form = e.currentTarget as HTMLFormElement
        const data = new FormData(form)
        const key = String(data.get('apiKey') ?? '').trim()
        if (key) onSet(key)
      }}
      className="space-y-3"
    >
      <input
        name="apiKey"
        type="password"
        placeholder="sk-or-..."
        autoComplete="off"
        className="zh-input w-full"
        required
      />
      <Button type="submit" className="w-full">
        開始遊戲 🚀
      </Button>
    </form>
  )
}