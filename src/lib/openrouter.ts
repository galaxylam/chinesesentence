import {
  DEFAULT_MODEL,
  MAX_RETRIES,
  OPENROUTER_ENDPOINT,
  SCORING_TIMEOUT_MS,
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
 * Always requests JSON-mode output.
 *
 * Retries up to MAX_RETRIES times on transient failures (5xx, 429, network).
 * Throws an Error with a friendly message otherwise so callers can show a toast.
 */
export async function chat(
  messages: ChatMessage[],
  opts: ChatOptions = {},
  apiKey: string,
): Promise<string> {
  if (!apiKey) {
    throw new Error('缺少 OpenRouter API key，請在設定中填寫。')
  }

  let lastErr: unknown = null
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const content = await chatOnce(messages, opts, apiKey)
      return content
    } catch (err) {
      lastErr = err
      // Don't retry on hard client errors (4xx other than 429).
      if (err instanceof ApiError && err.status >= 400 && err.status < 500 && err.status !== 429) {
        break
      }
      // Wait briefly before retrying.
      if (attempt < MAX_RETRIES) {
        await sleep(500 * (attempt + 1))
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
): Promise<string> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), SCORING_TIMEOUT_MS)
  const signal = opts.signal ?? controller.signal

  try {
    const res = await fetch(OPENROUTER_ENDPOINT, {
      method: 'POST',
      signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': '三詞造句挑戰',
      },
      body: JSON.stringify({
        model: opts.model ?? DEFAULT_MODEL,
        messages,
        response_format: { type: 'json_object' },
        temperature: opts.temperature ?? 0.4,
        max_tokens: opts.maxTokens ?? 700,
      }),
    })

    if (!res.ok) {
      const text = await safeReadText(res)
      throw new ApiError(
        `OpenRouter ${res.status}: ${text || res.statusText}`,
        res.status,
      )
    }

    const data = (await res.json()) as OpenRouterResponse
    const content = data.choices?.[0]?.message?.content
    if (!content) {
      throw new Error('OpenRouter 回傳空白內容')
    }
    return content
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      throw new Error('AI 評分超時，請重試')
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