import { useState } from 'react'
import Card from '../ui/Card'
import { Button } from '../ui/Button'

interface IntroModalProps {
  onDismiss: () => void
}

/**
 * One-time intro explaining how the game works.
 * Shown on first launch unless the user has dismissed it before.
 */
export default function IntroModal({ onDismiss }: IntroModalProps) {
  const [step, setStep] = useState(0)

  const steps: Array<{ title: string; body: React.ReactNode }> = [
    {
      title: '歡迎來到三詞造句挑戰 🎉',
      body: (
        <>
          <p className="mb-3">老師每次會給你 <b>三個詞語</b>。</p>
          <p>你的任務是用這三個詞寫出<b>一句完整的中文句子</b>。</p>
        </>
      ),
    },
    {
      title: '看看這個例子 ✏️',
      body: (
        <div className="space-y-2 text-slate-700">
          <div className="flex items-center gap-2">
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg font-bold">昨天</span>
            <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg font-bold">小心翼翼</span>
            <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-lg font-bold">花瓶</span>
          </div>
          <p className="mt-3 text-zh-base">
            <b>你的答案：</b>
            <br />
            昨天，我小心翼翼地把花瓶放在桌上。
          </p>
        </div>
      ),
    },
    {
      title: '老師會給你評分和提示 💡',
      body: (
        <ul className="space-y-2 text-slate-700 list-disc pl-5">
          <li>100 分制，分成 6 個細項</li>
          <li>最多指出 <b>2 個</b> 主要問題</li>
          <li>第一輪只給提示，<b>不會直接給答案</b></li>
          <li>你可以再修改一次，再看老師示範的好句子</li>
        </ul>
      ),
    },
    {
      title: '累積星星 ⭐',
      body: (
        <ul className="space-y-2 text-slate-700 list-disc pl-5">
          <li>⭐ 三個詞都用上</li>
          <li>⭐⭐ 結構及位置正確</li>
          <li>⭐⭐⭐ 還加入人物 / 時間 / 地點 / 心情 / 原因</li>
          <li>每玩 50 題，老師會給你一份<b>學習報告</b></li>
        </ul>
      ),
    },
  ]

  const s = steps[step]
  const isLast = step === steps.length - 1

  return (
    <div className="fixed inset-0 z-30 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-spring-in">
      <Card className="w-full max-w-md">
        <div className="text-zh-2xl font-black mb-3">{s.title}</div>
        <div className="text-slate-600 leading-relaxed text-zh-base">
          {s.body}
        </div>
        <div className="mt-5 flex items-center justify-between">
          <div className="flex gap-1">
            {steps.map((_, i) => (
              <span
                key={i}
                className={
                  'h-1.5 w-6 rounded-full ' +
                  (i === step ? 'bg-primary' : 'bg-slate-200')
                }
              />
            ))}
          </div>
          <Button
            onClick={() => {
              if (isLast) onDismiss()
              else setStep(step + 1)
            }}
          >
            {isLast ? '開始吧！' : '下一步 →'}
          </Button>
        </div>
      </Card>
    </div>
  )
}