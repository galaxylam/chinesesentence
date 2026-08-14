import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Browser-native speech recognition hook.
 *
 * Uses the Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`)
 * with Traditional Chinese (`zh-TW`). Falls back gracefully if the browser
 * doesn't support it.
 *
 * Behaviour:
 *  - `start()` requests mic permission and begins recognition.
 *  - Interim results stream into `interim`; final results accumulate into
 *    `finalTranscript` and trigger `onFinalChunk` so the caller can append.
 *  - Auto-restarts while `continuous` is true (browser stops after silence).
 *  - Stops cleanly on `stop()` or when the component unmounts.
 */

interface SpeechRecognitionResultLike {
  isFinal: boolean
  0: { transcript: string; confidence: number }
}

interface SpeechRecognitionEventLike {
  resultIndex: number
  results: ArrayLike<SpeechRecognitionResultLike> & {
    [index: number]: SpeechRecognitionResultLike
  }
}

interface SpeechRecognitionErrorEventLike {
  error: string
  message?: string
}

interface SpeechRecognitionLike {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  onresult: ((e: SpeechRecognitionEventLike) => void) | null
  onerror: ((e: SpeechRecognitionErrorEventLike) => void) | null
  onend: (() => void) | null
  onstart: (() => void) | null
  start(): void
  stop(): void
  abort(): void
}

function getRecognitionCtor():
  | (new () => SpeechRecognitionLike)
  | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike
    webkitSpeechRecognition?: new () => SpeechRecognitionLike
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export interface SpeechRecognitionController {
  /** Whether the browser supports Web Speech API. */
  supported: boolean
  /** Whether the mic is currently listening. */
  listening: boolean
  /** Live (interim) transcript not yet committed. */
  interim: string
  /** Last error message, if any. Cleared on next `start`. */
  error: string | null
  /** Start listening. Idempotent. */
  start(): void
  /** Stop listening. Idempotent. */
  stop(): void
  /** Reset error state. */
  clearError(): void
}

export interface UseSpeechRecognitionOptions {
  lang?: string
  continuous?: boolean
  onFinalChunk?: (chunk: string) => void
}

export function useSpeechRecognition(
  options: UseSpeechRecognitionOptions = {},
): SpeechRecognitionController {
  const { lang = 'zh-TW', continuous = true, onFinalChunk } = options

  const Ctor = getRecognitionCtor()
  const supported = Ctor !== null
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const onFinalChunkRef = useRef(onFinalChunk)
  const [listening, setListening] = useState(false)
  const [interim, setInterim] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Keep callback ref fresh without re-creating the recognition object.
  useEffect(() => {
    onFinalChunkRef.current = onFinalChunk
  }, [onFinalChunk])

  // Build the recognition instance once.
  useEffect(() => {
    if (!Ctor) return
    const rec = new Ctor()
    rec.lang = lang
    rec.continuous = continuous
    rec.interimResults = true
    rec.maxAlternatives = 1

    rec.onstart = () => {
      setListening(true)
      setError(null)
    }

    rec.onresult = (event) => {
      let finalChunk = ''
      let interimChunk = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i]
        if (r.isFinal) finalChunk += r[0].transcript
        else interimChunk += r[0].transcript
      }
      if (interimChunk) setInterim(interimChunk)
      if (finalChunk) {
        setInterim('')
        onFinalChunkRef.current?.(finalChunk)
      }
    }

    rec.onerror = (e) => {
      setError(errorToMessage(e.error))
      setListening(false)
    }

    rec.onend = () => {
      setListening(false)
      setInterim('')
    }

    recognitionRef.current = rec

    return () => {
      try {
        rec.abort()
      } catch {
        /* noop */
      }
      recognitionRef.current = null
    }
  }, [Ctor, lang, continuous])

  const start = useCallback(() => {
    if (!recognitionRef.current) return
    setError(null)
    try {
      recognitionRef.current.start()
    } catch (e) {
      // Some browsers throw if `start()` is called twice in a row.
      const msg = e instanceof Error ? e.message : '啟動麥克風失敗'
      setError(msg)
    }
  }, [])

  const stop = useCallback(() => {
    if (!recognitionRef.current) return
    try {
      recognitionRef.current.stop()
    } catch {
      /* noop */
    }
  }, [])

  const clearError = useCallback(() => setError(null), [])

  return { supported, listening, interim, error, start, stop, clearError }
}

function errorToMessage(code: string): string {
  switch (code) {
    case 'not-allowed':
    case 'service-not-allowed':
      return '麥克風權限被拒，請到瀏覽器設定允許麥克風。'
    case 'no-speech':
      return '沒聽到聲音，再試一次。'
    case 'audio-capture':
      return '找不到麥克風，請確認裝置。'
    case 'network':
      return '語音服務連不上，請檢查網絡。'
    case 'aborted':
      return ''
    default:
      return `語音識別錯誤 (${code})`
  }
}