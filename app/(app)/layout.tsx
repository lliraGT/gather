import { UserProvider } from '@/lib/context/UserContext'
import { AppShell } from '@/components/layout/AppShell'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <UserProvider>
      <AppShell>{children}</AppShell>
    </UserProvider>
  )
}
