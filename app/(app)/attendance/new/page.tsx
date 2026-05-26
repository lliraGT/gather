'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/context/UserContext'

interface Fields {
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

const FIELD_LABELS: Record<keyof Fields, string> = {
  salon_principal: 'Salón Principal',
  toldo: 'Toldo',
  salon_l: 'Salón L',
  ujieres: 'Ujieres',
  maestros: 'Maestros',
  ninos: 'Niños',
  multimedia: 'Multimedia',
  facebook: 'Facebook',
  zoom: 'Zoom',
}

const PRESENCIAL_FIELDS: (keyof Fields)[] = [
  'salon_principal', 'toldo', 'salon_l', 'ujieres', 'maestros', 'ninos', 'multimedia'
]
const VIRTUAL_FIELDS: (keyof Fields)[] = ['facebook', 'zoom']

const DEFAULT_FIELDS: Fields = {
  salon_principal: 0, toldo: 0, salon_l: 0, ujieres: 0,
  maestros: 0, ninos: 0, multimedia: 0, facebook: 0, zoom: 0,
}

function todaySunday() {
  const today = new Date()
  const day = today.getDay()
  const diff = today.getDate() - day
  const sunday = new Date(today.setDate(diff))
  return sunday.toISOString().split('T')[0]
}

export default function AttendanceNewPage() {
  const { profile, loading: profileLoading } = useUser()
  const router = useRouter()
  const [fields, setFields] = useState<Fields>(DEFAULT_FIELDS)
  const [date, setDate] = useState(todaySunday())
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!profileLoading && profile?.role === 'ANCIANO') {
      router.replace('/dashboard')
    }
  }, [profile, profileLoading, router])

  const presencial = PRESENCIAL_FIELDS.reduce((sum, k) => sum + (fields[k] || 0), 0)
  const virtual = VIRTUAL_FIELDS.reduce((sum, k) => sum + (fields[k] || 0), 0)
  const general = presencial + virtual

  function handleChange(key: keyof Fields, value: string) {
    setFields(prev => ({ ...prev, [key]: parseInt(value) || 0 }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const supabase = createClient()

    const { data: service, error: svcError } = await supabase
      .from('sunday_services')
      .insert({
        date,
        is_special: false,
        notes: notes || null,
        created_by: profile?.id,
      })
      .select('id')
      .single()

    if (svcError || !service) {
      setError('Error al crear el servicio: ' + (svcError?.message ?? ''))
      setSaving(false)
      return
    }

    const { error: recError } = await supabase
      .from('attendance_records')
      .insert({
        service_id: service.id,
        ...fields,
        updated_by: profile?.id,
      })

    if (recError) {
      setError('Error al guardar la asistencia: ' + recError.message)
      setSaving(false)
      return
    }

    router.push('/dashboard')
  }

  if (profileLoading) {
    return <div className="pt-2 animate-pulse"><div className="bg-white rounded-xl h-64" /></div>
  }

  return (
    <div className="pt-2 max-w-3xl">
      <h1 className="text-xl font-semibold text-gray-800 mb-6">Registrar asistencia</h1>

      <form onSubmit={handleSubmit}>
        <div className="flex gap-5 items-start">

          {/* PANEL IZQUIERDO — sticky */}
          <div className="w-56 flex-shrink-0 sticky top-6 flex flex-col gap-4">

            {/* Fecha y notas */}
            <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Fecha del domingo</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E78C8]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Notas (opcional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Ej: Domingo especial..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E78C8]"
                />
              </div>
            </div>

            {/* Totales */}
            <div className="bg-[#1E3A5F] rounded-xl p-4 text-white">
              <p className="text-xs text-white/60 mb-3 uppercase tracking-wide">Resumen</p>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Presencial</span>
                  <span className="font-medium">{presencial}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Virtual</span>
                  <span className="font-medium">{virtual}</span>
                </div>
                <div className="border-t border-white/20 pt-2 flex justify-between items-baseline">
                  <span className="text-sm text-white/70">Total</span>
                  <span className="text-2xl font-bold">{general}</span>
                </div>
              </div>

              {error && <p className="text-red-300 text-xs mb-3">{error}</p>}

              <div className="flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-white text-[#1E3A5F] rounded-lg py-2 text-sm font-semibold hover:bg-white/90 disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="w-full border border-white/30 text-white/80 rounded-lg py-2 text-sm hover:bg-white/10 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>

          {/* PANEL DERECHO — campos */}
          <div className="flex-1 flex flex-col gap-4">

            {/* Presencial */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-4">Presencial</p>
              <div className="grid grid-cols-2 gap-3">
                {PRESENCIAL_FIELDS.map(key => (
                  <div key={key}>
                    <label className="block text-xs text-gray-500 mb-1">{FIELD_LABELS[key]}</label>
                    <input
                      type="number"
                      min="0"
                      value={fields[key]}
                      onChange={e => handleChange(key, e.target.value)}
                      onFocus={e => e.target.select()}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E78C8]"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Virtual */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-4">Virtual</p>
              <div className="grid grid-cols-2 gap-3">
                {VIRTUAL_FIELDS.map(key => (
                  <div key={key}>
                    <label className="block text-xs text-gray-500 mb-1">{FIELD_LABELS[key]}</label>
                    <input
                      type="number"
                      min="0"
                      value={fields[key]}
                      onChange={e => handleChange(key, e.target.value)}
                      onFocus={e => e.target.select()}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E78C8]"
                    />
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </form>
    </div>
  )
}
