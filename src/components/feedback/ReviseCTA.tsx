import { Button } from '../ui/Button'

interface ReviseCTAProps {
  onRevise: () => void
  onNext: () => void
  /** Show a "see example" hint when the student has not revised yet. */
  hasRevised: boolean
}

/**
 * Two-button row at the bottom of the feedback/example screen.
 * Always renders both buttons; the labels adapt to context.
 */
export default function ReviseCTA({ onRevise, onNext, hasRevised }: ReviseCTAProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-2 pt-2">
      <Button variant="outline" className="flex-1" onClick={onRevise}>
        {hasRevised ? '🔁 再試一次' : '✏️ 再修改一次'}
      </Button>
      <Button className="flex-1" onClick={onNext}>
        🎲 下一題
      </Button>
    </div>
  )
}