import type { Word } from '../../types'
import WordCard from './WordCard'

interface WordTrayProps {
  words: Word[]
}

/** Horizontal row of WordCards. Stacks on very narrow viewports. */
export default function WordTray({ words }: WordTrayProps) {
  return (
    <div className="grid grid-cols-3 gap-3 sm:flex sm:flex-row sm:justify-center sm:gap-4">
      {words.map((w, i) => (
        <WordCard key={w.id} word={w} index={i} />
      ))}
    </div>
  )
}