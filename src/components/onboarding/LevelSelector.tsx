import type { Difficulty, ProgressData } from '../../types'
import { COMBO_TEMPLATES } from '../../data/comboTemplates'
import { Button } from '../ui/Button'
import { cn } from '../../lib/utils'

interface LevelSelectorProps {
  progress: ProgressData
  onSelect: (level: Difficulty) => void
}

const LEVEL_INTRO: Record<Difficulty, string> = {
  1: '時間 + 地點 + 動作的基礎造句',
  2: '加入形容詞與副詞',
  3: '成語 + 動作類',
  4: '抽象心情 + 自己補充時間地點',
  5: '複雜複句 + 連接詞',
}

const LEVEL_COLOR: Record<Difficulty, string> = {
  1: 'from-green-100 to-emerald-200 text-emerald-700',
  2: 'from-sky-100 to-cyan-200 text-cyan-700',
  3: 'from-amber-100 to-yellow-200 text-amber-700',
  4: 'from-orange-100 to-red-200 text-orange-700',
  5: 'from-rose-100 to-pink-200 text-rose-700',
}

/**
 * Vertical stack of 5 level cards. Locked ones are dimmed & non-clickable.
 * Tap an unlocked card to start that level.
 */
export default function LevelSelector({ progress, onSelect }: LevelSelectorProps) {
  return (
    <div className="space-y-3 mt-2">
      <div className="text-center text-slate-500 text-sm mb-2">
        選擇一個關卡開始
      </div>
      {([1, 2, 3, 4, 5] as Difficulty[]).map((lvl) => {
        const stats = progress.perLevel[lvl]
        const unlocked = progress.unlockedLevel >= lvl
        const tpl = COMBO_TEMPLATES[lvl]
        return (
          <button
            key={lvl}
            onClick={() => unlocked && onSelect(lvl)}
            disabled={!unlocked}
            className={cn(
              'w-full text-left rounded-3xl p-4 border-2 transition-all',
              unlocked
                ? 'bg-white border-slate-200 hover:border-primary hover:shadow-card active:scale-[0.98] cursor-pointer'
                : 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed',
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black bg-gradient-to-br',
                  LEVEL_COLOR[lvl],
                )}
              >
                L{lvl}
              </div>
              <div className="flex-1">
                <div className="font-black text-zh-lg">
                  L{lvl} · {tpl.theme}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {LEVEL_INTRO[lvl]}
                </div>
                {unlocked && stats.attempts > 0 && (
                  <div className="text-xs text-slate-500 mt-1">
                    平均 {Math.round(stats.totalScore / stats.attempts)} 分 · ⭐ {stats.stars}
                    {stats.bestScore > 0 && ` · 最高 ${stats.bestScore}`}
                  </div>
                )}
              </div>
              <div className="text-3xl">
                {unlocked ? '🎮' : '🔒'}
              </div>
            </div>
          </button>
        )
      })}
      <Button
        variant="outline"
        className="w-full mt-2"
        onClick={() => onSelect(progress.unlockedLevel)}
      >
        從已解鎖關卡開始
      </Button>
    </div>
  )
}