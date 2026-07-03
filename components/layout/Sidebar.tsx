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
    <aside className="w-[220px] flex-shrink-0 sticky top-0 h-screen bg-white border-r border-[#dfe3ea] flex flex-col">
      {/* Brand */}
      <div className="flex items-center gap-2 px-5 py-[26px] border-b border-[#dfe3ea]">
        <GatherLogo size={34} />
        <span className="text-[18px] font-extrabold text-[#1E3A5F] tracking-[-0.01em]">GATHER</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-[10px] py-4 flex flex-col gap-[18px] overflow-y-auto">
        {sections.map(section => {
          const visibleItems = section.items.filter(
            item => !profile || item.roles.includes(profile.role)
          )
          if (visibleItems.length === 0) return null

          return (
            <div key={section.label}>
              <p className="px-[10px] pb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#b0b8c8]">
                {section.label}
              </p>
              <div className="flex flex-col">
                {visibleItems.map(item => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-[9px] px-[10px] py-[8.5px] rounded-[9px] text-[13.5px] transition-colors ${
                        isActive
                          ? 'bg-[#e8f0fb] text-[#0D518C] font-semibold'
                          : 'text-[#4a5568] font-medium hover:bg-[#f0f4fa] hover:text-[#0D518C]'
                      }`}
                    >
                      <i
                        className={`ti ${item.icon} text-[15px] ${isActive ? 'opacity-100' : 'opacity-65'}`}
                        aria-hidden="true"
                      />
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      {profile && (
        <div className="flex items-center justify-between px-[18px] py-[14px] border-t border-[#dfe3ea]">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-[30px] h-[30px] rounded-full bg-[#1E3A5F] text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0">
              {getInitials(profile.full_name, profile.email)}
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-[#141c30] truncate">
                {profile.full_name ?? profile.email}
              </p>
              <p className="text-[11px] text-[#71798a]">{profile.role}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="text-[#71798a] hover:text-[#0D518C] transition-colors flex-shrink-0"
            title="Cerrar sesión"
          >
            <i className="ti ti-logout text-[14px]" aria-hidden="true" />
          </button>
        </div>
      )}
    </aside>
  )
}
