'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

interface AttendanceRecord {
  id: string
  service_id: string
  salon_principal: number
  toldo: number
  salon_l: number
  ujieres: number
  maestros: number
  ninos: number
  multimedia: number
  facebook: number
  zoom: number
  total_presencial: number
  total_virtual: number
  total_general: number
  sunday_services?: { id: string; date: string; is_special: boolean } | null
}

interface SundayService {
  id: string
  date: string
  attendance_records: AttendanceRecord[]
}


function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('es-GT', { month: 'short', day: 'numeric' })
}

export default function DashboardPage() {
  const [services, setServices] = useState<SundayService[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('attendance_records')
        .select(`
          id, service_id, salon_principal, toldo, salon_l,
          ujieres, maestros, ninos, multimedia, facebook, zoom,
          total_presencial, total_virtual, total_general,
          sunday_services (id, date, is_special)
        `)
        .limit(300)

      if (error) {
        console.error('Dashboard query error:', error)
        setServices([])
        setLoading(false)
        return
      }

      interface RawRecord {
        id: string
        service_id: string
        salon_principal: number
        toldo: number
        salon_l: number
        ujieres: number
        maestros: number
        ninos: number
        multimedia: number
        facebook: number
        zoom: number
        total_presencial: number
        total_virtual: number
        total_general: number
        sunday_services: { id: string; date: string; is_special: boolean } | null
      }

      const transformed: SundayService[] = ((data as RawRecord[]) ?? [])
        .filter(r => r.sunday_services !== null)
        .map(r => ({
          id: r.sunday_services!.id,
          date: r.sunday_services!.date,
          attendance_records: [r],
        }))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 12)

      setServices(transformed)
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse pt-2">
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl h-24" />
          ))}
        </div>
        <div className="bg-white rounded-xl h-64" />
        <div className="bg-white rounded-xl h-48" />
      </div>
    )
  }

  const servicesWithData = services.filter(s => s.attendance_records?.length > 0)

  if (servicesWithData.length === 0) {
    return (
      <div className="pt-2">
        <h1 className="text-xl font-semibold text-gray-800 mb-6">Dashboard</h1>
        <div className="bg-white rounded-xl p-12 text-center">
          <p className="text-gray-400 text-sm">No hay registros de asistencia aún.</p>
        </div>
      </div>
    )
  }

  const latest = servicesWithData[0]?.attendance_records[0]
  const lastFour = servicesWithData.slice(0, 4).map(s => s.attendance_records[0]?.total_general ?? 0)
  const avg4 = lastFour.length > 0
    ? Math.round(lastFour.reduce((a, b) => a + b, 0) / lastFour.length)
    : 0
  const allTotals = servicesWithData.map(s => s.attendance_records[0]?.total_general ?? 0)
  const maxTotal = Math.max(...allTotals)

  const chartData = [...servicesWithData]
    .reverse()
    .map(s => ({
      fecha: formatDate(s.date),
      total: s.attendance_records[0]?.total_general ?? 0,
    }))

  const tableRows = servicesWithData.slice(0, 8)

  return (
    <div className="pt-2 space-y-6">
      <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">Último domingo</p>
          <p className="text-3xl font-bold text-[#2D6A4F]">
            {latest?.total_general ?? '—'}
          </p>
          <p className="text-xs text-gray-400 mt-1">total general</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">Promedio 4 semanas</p>
          <p className="text-3xl font-bold text-gray-800">{avg4}</p>
          <p className="text-xs text-gray-400 mt-1">total general</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">Máximo histórico</p>
          <p className="text-3xl font-bold text-gray-800">{maxTotal}</p>
          <p className="text-xs text-gray-400 mt-1">total general</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm">
        <p className="text-sm font-medium text-gray-700 mb-4">
          Tendencia últimas 12 semanas
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="fecha"
              tick={{ fontSize: 11, fill: '#9CA3AF' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#9CA3AF' }}
              axisLine={false}
              tickLine={false}
              width={35}
            />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB' }}
            />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#2D6A4F"
              strokeWidth={2}
              dot={{ fill: '#2D6A4F', r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-sm font-medium text-gray-700">Últimas 8 semanas</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-50">
                <th className="text-left px-5 py-3">Fecha</th>
                <th className="text-right px-4 py-3">Presencial</th>
                <th className="text-right px-4 py-3">Virtual</th>
                <th className="text-right px-5 py-3 font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map(s => {
                const rec = s.attendance_records[0]
                return (
                  <tr key={s.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                    <td className="px-5 py-3 text-gray-700">{formatDate(s.date)}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{rec?.total_presencial ?? '—'}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{rec?.total_virtual ?? '—'}</td>
                    <td className="px-5 py-3 text-right font-semibold text-gray-800">{rec?.total_general ?? '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
