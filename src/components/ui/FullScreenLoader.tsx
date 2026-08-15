interface FullScreenLoaderProps {
  /** Title shown above the spinner. */
  title?: string
  /** Optional secondary line below the title. */
  subtitle?: string
}

/**
 * Full-screen modal-style loading overlay. Covers the viewport with a
 * semi-transparent backdrop and a centred kid-friendly card containing
 * a spinner + message. Blocks all interaction (no close button, no
 * backdrop dismiss) so the user can't accidentally double-submit.
 */
export default function FullScreenLoader({
  title = '老師批改中…',
  subtitle = 'AI 老師正在閱讀你的句子，請稍等一下',
}: FullScreenLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/45 backdrop-blur-sm animate-spring-in"
    >
      <div className="bg-cream rounded-4xl shadow-card px-8 py-7 max-w-xs w-[88%] text-center">
        <Spinner />
        <p className="mt-4 text-zh-xl font-black text-slate-800">{title}</p>
        {subtitle && (
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            {subtitle}
          </p>
        )}
        <div className="mt-4 text-[10px] text-slate-400 tracking-widest uppercase">
          AI grading · please wait
        </div>
      </div>
    </div>
  )
}

/** Three bouncing dots — pure CSS, no library. */
function Spinner() {
  return (
    <div className="flex items-center justify-center gap-2">
      <span
        className="w-3 h-3 rounded-full bg-primary animate-bounce"
        style={{ animationDelay: '0ms' }}
      />
      <span
        className="w-3 h-3 rounded-full bg-secondary animate-bounce"
        style={{ animationDelay: '150ms' }}
      />
      <span
        className="w-3 h-3 rounded-full bg-accent animate-bounce"
        style={{ animationDelay: '300ms' }}
      />
    </div>
  )
}