interface HintBoxProps {
  hint: string
}

/** Warm gradient callout with lightbulb icon. */
export default function HintBox({ hint }: HintBoxProps) {
  if (!hint) return null
  return (
    <div className="rounded-2xl bg-gradient-to-br from-accent/30 to-primary/15 border-2 border-accent/40 px-4 py-3 animate-pulse-glow">
      <div className="flex items-start gap-3">
        <span className="text-2xl" aria-hidden>💡</span>
        <div>
          <div className="text-xs font-black uppercase tracking-wider text-amber-700 mb-1">
            提示
          </div>
          <div className="text-zh-base font-bold text-slate-800 leading-relaxed">
            {hint}
          </div>
        </div>
      </div>
    </div>
  )
}