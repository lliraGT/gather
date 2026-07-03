'use client'

import { SessionCard, SessionCardValues } from './SessionCard'
import { monthSectionLabel } from './dateUtils'

export interface MonthSectionSession {
  serviceId: string
  recordId: string
  date: string
  values: SessionCardValues
  total: number
  delta: number | null
}

interface MonthSectionProps {
  monthKey: string
  sessions: MonthSectionSession[]
  canEdit: boolean
  removingId: string | null
  onEdit: (serviceId: string) => void
  onDelete: (target: { serviceId: string; recordId: string; date: string }) => void
}

export function MonthSection({ monthKey, sessions, canEdit, removingId, onEdit, onDelete }: MonthSectionProps) {
  const totals = sessions.map(s => s.total)
  const avg = Math.round(totals.reduce((a, b) => a + b, 0) / totals.length)
  const peak = Math.max(...totals)

  return (
    <div className="mb-[22px] last:mb-0">
      <div className="flex items-center justify-between mb-2.5 px-0.5">
        <span className="text-[11px] font-bold tracking-[0.1em] uppercase text-[#71798a]">
          {monthSectionLabel(monthKey)}
        </span>
        <span className="text-[11.5px] text-[#71798a]">
          Promedio <strong className="text-[#1E3A5F] font-bold">{avg}</strong> · Pico <strong className="text-[#1E3A5F] font-bold">{peak}</strong>
        </span>
      </div>
      {sessions.map(s => (
        <SessionCard
          key={s.serviceId}
          date={s.date}
          values={s.values}
          total={s.total}
          delta={s.delta}
          canEdit={canEdit}
          isRemoving={removingId === s.serviceId}
          onEdit={() => onEdit(s.serviceId)}
          onDelete={() => onDelete({ serviceId: s.serviceId, recordId: s.recordId, date: s.date })}
        />
      ))}
    </div>
  )
}
