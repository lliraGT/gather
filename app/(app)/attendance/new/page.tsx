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
    <div className="pt-2 max-w-lg">
      <h1 className="text-xl font-semibold text-gray-800 mb-6">Registrar asistencia</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white rounded-xl p-5 shadow-sm space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Fecha del domingo</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Notas (opcional)</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Ej: Domingo especial, visitantes..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Presencial</p>
          <div className="grid grid-cols-2 gap-3">
            {PRESENCIAL_FIELDS.map(key => (
              <div key={key}>
                <label className="block text-xs text-gray-500 mb-1">{FIELD_LABELS[key]}</label>
                <input
                  type="number"
                  min="0"
                  value={fields[key]}
                  onChange={e => handleChange(key, e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Virtual</p>
          <div className="grid grid-cols-2 gap-3">
            {VIRTUAL_FIELDS.map(key => (
              <div key={key}>
                <label className="block text-xs text-gray-500 mb-1">{FIELD_LABELS[key]}</label>
                <input
                  type="number"
                  min="0"
                  value={fields[key]}
                  onChange={e => handleChange(key, e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#2D6A4F]/5 rounded-xl p-5">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Total Presencial</span>
            <span className="font-semibold text-gray-800">{presencial}</span>
          </div>
          <div className="flex justify-between text-sm mb-3">
            <span className="text-gray-600">Total Virtual</span>
            <span className="font-semibold text-gray-800">{virtual}</span>
          </div>
          <div className="flex justify-between text-base border-t border-[#2D6A4F]/20 pt-3">
            <span className="font-semibold text-gray-800">Total General</span>
            <span className="font-bold text-[#2D6A4F] text-lg">{general}</span>
          </div>
        </div>

        {error && <p className="text-red-500 text-xs">{error}</p>}

        <div className="flex gap-3 pb-4">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="flex-1 border border-gray-200 text-gray-600 rounded-lg py-2.5 text-sm hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-[#2D6A4F] text-white rounded-lg py-2.5 text-sm font-medium hover:bg-[#1B4332] disabled:opacity-50 transition-colors"
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  )
}
