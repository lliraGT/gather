'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/context/UserContext'
import { AttendanceForm } from '@/components/attendance/AttendanceForm'
import { Fields, DEFAULT_FIELDS } from '@/components/attendance/fields'

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
        onCancel={() => router.push('/dashboard')}
        saveLabel="Guardar"
      />
    </div>
  )
}
