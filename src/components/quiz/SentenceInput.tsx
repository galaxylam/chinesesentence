import { useEffect, useRef, useState } from 'react'
import { Button } from '../ui/Button'
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition'
import { cn } from '../../lib/utils'

export type InputMode = 'text' | 'voice'

const INPUT_MODE_STORAGE_KEY = 'three_word_sentence.inputMode'

function loadInputMode(): InputMode {
  if (typeof localStorage === 'undefined') return 'text'
  try {
    const v = localStorage.getItem(INPUT_MODE_STORAGE_KEY)
    return v === 'voice' ? 'voice' : 'text'
  } catch {
    return 'text'
  }
}

function saveInputMode(mode: InputMode) {
  try {
    localStorage.setItem(INPUT_MODE_STORAGE_KEY, mode)
  } catch {
    /* noop */
  }
}

interface SentenceInputProps {
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  disabled?: boolean
  placeholder?: string
  /** Hint shown beside the input (e.g. the bonus challenge). */
  hint?: string
  /** Minimum chars expected for the current level. */
  minChars?: number
  /** Allow the input to grow taller when typing long sentences. */
  autoFocus?: boolean
}

/**
 * Sentence input with **two modes**:
 *  - **打字 (text)**: standard textarea with char counter.
 *  - **語音 (voice)**: Web Speech API mic button; transcript streams in
 *    as the student speaks and accumulates into the same `value`.
 *
 * Mode preference is persisted in localStorage so the student only picks once.
 */
export default function SentenceInput({
  value,
  onChange,
  onSubmit,
  disabled,
  placeholder = '請用以上三個詞寫一句話…',
  hint,
  minChars,
  autoFocus = true,
}: SentenceInputProps) {
  const [mode, setMode] = useState<InputMode>(() => loadInputMode())
  const ref = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    if (autoFocus && mode === 'text' && ref.current) ref.current.focus()
  }, [autoFocus, mode])

  function changeMode(next: InputMode) {
    setMode(next)
    saveInputMode(next)
  }

  const tooShort = minChars !== undefined && value.length < minChars
  const canSubmit = value.trim().length > 0 && !disabled

  return (
    <div className="space-y-3">
      <ModeToggle mode={mode} onChange={changeMode} disabled={disabled} />

      {mode === 'text' ? (
        <TextArea
          ref={ref}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          tooShort={tooShort}
          canSubmit={canSubmit}
          onSubmit={onSubmit}
        />
      ) : (
        <VoicePanel
          value={value}
          onChange={onChange}
          disabled={disabled}
          tooShort={tooShort}
        />
      )}

      {hint && (
        <div className="text-sm text-slate-500 px-1">{hint}</div>
      )}

      <Button
        variant="primary"
        size="lg"
        onClick={onSubmit}
        disabled={!canSubmit}
        className="w-full"
      >
        提交答案
      </Button>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────────────
// Mode toggle
// ──────────────────────────────────────────────────────────────────────────

function ModeToggle({
  mode,
  onChange,
  disabled,
}: {
  mode: InputMode
  onChange: (m: InputMode) => void
  disabled?: boolean
}) {
  return (
    <div className="inline-flex rounded-full bg-slate-100 p-1 gap-1">
      <ToggleButton
        active={mode === 'text'}
        onClick={() => onChange('text')}
        disabled={disabled}
        icon="⌨️"
        label="打字"
      />
      <ToggleButton
        active={mode === 'voice'}
        onClick={() => onChange('voice')}
        disabled={disabled}
        icon="🎤"
        label="語音"
      />
    </div>
  )
}

function ToggleButton({
  active,
  onClick,
  disabled,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  disabled?: boolean
  icon: string
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'px-4 py-1.5 rounded-full text-sm font-bold transition-all duration-150',
        'flex items-center gap-1.5 min-w-[80px] justify-center',
        active
          ? 'bg-white shadow-soft text-primary'
          : 'text-slate-500 hover:text-slate-700',
        disabled && 'opacity-50 cursor-not-allowed',
      )}
    >
      <span aria-hidden>{icon}</span>
      <span>{label}</span>
    </button>
  )
}

// ──────────────────────────────────────────────────────────────────────────
// Text mode
// ──────────────────────────────────────────────────────────────────────────

import { forwardRef } from 'react'

