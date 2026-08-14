/**
 * App-level config — API endpoint, default model, app metadata.
 */

export const APP_NAME = '三詞造句挑戰'
export const APP_VERSION = '0.1.0'

/** OpenRouter endpoint — fully OpenAI-compatible. */
export const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions'

/**
 * Default model — fast + cheap + Chinese-strong.
 * The `~` prefix lets OpenRouter auto-route to a free variant when available.
 * Override via localStorage for testing different models.
 */
export const DEFAULT_MODEL = '~deepseek/deepseek-v4-flash-latest'

/** Request timeout for the scoring API call. */
export const SCORING_TIMEOUT_MS = 25_000

/** Max retry attempts on transient failures (network, 429, 5xx). */
export const MAX_RETRIES = 1

/** Storage key for the OpenRouter API key (user-supplied). */
export const API_KEY_STORAGE_KEY = 'three_word_sentence.apiKey'

/** Storage key for the persisted progress. */
export const PROGRESS_STORAGE_KEY = 'three_word_sentence.v1'

/** localStorage flag for whether the user dismissed the intro modal. */
export const INTRO_DISMISSED_KEY = 'three_word_sentence.introDismissed'