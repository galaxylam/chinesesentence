import type { LearningReport } from '../../types'

interface LevelProgressProps {
  perLevel: LearningReport['perLevel']
}

const COLORS = ['bg-emerald-500', 'bg-cyan-500', 'bg-amber-500', 'bg-orange-500', 'bg-rose-500']

/** Per-level stars + average score bars. */
export default function LevelProgress({ perLevel }: LevelProgressProps) {
  return (
    <div>
      <div className="text-xs font-black uppercase tracking-wider text-violet-700 mb-2">
        🎮 各關卡進度
      </div>
      <div className="grid grid-cols-5 gap-2">
        {([1, 2, 3, 4, 5] as const).map((lvl, i) => {
          const stat = perLevel[lvl]
          return (
            <div key={lvl} className="bg-white rounded-2xl p-2 text-center shadow-soft">
              <div className="text-xs font-bold text-slate-500">L{lvl}</div>
              <div className={'h-1.5 rounded-full mt-1 ' + COLORS[i] + ' opacity-30'} />
              <div className="mt-2 text-sm font-black text-slate-700">
                {stat.attempts > 0 ? stat.averageScore : '—'}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {stat.attempts > 0 ? `${stat.attempts} 題` : '—'}
              </div>
              <div className="text-[10px] text-amber-600 mt-1">
                ⭐ {stat.stars}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}