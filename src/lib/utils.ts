import clsx, { type ClassValue } from 'clsx'

/** Tailwind-aware class joiner. */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs)
}

/** Crypto-quality UUID, falls back to time-based for older environments. */
export function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

/** Fisher–Yates shuffle, returns a new array. */
export function shuffle<T>(arr: readonly T[]): T[] {
  const out = arr.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** Pick N items without replacement (order preserved from shuffled pool). */
export function pickN<T>(pool: readonly T[], n: number): T[] {
  return shuffle(pool).slice(0, Math.min(n, pool.length))
}

/** Simple count-down debounce helper used by useLocalStorage saves. */
export function debounce<TArgs extends unknown[]>(
  fn: (...args: TArgs) => void,
  wait: number,
): (...args: TArgs) => void {
  let t: ReturnType<typeof setTimeout> | null = null
  return (...args: TArgs) => {
    if (t) clearTimeout(t)
    t = setTimeout(() => fn(...args), wait)
  }
}