interface ToastProps {
  message: string
  tone?: 'info' | 'warn' | 'error'
  onClose?: () => void
}

const BG: Record<NonNullable<ToastProps['tone']>, string> = {
  info: 'bg-sky-500',
  warn: 'bg-amber-500',
  error: 'bg-rose-500',
}

/** Small bottom-of-screen toast for transient messages. */
export default function Toast({ message, tone = 'info', onClose }: ToastProps) {
  if (!message) return null
  return (
    <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 pointer-events-none">
      <div
        className={
          'pointer-events-auto rounded-full px-5 py-2 text-white font-bold text-sm shadow-card animate-spring-in ' +
          BG[tone]
        }
      >
        {message}
        {onClose && (
          <button
            onClick={onClose}
            aria-label="關閉"
            className="ml-2 opacity-70 hover:opacity-100"
          >
            ×
          </button>
        )}
      </div>
    </div>
  )
}