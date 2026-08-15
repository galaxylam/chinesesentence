import {
  DEFAULT_MODEL,
  MAX_RETRIES,
  OPENROUTER_ENDPOINT,
  SCORING_TIMEOUT_MS,
  USE_JSON_MODE,
} from '../constants/config'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatOptions {
  model?: string
  temperature?: number
  maxTokens?: number
  signal?: AbortSignal
}

interface OpenRouterResponse {
  choices: Array<{ message: { content: string } }>
  error?: { message: string; code?: number | string }
}

/**
 * Send a chat completion to OpenRouter and return the raw content string.
 *
 * JSON-mode is OPTIONAL — if the underlying model doesn't honour
 * `response_format: json_object`, the response may be wrapped in markdown
 * fences, which the parser handles downstream.
 *
 * Retries up to MAX_RETRIES times on transient failures (5xx, 429, network).
 * Logs every step to the browser console for debugging.
 */
export async function chat(
  messages: ChatMessage[],
  opts: ChatOptions = {},
  apiKey: string,
): Promise<string> {
  if (!apiKey) {
    throw new Error('缺少 OpenRouter API key，請在設定中填寫。')
  }

  const model = opts.model ?? DEFAULT_MODEL
  console.info('[openrouter] → request', {
    model,
    useJsonMode: USE_JSON_MODE,
    messages: messages.length,
  })

  let lastErr: unknown = null
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const content = await chatOnce(messages, opts, apiKey, model)
      console.info('[openrouter] ← success', { length: content.length })
      return content
    } catch (err) {
      lastErr = err
      console.warn('[openrouter] ✖ attempt failed', {
        attempt,
        error: err instanceof Error ? err.message : String(err),
      })
      // Don't retry on hard client errors (4xx other than 429).
      if (err instanceof ApiError && err.status >= 400 && err.status < 500 && err.status !== 429) {
        break
      }
      if (attempt < MAX_RETRIES) {
        await sleep(800 * (attempt + 1))
      }
    }
  }
  throw lastErr instanceof Error
    ? lastErr
    : new Error('AI 評分失敗，請稍後再試。')
}

async function chatOnce(
  messages: ChatMessage[],
  opts: ChatOptions,
  apiKey: string,
  model: string,
): Promise<string> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), SCORING_TIMEOUT_MS)
  const signal = opts.signal ?? controller.signal

  const body: Record<string, unknown> = {
    model,
    messages,
    temperature: opts.temperature ?? 0.3,
    max_tokens: opts.maxTokens ?? 2000,
  }
  if (USE_JSON_MODE) body.response_format = { type: 'json_object' }

  try {
    const res = await fetch(OPENROUTER_ENDPOINT, {
      method: 'POST',
      signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        // X-Title must be ASCII (fetch headers are ISO-8859-1 only).
        // OpenRouter uses this for their leaderboard analytics — optional.
        'X-Title': 'Three-Word Sentence Challenge',
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const text = await safeReadText(res)
      console.error('[openrouter] HTTP error', {
        status: res.status,
        body: text.slice(0, 300),
      })
      // 401 (no key / bad key) and 403 (key disabled / expired) signal
      // the user must re-enter their API key.
      if (res.status === 401 || res.status === 403) {
        throw new AuthError(
          `OpenRouter ${res.status}：${text || res.statusText}`,
          res.status,
        )
      }
      throw new ApiError(
        `OpenRouter ${res.status}：${text || res.statusText}`,
        res.status,
      )
    }

    const data = (await res.json()) as OpenRouterResponse
    if (data.error) {
      console.error('[openrouter] API error in body', data.error)
      throw new ApiError(
        `OpenRouter 錯誤：${data.error.message ?? JSON.stringify(data.error)}`,
        typeof data.error.code === 'number' ? data.error.code : 400,
      )
    }
    const content = data.choices?.[0]?.message?.content
    if (!content) {
      throw new Error('OpenRouter 回傳空白內容')
    }
    return content
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      throw new Error(`AI 評分超時（${SCORING_TIMEOUT_MS / 1000} 秒），請重試`)
    }
    throw err
  } finally {
    clearTimeout(timeout)
  }
}

class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

/**
 * Thrown when OpenRouter rejects the request because of an invalid,
 * expired, or unauthorized API key (HTTP 401 / 403).
 * Callers should clear the stored key and route the user back to the
 * setup screen.
 */
export class AuthError extends ApiError {}

async function safeReadText(res: Response): Promise<string> {
  try {
    return (await res.text()).slice(0, 500)
  } catch {
    return ''
  }
}

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms))
}