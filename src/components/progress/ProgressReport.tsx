import type { LearningReport } from '../../types'
import { ERROR_HINT, ERROR_LABEL } from '../../data/errorTypes'
import { Button } from '../ui/Button'
import ErrorSummary from './ErrorSummary'
import LevelProgress from './LevelProgress'

interface ProgressReportProps {
  report: LearningReport
  onClose: () => void
  onClear: () => void
}

/**
 * Full-screen modal shown every 50 questions.
 * Surfaces: average score, per-level stars, top-3 errors with examples.
 */
export default function ProgressReport({
  report,
  onClose,
  onClear,
}: ProgressReportProps) {
  return (
    <div className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-spring-in">
      <div className="bg-cream w-full max-w-lg max-h-[88vh] overflow-y-auto rounded-3xl shadow-card p-5 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-zh-2xl font-black">📊 學習報告</h2>
          <button
            onClick={onClose}
            aria-label="關閉"
            className="tap text-slate-400 hover:text-slate-700 text-2xl"
          >
            ×
          </button>
        </div>

        <SummaryStats report={report} />

        <LevelProgress perLevel={report.perLevel} />

        <ErrorSummary topErrors={report.topErrors} />

        {report.totalQuestions > 0 && (
          <p className="text-xs text-slate-500 italic bg-white/70 rounded-2xl px-4 py-3 leading-relaxed">
            老師評語：{teacherComment(report)}
          </p>
        )}

        <div className="flex gap-2">
          <Button className="flex-1" onClick={onClose}>
            繼續努力 💪
          </Button>
          <Button variant="outline" onClick={onClear}>
            清除紀錄
          </Button>
        </div>
      </div>
    </div>
  )
}

function SummaryStats({ report }: { report: LearningReport }) {
  return (
    <div className="grid grid-cols-3 gap-3 text-center">
      <Stat label="總題數" value={report.totalQuestions} />
      <Stat label="平均分" value={report.averageScore} suffix="/100" tone="primary" />
      <Stat
        label="最高連擊"
        value={Object.values(report.perLevel).reduce((acc, l) => acc + l.stars, 0)}
        suffix="⭐"
      />
    </div>
  )
}

function Stat({
  label,
  value,
  suffix,
  tone,
}: {
  label: string
  value: number
  suffix?: string
  tone?: 'primary'
}) {
  return (
    <div
      className={
        'rounded-2xl px-3 py-3 ' +
        (tone === 'primary'
          ? 'bg-primary/10 text-primary-dark'
          : 'bg-white text-slate-700')
      }
    >
      <div className="text-2xl font-black leading-tight">
        {value}
        {suffix && <span className="text-sm font-bold ml-0.5">{suffix}</span>}
      </div>
      <div className="text-xs font-bold opacity-70">{label}</div>
    </div>
  )
}

function teacherComment(report: LearningReport): string {
  const avg = report.averageScore
  const errCount = report.topErrors.length
  if (avg >= 85 && errCount <= 1) {
    return '太棒了！你的造句越來越自然，老師很期待你寫更長的文章。'
  }
  if (avg >= 70) {
    return '不錯！針對你最常錯的地方多加練習，很快就會進步。'
  }
  if (avg >= 50) {
    return '繼續加油！試試先把三個詞都用上，語意自然，分數會慢慢提升。'
  }
  return '別灰心。建議先在 L1 多練習基礎句型，再挑戰更難的關卡。'
}

// Suppress unused warning when these are imported indirectly via the report.
export { ERROR_LABEL, ERROR_HINT }