interface TextAreaProps {
  value: string
  onChange: (v: string) => void
  disabled?: boolean
  placeholder: string
  tooShort: boolean
  canSubmit: boolean
  onSubmit: () => void
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  function TextArea(
    { value, onChange, disabled, placeholder, tooShort, canSubmit, onSubmit },
    ref,
  ) {
    return (
      <div className="relative">
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && canSubmit) {
              e.preventDefault()
              onSubmit()
            }
          }}
          rows={3}
          lang="zh-Hant"
          inputMode="text"
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          disabled={disabled}
          placeholder={placeholder}
          className={cn(
            'zh-input w-full resize-none min-h-[120px] leading-relaxed',
            tooShort && 'border-rose-300 focus:border-rose-400 focus:ring-rose-200',
          )}
        />
        <div className="absolute bottom-2 right-3 text-xs font-bold text-slate-400">
          {value.length} 字
        </div>
      </div>
    )
  },
)

// ──────────────────────────────────────────────────────────────────────────
// Voice mode
// ──────────────────────────────────────────────────────────────────────────

interface VoicePanelProps {
  value: string
  onChange: (v: string) => void
  disabled?: boolean
  tooShort: boolean
}

function VoicePanel({ value, onChange, disabled, tooShort }: VoicePanelProps) {
  const sr = useSpeechRecognition({
    lang: 'zh-TW',
    continuous: true,
    onFinalChunk: (chunk) => {
      // Append the recognized chunk with smart spacing.
      onChange(appendChunk(value, chunk))
    },
  })

  // Auto-stop when disabled (e.g. during scoring).
  useEffect(() => {
    if (disabled && sr.listening) sr.stop()
  }, [disabled, sr])

  return (
    <div className="space-y-3">
      {!sr.supported && (
        <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          ⚠️ 這個瀏覽器不支援語音識別（建議用 Chrome 或 Edge）。請切換到「打字」模式。
        </div>
      )}

      {/* Live transcript display — mirrors what the textarea would show. */}
      <div
        className={cn(
          'rounded-2xl border-2 bg-white min-h-[120px] px-4 py-3 font-zh text-zh-xl leading-relaxed',
          tooShort ? 'border-rose-300' : 'border-slate-200',
          sr.listening && 'ring-4 ring-primary/20 border-primary',
        )}
        lang="zh-Hant"
      >
        {value || (
          <span className="text-slate-400">
            {sr.listening
              ? '請開始說話…'
              : '按下面 🎤 開始錄音'}
          </span>
        )}
        {sr.interim && (
          <span className="text-slate-400 italic ml-1">{sr.interim}</span>
        )}
        {sr.listening && (
          <span
            aria-hidden
            className="inline-block w-0.5 h-5 align-middle bg-rose-500 ml-0.5 animate-pulse"
          />
        )}
        <div className="absolute right-3 text-xs font-bold text-slate-400 mt-1">
          {value.length} 字
        </div>
      </div>

      {sr.error && (
        <div className="rounded-2xl border-2 border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
          ⚠️ {sr.error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={!sr.supported || disabled}
          onClick={sr.listening ? sr.stop : sr.start}
          className={cn(
            'shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-3xl transition-all',
            'shadow-pop tap',
            sr.listening
              ? 'bg-rose-500 text-white animate-pulse-glow'
              : 'bg-primary text-white hover:bg-primary-dark',
            (!sr.supported || disabled) && 'opacity-50 cursor-not-allowed',
          )}
          aria-label={sr.listening ? '停止錄音' : '開始錄音'}
        >
          {sr.listening ? '⏹' : '🎤'}
        </button>
        <div className="flex-1 text-sm text-slate-500 leading-relaxed">
          {sr.listening ? (
            <span className="font-bold text-rose-600">正在聆聽… 講完再按一次停止</span>
          ) : (
            <>
              講完一句話後可再按一次繼續。
              <br />
              <span className="text-xs text-slate-400">
                完成後按下面「提交答案」。
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Smart-append: drop leading whitespace, add a single space when joining
 * mid-sentence (if the previous text didn't end with punctuation/whitespace).
 */
function appendChunk(current: string, chunk: string): string {
  const trimmed = chunk.trimStart()
  if (!current) return trimmed
  const tail = current[current.length - 1]
  if (tail === ' ' || tail === '。' || tail === '，' || tail === '\n') {
    return current + trimmed
  }
  return current + trimmed
}