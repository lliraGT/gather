'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/context/UserContext'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', roles: ['ADMIN', 'EM', 'ANCIANO'] },
  { href: '/attendance/new', label: 'Registrar', roles: ['ADMIN', 'EM'] },
  { href: '/history', label: 'Historial', roles: ['ADMIN', 'EM', 'ANCIANO'] },
  { href: '/admin/users', label: 'Usuarios', roles: ['ADMIN'] },
]

export function Sidebar() {
  const { profile } = useUser()
  const pathname = usePathname()
  const router = useRouter()

  const visibleItems = navItems.filter(
    item => !profile || item.roles.includes(profile.role)
  )

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.refresh()
    router.push('/login')
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-[200px] bg-white border-r border-gray-100 flex flex-col z-10">
      <div className="px-5 py-6">
        <span className="text-[#2D6A4F] font-bold text-lg tracking-tight">
          Gather
        </span>
      </div>

      <nav className="flex-1 px-3">
        {visibleItems.map(item => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2 rounded-lg mb-1 text-sm transition-colors ${
                isActive
                  ? 'bg-[#2D6A4F]/10 text-[#2D6A4F] font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      {profile && (
        <div className="px-4 py-4 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-800 truncate">
            {profile.full_name ?? profile.email}
          </p>
          <p className="text-xs text-gray-400 mb-3">{profile.role}</p>
          <button
            onClick={handleSignOut}
            className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </aside>
  )
}
