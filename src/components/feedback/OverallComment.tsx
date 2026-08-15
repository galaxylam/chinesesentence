interface OverallCommentProps {
  comment: string
}

/**
 * 整體評語 — 1–3 句的深入評論。涵蓋詞意、標點、自然度、連貫性等。
 * Displayed prominently in the feedback screen.
 */
export default function OverallComment({ comment }: OverallCommentProps) {
  if (!comment) return null
  return (
    <div className="rounded-2xl bg-gradient-to-br from-violet-50 to-sky-50 border-2 border-violet-200 px-4 py-3 animate-spring-in">
      <div className="text-xs font-black uppercase tracking-wider text-violet-700 mb-1">
        📝 老師整體評語
      </div>
      <p className="text-zh-base font-bold text-slate-800 leading-relaxed">
        {comment}
      </p>
    </div>
  )
}