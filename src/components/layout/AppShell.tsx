import TopBar from './TopBar'

/**
 * AppShell — the mobile-first outer frame.
 * Holds safe-area padding, full-height layout, and the sticky TopBar.
 * Children render inside the scrollable content area.
 */
interface AppShellProps {
  children?: React.ReactNode
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-[100dvh] flex flex-col">
      <TopBar />
      <main className="flex-1 flex flex-col w-full max-w-3xl mx-auto px-4 pb-6 safe-bottom">
        {children ?? (
          <div className="flex-1 flex items-center justify-center text-center">
            <div className="space-y-3 animate-spring-in">
              <h1 className="text-zh-3xl font-black text-slate-800">
                三詞造句挑戰
              </h1>
              <p className="text-zh-lg text-slate-500">
                每日 10 分鐘，學好中文造句
              </p>
              <div className="pt-6 text-sm text-slate-400">
                🚧 Phase 0 — 骨架已就位
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}