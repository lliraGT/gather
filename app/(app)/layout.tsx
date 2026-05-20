import { Sidebar } from '@/components/layout/Sidebar'
import { BottomNav } from '@/components/layout/BottomNav'
import { UserProvider } from '@/lib/context/UserContext'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <UserProvider>
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
    </UserProvider>
  )
}
