'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/context/UserContext'
import { AttendanceForm } from '@/components/attendance/AttendanceForm'
import { Fields, DEFAULT_FIELDS } from '@/components/attendance/fields'

export default function AttendanceEditPage() {
  const { profile, loading: profileLoading } = useUser()
  const router = useRouter()
  const params = useParams()
  const serviceId = params.id as string

  const [fields, setFields] = useState<Fields>(DEFAULT_FIELDS)
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
    <div className="pt-2">
      <AttendanceForm
        date={date}
        onDateChange={setDate}
        notes={notes}
        onNotesChange={setNotes}
        fields={fields}
        onFieldChange={handleChange}
        saving={saving}
        error={error}
        onSubmit={handleSubmit}
        onCancel={() => router.push('/history')}
        saveLabel="Guardar cambios"
      />
    </div>
  )
}
