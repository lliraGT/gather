'use client'
import { Sidebar } from '@/components/layout/Sidebar'
import { BottomNav } from '@/components/layout/BottomNav'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <div className="hidden md:flex">
        <Sidebar />
      </div>
      <main className="flex-1 overflow-y-auto bg-[#f4f6fb]">
        <div className="px-4 pt-0 pb-16 md:px-[36px] md:pt-[32px] md:pb-[48px]">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
