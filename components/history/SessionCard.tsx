'use client'

import { AREAS, AreaKey } from './areas'
import { dayNumber, monthAbbr } from './dateUtils'

export interface SessionCardValues {
  salon_principal: number
  toldo: number
  salon_l: number
  ujieres: number
  maestros: number
  ninos: number
  multimedia: number
  facebook: number
  zoom: number
}

interface SessionCardProps {
  date: string
  values: SessionCardValues
  total: number
  delta: number | null
  canEdit: boolean
  isRemoving?: boolean
  onEdit: () => void
  onDelete: () => void
}

function areaValue(key: AreaKey, values: SessionCardValues): number {
  switch (key) {
    case 'sp': return values.salon_principal
    case 'ni': return values.ninos
    case 'to': return values.toldo
    case 'ma': return values.maestros
    case 'uj': return values.ujieres
    case 'ot': return values.multimedia + values.facebook + values.zoom
  }
}

export function SessionCard({ date, values, total, delta, canEdit, isRemoving, onEdit, onDelete }: SessionCardProps) {
  const parts = AREAS
    .map(area => ({ ...area, value: areaValue(area.key, values) }))
    .filter(p => p.value > 0)
  const barTotal = parts.reduce((sum, p) => sum + p.value, 0) || 1

  return (
    <div
      className={`bg-white border border-[#dfe3ea] rounded-xl px-[18px] py-[13px] flex items-center gap-4 mb-2 last:mb-0 transition-all duration-150 hover:shadow-[0_2px_16px_rgba(13,81,140,0.09)] hover:border-[#c8d8ec] ${isRemoving ? 'opacity-0' : 'opacity-100'}`}
    >
      <div className="w-10 flex-shrink-0 flex flex-col items-center">
        <span className="text-[22px] font-extrabold tracking-[-0.04em] text-[#1E3A5F] leading-none">
          {dayNumber(date)}
        </span>
        <span className="text-[9.5px] font-bold tracking-[0.08em] uppercase text-[#71798a]">
          {monthAbbr(date)}
        </span>
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <div className="h-[7px] rounded flex overflow-hidden gap-px">
          {parts.map(p => (
            <span
              key={p.key}
              style={{ width: `${(p.value / barTotal) * 100}%`, background: p.color }}
              className="h-full rounded-[1px]"
            />
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {parts.map(p => (
            <span key={p.key} className="flex items-center gap-1 text-[10.5px] font-medium text-[#71798a]">
              <span className="w-[7px] h-[7px] rounded-[2px] flex-shrink-0" style={{ background: p.color }} />
              {p.label} <strong className="font-bold text-[#1E3A5F]">{p.value}</strong>
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-end gap-[3px] flex-shrink-0">
        <span className="text-[30px] font-extrabold tracking-[-0.05em] text-[#1E3A5F] leading-none">{total}</span>
        {delta !== null && (
          delta > 0 ? (
            <span className="text-[11px] font-bold text-[#16a34a]">&#9650; {delta} vs ant.</span>
          ) : delta < 0 ? (
            <span className="text-[11px] font-bold text-[#DC2626]">&#9660; {Math.abs(delta)} vs ant.</span>
          ) : (
            <span className="text-[11px] font-bold text-[#9ba5b8]">= igual</span>
          )
        )}
        {canEdit && (
          <div className="flex gap-0.5">
            <button
              type="button"
              onClick={onEdit}
              aria-label="Editar"
              className="p-1 rounded-md text-[#c0c8d8] grid place-items-center transition-colors hover:text-[#0D518C] hover:bg-[#f0f4fa]"
            >
              <i className="ti ti-pencil text-[14px]" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={onDelete}
              aria-label="Eliminar"
              className="p-1 rounded-md text-[#c0c8d8] grid place-items-center transition-colors hover:text-[#DC2626] hover:bg-[#f0f4fa]"
            >
              <i className="ti ti-trash text-[14px]" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
