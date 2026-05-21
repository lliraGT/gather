'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser } from '@/lib/context/UserContext'

const navItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: 'ti-layout-dashboard',
    roles: ['ADMIN', 'EM', 'ANCIANO'],
  },
  {
    href: '/attendance/new',
    label: 'Registrar',
    icon: 'ti-circle-plus',
    roles: ['ADMIN', 'EM'],
  },
  {
    href: '/history',
    label: 'Historial',
    icon: 'ti-history',
    roles: ['ADMIN', 'EM', 'ANCIANO'],
  },
  {
    href: '/admin/users',
    label: 'Usuarios',
    icon: 'ti-users',
    roles: ['ADMIN'],
  },
]

export function BottomNav() {
  const { profile } = useUser()
  const pathname = usePathname()

  const visibleItems = navItems.filter(
    item => !profile || item.roles.includes(profile.role)
  )

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#D8E8F5] flex md:hidden z-10">
      {visibleItems.map(item => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 flex flex-col items-center justify-center py-2 transition-colors ${
              isActive ? 'text-[#2E78C8]' : 'text-gray-400'
            }`}
          >
            <i className={`ti ${item.icon} text-[20px]`} aria-hidden="true" />
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
