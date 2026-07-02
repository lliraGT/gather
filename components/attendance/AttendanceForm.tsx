'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FieldCard } from './FieldCard'
import { ProgressRing } from './ProgressRing'
import { Fields, FIELD_LABELS, PRESENCIAL_FIELDS, VIRTUAL_FIELDS, META } from './fields'

interface AttendanceFormProps {
  date: string
  onDateChange: (value: string) => void
  notes: string
  onNotesChange: (value: string) => void
  fields: Fields
  onFieldChange: (key: keyof Fields, value: string) => void
  saving: boolean
  error: string
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
  saveLabel: string
}

export function AttendanceForm({
  date,
  onDateChange,
  notes,
  onNotesChange,
  fields,
  onFieldChange,
  saving,
  error,
  onSubmit,
  onCancel,
  saveLabel,
}: AttendanceFormProps) {
  const [tab, setTab] = useState<'pres' | 'virt'>('pres')
  const [previousTotal, setPreviousTotal] = useState<number | null>(null)

  const presencial = PRESENCIAL_FIELDS.reduce((sum, k) => sum + (fields[k] || 0), 0)
  const virtual = VIRTUAL_FIELDS.reduce((sum, k) => sum + (fields[k] || 0), 0)
  const total = presencial + virtual

  useEffect(() => {
    let cancelled = false

    async function fetchPrevious() {
      if (!date) return
      const supabase = createClient()
      const { data } = await supabase
        .from('sunday_services')
        .select('date, attendance_records(total_general)')
        .lt('date', date)
        .order('date', { ascending: false })
        .limit(1)

      if (cancelled) return
      const rec = data?.[0]?.attendance_records as unknown as { total_general: number } | { total_general: number }[] | null
      const value = Array.isArray(rec) ? rec[0]?.total_general : rec?.total_general
      setPreviousTotal(typeof value === 'number' ? value : null)
    }

    fetchPrevious()
    return () => { cancelled = true }
  }, [date])

  // Alineación vertical del panel derecho (solo desktop ≥1024px)
  const multimediaRef = useRef<HTMLDivElement>(null)
  const notesCardRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const actionsRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    function fitNotes() {
      const ta = textareaRef.current
      if (!ta) return

      const mq = window.matchMedia('(min-width: 1024px)')
      const notesCard = notesCardRef.current
      const actions = actionsRef.current
      const multi = multimediaRef.current

      if (!mq.matches || !notesCard || !actions || !multi) {
        ta.style.height = ''
        return
      }
      // La card Multimedia solo tiene posición real cuando el tab Presencial está visible
      if (multi.offsetParent === null) return

      ta.style.height = '0px'
      const multiBottom = multi.getBoundingClientRect().bottom
      const actionsH = actions.offsetHeight
      const notesTop = notesCard.getBoundingClientRect().top
      const notesH = multiBottom - 12 - actionsH - notesTop
      const taH = notesH - 55
      ta.style.height = taH > 40 ? `${Math.round(taH)}px` : '40px'
    }

    fitNotes()
    const raf = requestAnimationFrame(fitNotes)
    window.addEventListener('resize', fitNotes)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', fitNotes)
    }
  }, [fields, notes, error, tab])

  return (
    <form onSubmit={onSubmit} className="pb-20 md:pb-0">
      {/* Resumen sticky — solo móvil */}
      <div className="md:hidden sticky top-0 z-10 -mx-4 px-4 py-3 mb-4 bg-white border-b border-[#dfe3ea] flex items-center justify-between">
        <span className="text-[22px] font-extrabold text-[#1E3A5F] leading-none tracking-[-0.03em]">{total}</span>
        <span className="text-xs font-medium text-[#71798a]">P: {presencial} · V: {virtual}</span>
      </div>

      {/* Top bar: fecha + notas */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <label className="flex items-center gap-2 px-3.5 py-[7px] bg-white border border-[#dfe3ea] rounded-full text-sm font-semibold text-[#141c30] cursor-pointer w-full md:w-auto">
          <i className="ti ti-calendar text-[13px] flex-shrink-0" aria-hidden="true" />
          <input
            type="date"
            value={date}
            onChange={e => onDateChange(e.target.value)}
            required
            className="bg-transparent border-none outline-none font-semibold text-sm w-full md:w-auto"
          />
        </label>
        <label className="hidden md:flex items-center gap-2 px-3.5 py-[7px] bg-white border border-[#dfe3ea] rounded-full text-sm text-[#71798a] min-w-[180px] flex-1 max-w-xs cursor-text">
          <i className="ti ti-note text-[13px] flex-shrink-0" aria-hidden="true" />
          <input
            type="text"
            value={notes}
            onChange={e => onNotesChange(e.target.value)}
            placeholder="Notas (opcional)"
            className="bg-transparent border-none outline-none text-sm text-[#141c30] w-full placeholder:text-[#71798a]"
          />
        </label>
      </div>

      {/* Card de progreso total — oculta en móvil (reemplazada por el strip sticky) */}
      <div className="hidden md:flex items-center gap-[22px] bg-white border border-[#dfe3ea] rounded-2xl px-[22px] py-[18px] mb-5">
        <ProgressRing total={total} goal={META} />
        <div className="flex-1">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-[#71798a] mb-0.5">Asistencia total</p>
          <p className="text-[46px] font-extrabold tracking-[-0.06em] text-[#141c30] leading-none">{total}</p>
          <p className="text-xs text-[#71798a] mt-1">
            {previousTotal !== null && <>Semana anterior: <strong className="font-semibold">{previousTotal}</strong> · </>}
            Meta: <strong className="font-semibold">{META}</strong>
          </p>
        </div>
        <div className="flex gap-[22px]">
          <div className="flex flex-col items-end">
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#71798a]">Presencial</span>
            <span className="text-[22px] font-extrabold tracking-[-0.04em] text-[#1E3A5F]">{presencial}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#71798a]">Virtual</span>
            <span className="text-[22px] font-extrabold tracking-[-0.04em] text-[#1E3A5F]">{virtual}</span>
          </div>
        </div>
      </div>

      <div className="lg:flex lg:items-start lg:gap-6">
        {/* Columna principal */}
        <div className="flex-1 min-w-0">
          {/* Tabs */}
          <div className="flex border-b-2 border-[#dfe3ea] mb-[18px]">
            <button
              type="button"
              onClick={() => setTab('pres')}
              className={`flex-1 md:flex-none text-center md:text-left px-5 py-[9px] text-[13.5px] font-semibold border-b-[2.5px] -mb-[2px] transition-colors ${
                tab === 'pres' ? 'text-[#0D518C] border-[#0D518C]' : 'text-[#71798a] border-transparent'
              }`}
            >
              Presencial
            </button>
            <button
              type="button"
              onClick={() => setTab('virt')}
              className={`flex-1 md:flex-none text-center md:text-left px-5 py-[9px] text-[13.5px] font-semibold border-b-[2.5px] -mb-[2px] transition-colors ${
                tab === 'virt' ? 'text-[#0D518C] border-[#0D518C]' : 'text-[#71798a] border-transparent'
              }`}
            >
              Virtual
            </button>
          </div>

          <div className={`${tab === 'pres' ? 'grid' : 'hidden'} grid-cols-1 md:grid-cols-2 gap-[10px] md:gap-3`}>
            {PRESENCIAL_FIELDS.map(key => (
              <div key={key} ref={key === 'multimedia' ? multimediaRef : undefined}>
                <FieldCard
                  label={FIELD_LABELS[key]}
                  value={fields[key]}
                  onChange={v => onFieldChange(key, v)}
                />
              </div>
            ))}
          </div>
          <div className={`${tab === 'virt' ? 'grid' : 'hidden'} grid-cols-1 md:grid-cols-2 gap-[10px] md:gap-3`}>
            {VIRTUAL_FIELDS.map(key => (
              <FieldCard
                key={key}
                label={FIELD_LABELS[key]}
                value={fields[key]}
                onChange={v => onFieldChange(key, v)}
              />
            ))}
          </div>

          {/* Notas + acciones en flujo — tablet y móvil (el panel derecho asume esto en desktop) */}
          <div className="lg:hidden mt-4">
            <div className="bg-white border border-[#dfe3ea] rounded-2xl px-[18px] py-4 mb-3">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-[#71798a] mb-2">Notas</p>
              <textarea
                value={notes}
                onChange={e => onNotesChange(e.target.value)}
                placeholder="Ej. Domingo especial..."
                className="w-full px-[11px] py-[9px] border border-[#dfe3ea] rounded-lg text-sm text-[#141c30] bg-[#f4f6fb] outline-none resize-none focus:border-[#0D518C] min-h-[80px]"
              />
            </div>

            {error && <p className="text-xs text-[#DC2626] mb-2">{error}</p>}

            <div className="flex flex-col md:flex-row gap-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full md:flex-1 h-12 md:h-auto md:py-3 rounded-[10px] bg-[#0D518C] text-white text-sm font-bold hover:bg-[#0b4478] disabled:opacity-50 transition-colors"
              >
                {saving ? 'Guardando...' : saveLabel}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="w-full md:flex-1 py-[11px] rounded-[10px] border-[1.5px] border-[#dfe3ea] text-[#71798a] text-sm font-semibold hover:bg-[#f0f4fa] hover:text-[#141c30] transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>

        {/* Panel derecho — solo desktop */}
        <aside className="hidden lg:flex lg:flex-col lg:w-[254px] lg:flex-shrink-0 lg:sticky lg:top-8 lg:self-start">
          <div className="bg-white border border-[#dfe3ea] rounded-2xl px-[18px] py-5 mb-3">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-[#71798a] mb-3.5">Resumen</p>
            <div className="flex items-center justify-between py-2 border-b border-[#f0f3f8]">
              <span className="text-[13.5px] font-medium text-[#141c30]">Presencial</span>
              <span className="text-lg font-bold tracking-[-0.03em] text-[#1E3A5F]">{presencial}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-[13.5px] font-medium text-[#141c30]">Virtual</span>
              <span className="text-lg font-bold tracking-[-0.03em] text-[#1E3A5F]">{virtual}</span>
            </div>
          </div>

          <div
            className="rounded-2xl p-[18px] mb-3"
            style={{ backgroundImage: 'linear-gradient(135deg, #0D518C 0%, #1565b0 100%)' }}
          >
            <p className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-white/60 mb-1">Total</p>
            <p className="text-[52px] font-extrabold tracking-[-0.07em] text-white leading-none">{total}</p>
          </div>

          <div ref={notesCardRef} className="bg-white border border-[#dfe3ea] rounded-2xl px-[18px] py-4 mb-3 flex flex-col">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-[#71798a] mb-2">Notas</p>
            <textarea
              ref={textareaRef}
              value={notes}
              onChange={e => onNotesChange(e.target.value)}
              placeholder="Ej. Domingo especial..."
              className="w-full px-[11px] py-[9px] border border-[#dfe3ea] rounded-lg text-sm text-[#141c30] bg-[#f4f6fb] outline-none resize-none focus:border-[#0D518C] min-h-[40px]"
            />
          </div>

          {error && <p className="text-xs text-[#DC2626] mb-2">{error}</p>}

          <div ref={actionsRef} className="flex flex-col gap-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 rounded-[10px] bg-[#0D518C] text-white text-sm font-bold hover:bg-[#0b4478] disabled:opacity-50 transition-colors"
            >
              {saving ? 'Guardando...' : saveLabel}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="w-full py-[11px] rounded-[10px] border-[1.5px] border-[#dfe3ea] text-[#71798a] text-sm font-semibold hover:bg-[#f0f4fa] hover:text-[#141c30] transition-colors"
            >
              Cancelar
            </button>
          </div>
        </aside>
      </div>
    </form>
  )
}
