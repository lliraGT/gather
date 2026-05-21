'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser } from '@/lib/context/UserContext'
import { createClient } from '@/lib/supabase/client'
import { GatherLogo } from '@/components/ui/GatherLogo'

function getInitials(fullName: string | null, email: string): string {
  if (fullName) {
    const words = fullName.trim().split(/\s+/)
    return words.slice(0, 2).map(w => w[0]).join('').toUpperCase()
  }
  return (email[0] ?? '?').toUpperCase()
}

const sections = [
  {
    label: 'GENERAL',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: 'ti-layout-dashboard', roles: ['ADMIN', 'EM', 'ANCIANO'] },
    ],
  },
  {
    label: 'ASISTENCIA',
    items: [
      { href: '/attendance/new', label: 'Registrar', icon: 'ti-circle-plus', roles: ['ADMIN', 'EM'] },
      { href: '/history', label: 'Historial', icon: 'ti-history', roles: ['ADMIN', 'EM', 'ANCIANO'] },
    ],
  },
  {
    label: 'ADMINISTRACIÓN',
    items: [
      { href: '/admin/users', label: 'Usuarios', icon: 'ti-users', roles: ['ADMIN'] },
    ],
  },
]

export function Sidebar() {
  const { profile } = useUser()
  const pathname = usePathname()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-[200px] bg-white border-r border-[#D8E8F5] flex flex-col z-10">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-5">
        <GatherLogo size={26} />
        <span className="text-[#1E3A5F] font-medium text-base">gather</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-0 overflow-y-auto">
        {sections.map((section, sectionIndex) => {
          const visibleItems = section.items.filter(
            item => !profile || item.roles.includes(profile.role)
          )
          if (visibleItems.length === 0) return null

          return (
            <div key={section.label}>
              {sectionIndex > 0 && (
                <hr className="border-[#D8E8F5] mx-[10px] my-[5px]" />
              )}
              <p className="text-[10px] font-medium tracking-[0.08em] uppercase text-[#7A95B0] px-[10px] pt-2 pb-1">
                {section.label}
              </p>
              {visibleItems.map(item => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-[10px] py-[7px] rounded-lg text-[13px] transition-colors mx-1 ${
                      isActive
                        ? 'bg-[#E6F0FA] text-[#1E3A5F] font-medium'
                        : 'text-[#3D5878] hover:bg-[#E6F0FA] hover:text-[#1E3A5F]'
                    }`}
                  >
                    <i
                      className={`ti ${item.icon} text-[16px] ${isActive ? 'text-[#2E78C8]' : ''}`}
                      aria-hidden="true"
                    />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      {profile && (
        <div className="border-t border-[#D8E8F5] px-3 py-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#E6F0FA] text-[#1E3A5F] text-[11px] font-medium flex items-center justify-center flex-shrink-0">
              {getInitials(profile.full_name, profile.email)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-[#1E3A5F] truncate">
                {profile.full_name ?? profile.email}
              </p>
              <p className="text-[11px] text-[#7A95B0]">{profile.role}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="text-[11px] text-[#7A95B0] hover:text-[#3D5878] transition-colors"
              title="Cerrar sesión"
            >
              <i className="ti ti-logout text-[14px]" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </aside>
  )
}
