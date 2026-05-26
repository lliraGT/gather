'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend
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
  const [allServices, setAllServices] = useState<SundayService[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'12w' | 'ytd' | 'year' | 'all'>('12w')
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())

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

      const transformed: SundayService[] = ((data as unknown as RawRecord[]) ?? [])
        .filter(r => r.sunday_services !== null)
        .map(r => ({
          id: r.sunday_services!.id,
          date: r.sunday_services!.date,
          attendance_records: [r],
        }))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      setAllServices(transformed)
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

  const servicesWithData = allServices.filter(s => s.attendance_records?.length > 0)

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
  const prev = servicesWithData[1]?.attendance_records[0]
  const lastDiff = prev != null ? (latest?.total_general ?? 0) - (prev.total_general ?? 0) : null
  const lastFour = servicesWithData.slice(0, 4).map(s => s.attendance_records[0]?.total_general ?? 0)
  const avg4 = lastFour.length > 0
    ? Math.round(lastFour.reduce((a, b) => a + b, 0) / lastFour.length)
    : 0
  const prevFour = servicesWithData.slice(4, 8).map(s => s.attendance_records[0]?.total_general ?? 0)
  const avgPrev = prevFour.length > 0
    ? Math.round(prevFour.reduce((a, b) => a + b, 0) / prevFour.length)
    : null
  const avgDiff = avgPrev !== null && servicesWithData.length >= 5 ? avg4 - avgPrev : null
  const allTotals = servicesWithData.map(s => s.attendance_records[0]?.total_general ?? 0)
  const maxTotal = Math.max(...allTotals)
  const maxService = servicesWithData.find(s => s.attendance_records[0]?.total_general === maxTotal)

  const currentYear = new Date().getFullYear()
  const availableYears = [...new Set(
    allServices.map(s => new Date(s.date + 'T00:00:00').getFullYear())
  )].sort((a, b) => b - a)

  const filteredServices = period === '12w'
    ? servicesWithData.slice(0, 12)
    : period === 'ytd'
    ? servicesWithData.filter(s => new Date(s.date + 'T00:00:00').getFullYear() === currentYear)
    : period === 'year'
    ? servicesWithData.filter(s => new Date(s.date + 'T00:00:00').getFullYear() === selectedYear)
    : servicesWithData

  const chartData = [...filteredServices]
    .reverse()
    .map(s => ({
      fecha: formatDate(s.date),
      total: s.attendance_records[0]?.total_general ?? 0,
    }))
  const chartAvg = chartData.length > 0
    ? Math.round(chartData.reduce((a, b) => a + b.total, 0) / chartData.length)
    : 0

  const tableRows = servicesWithData.slice(0, 8)

  const chartBreakdownData = [...filteredServices].reverse().map(s => ({
    fecha: formatDate(s.date),
    'Salón Principal': s.attendance_records[0]?.salon_principal ?? 0,
    'Toldo': s.attendance_records[0]?.toldo ?? 0,
    'Salón L': s.attendance_records[0]?.salon_l ?? 0,
    'Niños': s.attendance_records[0]?.ninos ?? 0,
  }))

  return (
    <div className="pt-2 space-y-6">
      <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">Último domingo</p>
          <p className="text-4xl font-bold text-[#1E3A5F]">
            {latest?.total_general ?? '—'}
          </p>
          {lastDiff !== null && (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold mt-2 ${lastDiff > 0 ? 'bg-green-50 text-green-700' : lastDiff < 0 ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
              {lastDiff > 0 ? `↑ +${lastDiff} vs sem. ant.` : lastDiff < 0 ? `↓ ${lastDiff} vs sem. ant.` : '→ Sin cambio'}
            </span>
          )}
          <p className="text-xs text-gray-400 mt-1">total general</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">Promedio 4 semanas</p>
          <p className="text-4xl font-bold text-gray-800">{avg4}</p>
          {avgDiff !== null && (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold mt-2 ${avgDiff > 0 ? 'bg-green-50 text-green-700' : avgDiff < 0 ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
              {avgDiff > 0 ? `↑ +${avgDiff} vs 4 sem. ant.` : avgDiff < 0 ? `↓ ${avgDiff} vs 4 sem. ant.` : '→ Sin cambio'}
            </span>
          )}
          {avgPrev !== null && servicesWithData.length >= 5 && (
            <p className="text-xs text-gray-400 mt-0.5">vs {avgPrev} período ant.</p>
          )}
          <p className="text-xs text-gray-400 mt-1">total general</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">Máximo histórico</p>
          <p className="text-4xl font-bold text-gray-800">{maxTotal}</p>
          {maxService && (
            <p className="text-xs text-gray-400 mt-1">récord — {formatDate(maxService.date)}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">total general</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-gray-700">
            {period === '12w' ? 'Últimas 12 semanas'
              : period === 'ytd' ? `Año en curso (${currentYear})`
              : period === 'year' ? `${selectedYear}`
              : 'Histórico completo'}
          </p>
          <div className="flex items-center gap-1 flex-wrap justify-end">
            {(['12w', 'ytd', 'all'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  period === p
                    ? 'bg-[#2E78C8] text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {p === '12w' ? 'Últ. 12 sem.' : p === 'ytd' ? 'Este año' : 'Histórico'}
              </button>
            ))}
            {availableYears.filter(y => y < currentYear).map(y => (
              <button
                key={y}
                onClick={() => { setPeriod('year'); setSelectedYear(y) }}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  period === 'year' && selectedYear === y
                    ? 'bg-[#2E78C8] text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {y}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="fecha"
              tick={{ fontSize: 11, fill: '#9CA3AF' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(val, idx) => chartData.length > 20 ? (idx % 4 === 0 ? val : '') : val}
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
              stroke="#2E78C8"
              strokeWidth={2}
              dot={{ fill: '#2E78C8', r: 3 }}
              activeDot={{ r: 5 }}
            />
            <ReferenceLine
              y={chartAvg}
              stroke="#94a3b8"
              strokeDasharray="4 4"
              label={{ value: `Prom. ${chartAvg}`, position: 'insideTopRight', fontSize: 11, fill: '#64748b' }}
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
                <th className="text-right px-4 py-3">Var.</th>
                <th className="text-right px-5 py-3 font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((s, i) => {
                const rec = s.attendance_records[0]
                const nextRec = tableRows[i + 1]?.attendance_records[0]
                const variation = nextRec != null
                  ? (rec?.total_general ?? 0) - (nextRec.total_general ?? 0)
                  : null
                const varColor = variation === null ? '' : variation > 0 ? 'text-green-600' : variation < 0 ? 'text-red-500' : 'text-gray-400'
                const varLabel = variation === null ? '—' : variation > 0 ? `+${variation}` : variation < 0 ? `${variation}` : '='
                return (
                  <tr key={s.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                    <td className="px-5 py-3 text-gray-700">{formatDate(s.date)}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{rec?.total_presencial ?? '—'}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{rec?.total_virtual ?? '—'}</td>
                    <td className={`px-4 py-3 text-right text-sm ${varColor}`}>{varLabel}</td>
                    <td className="px-5 py-3 text-right font-semibold text-gray-800">{rec?.total_general ?? '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div className="bg-white rounded-xl p-5 shadow-sm">
        <p className="text-sm font-medium text-gray-700 mb-4">Asistencia por grupo</p>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={chartBreakdownData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="fecha"
              tick={{ fontSize: 11, fill: '#9CA3AF' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(val, idx) => chartBreakdownData.length > 20 ? (idx % 4 === 0 ? val : '') : val}
            />
            <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={35} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB' }} />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
            <Line type="monotone" dataKey="Salón Principal" stroke="#2E78C8" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Toldo" stroke="#10b981" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Salón L" stroke="#f59e0b" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Niños" stroke="#8b5cf6" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
