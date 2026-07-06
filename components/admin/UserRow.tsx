'use client'

import { useEffect, useRef, useState } from 'react'
import { ROLE_BADGE } from './roleBadge'
import { formatRelative, formatAbsolute } from './formatAccess'

export interface UserRowData {
  id: string
  email: string
  full_name: string | null
  role: 'ADMIN' | 'EM' | 'ANCIANO'
  active: boolean
  last_sign_in_at: string | null
  weekly_activity: number[] | null
}

interface UserRowProps {
  user: UserRowData
  avatarColor: string
  onEdit: () => void
  onToggleActive: () => void
}

function initials(fullName: string | null, email: string): string {
  if (fullName) {
    const words = fullName.trim().split(/\s+/)
    return words.slice(0, 2).map(w => w[0]).join('').toUpperCase()
  }
  return (email[0] ?? '?').toUpperCase()
}

export function UserRow({ user, avatarColor, onEdit, onToggleActive }: UserRowProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(null)
  const moreBtnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node
      if (menuRef.current?.contains(target) || moreBtnRef.current?.contains(target)) return
      setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  function toggleMenu() {
    if (!menuOpen && moreBtnRef.current) {
      const rect = moreBtnRef.current.getBoundingClientRect()
      setMenuPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right })
    }
    setMenuOpen(o => !o)
  }

  const badge = ROLE_BADGE[user.role]
  const activity = user.weekly_activity ?? Array(8).fill(0)
  const max = Math.max(...activity, 1)

  return (
    <tr className="group border-b border-[#eef1f6] last:border-0 transition-colors duration-100 hover:bg-[#fafbfd]">
      <td className="px-[18px] py-[13px]">
        <div className="flex items-center gap-[11px] min-w-0">
          <div
            className="w-[34px] h-[34px] rounded-full flex-shrink-0 grid place-items-center text-white text-xs font-bold"
            style={{ background: avatarColor }}
          >
            {initials(user.full_name, user.email)}
          </div>
          <div className="min-w-0">
            <div className="text-[13.5px] font-bold text-[#141c30] truncate">{user.full_name ?? user.email}</div>
            <div className="text-[11.5px] text-[#71798a] mt-px truncate">{user.email}</div>
          </div>
        </div>
      </td>
      <td className="px-[18px] py-[13px]">
        <span
          className="inline-flex items-center px-[9px] py-[3px] rounded-full text-[11px] font-bold"
          style={{ background: badge.bg, color: badge.text }}
        >
          {badge.label}
        </span>
      </td>
      <td className="px-[18px] py-[13px]">
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${user.active ? 'text-[#16a34a]' : 'text-[#9ba5b8]'}`}>
          <span className={`w-[7px] h-[7px] rounded-full flex-shrink-0 ${user.active ? 'bg-[#16a34a]' : 'bg-[#c3cad6]'}`} />
          {user.active ? 'Activo' : 'Inactivo'}
        </span>
      </td>
      <td className="hidden md:table-cell px-[18px] py-[13px]">
        {user.last_sign_in_at ? (
          <div className="text-[12.5px] text-[#71798a]">
            <div className="font-semibold text-[#141c30] text-[12.5px]">{formatRelative(user.last_sign_in_at)}</div>
            {formatAbsolute(user.last_sign_in_at)}
          </div>
        ) : (
          <span className="text-[12.5px] text-[#71798a]">—</span>
        )}
      </td>
      <td className="hidden md:table-cell px-[18px] py-[13px]">
        <div className="flex items-end gap-0.5 h-[22px]">
          {activity.map((v, i) => (
            <span
              key={i}
              className="w-[5px] rounded-[2px]"
              style={{
                height: `${Math.max((v / max) * 100, 8)}%`,
                background: v === max && v > 0 ? '#0D518C' : '#d3e2f3',
              }}
            />
          ))}
        </div>
      </td>
      <td className="px-[18px] py-[13px] relative">
        <div className="flex items-center justify-end gap-0.5 opacity-35 group-hover:opacity-100 transition-opacity duration-[120ms]">
          <button
            type="button"
            onClick={onEdit}
            aria-label="Editar"
            className="p-[5px] rounded-md text-[#8a93a5] grid place-items-center hover:text-[#0D518C] hover:bg-[#f0f4fa] transition-colors"
          >
            <i className="ti ti-pencil text-[14px]" aria-hidden="true" />
          </button>
          <button
            ref={moreBtnRef}
            type="button"
            onClick={toggleMenu}
            aria-label="Más opciones"
            className="p-[5px] rounded-md text-[#8a93a5] grid place-items-center hover:text-[#0D518C] hover:bg-[#f0f4fa] transition-colors"
          >
            <i className="ti ti-dots text-[14px]" aria-hidden="true" />
          </button>
        </div>
        {menuOpen && menuPos && (
          <div
            ref={menuRef}
            className="fixed z-20 bg-white border border-[#dfe3ea] rounded-lg shadow-lg py-1 min-w-[140px]"
            style={{ top: menuPos.top, right: menuPos.right }}
          >
            <button
              type="button"
              onClick={() => { setMenuOpen(false); onToggleActive() }}
              className="w-full text-left px-3 py-2 text-xs font-medium text-[#141c30] hover:bg-[#f0f4fa]"
            >
              {user.active ? 'Desactivar' : 'Activar'}
            </button>
          </div>
        )}
      </td>
    </tr>
  )
}
