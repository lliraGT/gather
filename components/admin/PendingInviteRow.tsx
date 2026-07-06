'use client'

import { ROLE_BADGE } from './roleBadge'

interface PendingInviteRowProps {
  email: string
  role: 'ADMIN' | 'EM' | 'ANCIANO'
  invitedAt: string
  onResend: () => void
  resending: boolean
}

function daysSince(dateIso: string): number {
  const diffMs = Date.now() - new Date(dateIso).getTime()
  return Math.max(0, Math.floor(diffMs / (24 * 60 * 60 * 1000)))
}

export function PendingInviteRow({ email, role, invitedAt, onResend, resending }: PendingInviteRowProps) {
  const badge = ROLE_BADGE[role]
  const days = daysSince(invitedAt)
  const daysLabel = days === 0 ? 'Invitado hoy' : `Invitado hace ${days} ${days === 1 ? 'día' : 'días'}`

  return (
    <tr className="bg-[#fffdf8] border-b border-[#eef1f6] last:border-0">
      <td className="px-[18px] py-[13px]">
        <div className="flex items-center gap-[11px] min-w-0">
          <div className="w-[34px] h-[34px] rounded-full flex-shrink-0 grid place-items-center text-xs font-bold bg-[#e9d9b8] text-[#8a6d2f]">
            ?
          </div>
          <div className="min-w-0">
            <div className="text-[13.5px] font-bold text-[#141c30] truncate">{email}</div>
            <div className="text-[11.5px] text-[#71798a] mt-px">{daysLabel}</div>
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
        <span className="inline-flex items-center px-[9px] py-[3px] rounded-full text-[11px] font-bold bg-[#fef4e6] text-[#B45309]">
          Pendiente
        </span>
      </td>
      <td className="hidden md:table-cell px-[18px] py-[13px] text-[12.5px] text-[#71798a]">—</td>
      <td className="hidden md:table-cell px-[18px] py-[13px] text-[12.5px] text-[#71798a]">—</td>
      <td className="px-[18px] py-[13px] text-right">
        <button
          type="button"
          onClick={onResend}
          disabled={resending}
          className="text-[12px] font-bold text-[#0D518C] hover:text-[#083f73] disabled:opacity-50 transition-colors"
        >
          {resending ? 'Enviando...' : 'Reenviar invitación'}
        </button>
      </td>
    </tr>
  )
}
