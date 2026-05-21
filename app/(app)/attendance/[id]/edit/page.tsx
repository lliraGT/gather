'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
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

export default function AttendanceEditPage() {
  const { profile, loading: profileLoading } = useUser()
  const router = useRouter()
  const params = useParams()
  const serviceId = params.id as string

  const [fields, setFields] = useState<Fields>({
    salon_principal: 0, toldo: 0, salon_l: 0, ujieres: 0,
    maestros: 0, ninos: 0, multimedia: 0, facebook: 0, zoom: 0,
  })
  const [date, setDate] = useState('')
  const [notes, setNotes] = useState('')
  const [recordId, setRecordId] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!profileLoading && profile?.role === 'ANCIANO') {
      router.replace('/dashboard')
      return
    }

    async function fetchData() {
      const supabase = createClient()
      const { data: svc } = await supabase
        .from('sunday_services')
        .select('id, date, notes')
        .eq('id', serviceId)
        .single()

      const { data: rec } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('service_id', serviceId)
        .single()

      if (svc) {
        setDate(svc.date)
        setNotes(svc.notes ?? '')
      }
      if (rec) {
        setRecordId(rec.id)
        setFields({
          salon_principal: rec.salon_principal,
          toldo: rec.toldo,
          salon_l: rec.salon_l,
          ujieres: rec.ujieres,
          maestros: rec.maestros,
          ninos: rec.ninos,
          multimedia: rec.multimedia,
          facebook: rec.facebook,
          zoom: rec.zoom,
        })
      }
      setLoading(false)
    }

    if (!profileLoading) fetchData()
  }, [profileLoading, profile, serviceId, router])

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

    const { error: svcError } = await supabase
      .from('sunday_services')
      .update({ date, notes: notes || null })
      .eq('id', serviceId)

    if (svcError) {
      setError('Error al actualizar el servicio: ' + svcError.message)
      setSaving(false)
      return
    }

    const { error: recError } = await supabase
      .from('attendance_records')
      .update({ ...fields, updated_by: profile?.id, updated_at: new Date().toISOString() })
      .eq('id', recordId)

    if (recError) {
      setError('Error al actualizar la asistencia: ' + recError.message)
      setSaving(false)
      return
    }

    router.push('/history')
  }

  if (loading || profileLoading) {
    return <div className="pt-2 animate-pulse"><div className="bg-white rounded-xl h-64" /></div>
  }

  return (
    <div className="pt-2 max-w-lg">
      <h1 className="text-xl font-semibold text-gray-800 mb-6">Editar asistencia</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white rounded-xl p-5 shadow-sm space-y-4">
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
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E78C8]"
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
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E78C8]"
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
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E78C8]"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#1E3A5F]/5 rounded-xl p-5">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Total Presencial</span>
            <span className="font-semibold text-gray-800">{presencial}</span>
          </div>
          <div className="flex justify-between text-sm mb-3">
            <span className="text-gray-600">Total Virtual</span>
            <span className="font-semibold text-gray-800">{virtual}</span>
          </div>
          <div className="flex justify-between text-base border-t border-[#1E3A5F]/20 pt-3">
            <span className="font-semibold text-gray-800">Total General</span>
            <span className="font-bold text-[#1E3A5F] text-lg">{general}</span>
          </div>
        </div>

        {error && <p className="text-red-500 text-xs">{error}</p>}

        <div className="flex gap-3 pb-4">
          <button
            type="button"
            onClick={() => router.push('/history')}
            className="flex-1 border border-gray-200 text-gray-600 rounded-lg py-2.5 text-sm hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-[#2E78C8] text-white rounded-lg py-2.5 text-sm font-medium hover:bg-[#1E3A5F] disabled:opacity-50 transition-colors"
          >
            {saving ? 'Guardando...' : 'Actualizar'}
          </button>
        </div>
      </form>
    </div>
  )
}
