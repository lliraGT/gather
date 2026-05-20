'use client'
import { useUser } from '@/lib/context/UserContext'
import { Sidebar } from '@/components/layout/Sidebar'
import { BottomNav } from '@/components/layout/BottomNav'

export function AppShell({ children }: { children: React.ReactNode }) {
  const { loading } = useUser()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <p className="text-sm text-gray-400">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <main className="md:ml-[200px] min-h-screen">
        <div className="pt-0 md:pt-6 pb-16 md:pb-0 px-4 md:px-6">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
