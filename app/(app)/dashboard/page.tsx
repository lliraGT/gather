'use client'

export const dynamic = 'force-dynamic'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
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

function linearRegression(data: { total: number }[]): number[] | null {
  const n = data.length
  if (n < 2) return null
  const xMean = (n - 1) / 2
  const yMean = data.reduce((a, b) => a + b.total, 0) / n
  const num = data.reduce((acc, d, i) => acc + (i - xMean) * (d.total - yMean), 0)
  const den = data.reduce((acc, _, i) => acc + (i - xMean) ** 2, 0)
  const m = den !== 0 ? num / den : 0
  const b = yMean - m * xMean
  return data.map((_, i) => Math.round(m * i + b))
}

function getTrendSlope(data: { total: number }[]): number {
  const n = data.length
  if (n < 2) return 0
  const xMean = (n - 1) / 2
  const yMean = data.reduce((a, b) => a + b.total, 0) / n
  const num = data.reduce((acc, d, i) => acc + (i - xMean) * (d.total - yMean), 0)
  const den = data.reduce((acc, _, i) => acc + (i - xMean) ** 2, 0)
  return den !== 0 ? num / den : 0
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

export default function DashboardPage() {
  const [allServices, setAllServices] = useState<SundayService[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)
  const [period, setPeriod] = useState<'12w' | 'ytd' | 'year' | 'all'>('12w')
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())

  const fetchData = useCallback(async () => {
    setLoading(true)
    setFetchError(false)
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
      setFetchError(true)
      setLoading(false)
      return
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
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (loading) {
    return (
      <div className="space-y-4 motion-safe:animate-pulse pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2 bg-white rounded-xl h-24" />
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-xl flex-1 h-[44px]" />
            <div className="bg-white rounded-xl flex-1 h-[44px]" />
          </div>
        </div>
        <div className="bg-white rounded-xl h-64" />
        <div className="bg-white rounded-xl h-48" />
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="pt-2">
        <h1 className="text-xl font-semibold text-gray-800 mb-6">Dashboard</h1>
        <div className="bg-white rounded-xl p-10 text-center">
          <p className="text-gray-600 text-sm mb-1">No se pudo cargar la información.</p>
          <p className="text-gray-500 text-xs mb-5">Verifica tu conexión e intenta de nuevo.</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-[#2E78C8] text-white text-sm font-medium rounded-lg hover:bg-[#2568b0] transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  const servicesWithData = allServices.filter(s => s.attendance_records?.length > 0)

  if (servicesWithData.length === 0) {
    return (
      <div className="pt-2">
        <h1 className="text-xl font-semibold text-gray-800 mb-6">Dashboard</h1>
        <div className="bg-white rounded-xl p-10 text-center">
          <p className="text-gray-600 text-sm mb-1">No hay registros de asistencia aún.</p>
          <p className="text-gray-500 text-xs mb-5">Registra el primer domingo para ver el resumen aquí.</p>
          <a
            href="/attendance/new"
            className="inline-flex items-center gap-1 px-4 py-2 bg-[#1E3A5F] text-white text-sm font-medium rounded-lg hover:bg-[#2E78C8] transition-colors"
          >
            Registrar asistencia
          </a>
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
  const availableYears = Array.from(new Set(
    allServices.map(s => new Date(s.date + 'T00:00:00').getFullYear())
  )).sort((a, b) => b - a)

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
  const trendValues = linearRegression(chartData)
  const chartDataWithTrend = chartData.map((d, i) => ({
    ...d,
    tendencia: trendValues ? trendValues[i] : undefined,
  }))
  const slope = getTrendSlope(chartData)
  const trendLabel = Math.abs(slope) < 1
    ? { text: '→ Tendencia estable', color: 'bg-gray-100 text-gray-500' }
    : slope > 0
    ? { text: `↑ Al alza +${Math.round(slope)}/sem.`, color: 'bg-amber-50 text-amber-600' }
    : { text: `↓ A la baja ${Math.abs(Math.round(slope))}/sem.`, color: 'bg-red-50 text-red-600' }

  const tableRows = servicesWithData.slice(0, 8)

  const chartBreakdownData = [...filteredServices].reverse().map(s => ({
    fecha: formatDate(s.date),
    'Presencial': s.attendance_records[0]?.total_presencial ?? 0,
    'Virtual': s.attendance_records[0]?.total_virtual ?? 0,
  }))

  return (
    <div className="pt-2 space-y-6">
      <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* KPI principal — domina 2/3 del grid */}
        <div className="sm:col-span-2 bg-white rounded-xl p-5 shadow-sm border-t-2 border-[#1E3A5F]">
          <p className="text-xs font-medium text-gray-500 mb-2">
            Último domingo{servicesWithData[0]?.date ? ` · ${formatDate(servicesWithData[0].date)}` : ''}
          </p>
          <p className="text-5xl font-bold text-[#1E3A5F] leading-none">
            {latest?.total_general ?? '—'}
          </p>
          {lastDiff !== null && (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold mt-3 ${lastDiff > 0 ? 'bg-green-50 text-green-700' : lastDiff < 0 ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
              {lastDiff > 0 ? `↑ +${lastDiff} vs sem. ant.` : lastDiff < 0 ? `↓ ${Math.abs(lastDiff)} vs sem. ant.` : '→ Sin cambio'}
            </span>
          )}
        </div>

        {/* KPIs de contexto — apilados en 1/3 */}
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm flex-1">
            <p className="text-xs font-medium text-gray-500 mb-1">Promedio 4 sem.</p>
            <p className="text-2xl font-semibold text-gray-700">{avg4}</p>
            {avgDiff !== null && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold mt-2 ${avgDiff > 0 ? 'bg-green-50 text-green-700' : avgDiff < 0 ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                {avgDiff > 0 ? `↑ +${avgDiff}` : avgDiff < 0 ? `↓ ${Math.abs(avgDiff)}` : '→'}
              </span>
            )}
            {avgPrev !== null && servicesWithData.length >= 5 && (
              <p className="text-xs text-gray-500 mt-1">Prom. ant.: {avgPrev}</p>
            )}
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm flex-1">
            <p className="text-xs font-medium text-gray-500 mb-1">Récord histórico</p>
            <p className="text-2xl font-semibold text-gray-700">{maxTotal}</p>
            {maxService && (
              <p className="text-xs text-gray-500 mt-1">{formatDate(maxService.date)}</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium text-gray-700">
              {period === '12w' ? 'Últimas 12 semanas'
                : period === 'ytd' ? `Año en curso (${currentYear})`
                : period === 'year' ? `Año ${selectedYear}`
                : 'Histórico completo'}
            </p>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${trendLabel.color}`}>
              {trendLabel.text}
            </span>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0 flex-wrap">
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
            {availableYears.filter(y => y < currentYear).length > 0 && (
              <span className="w-px h-4 bg-gray-200 mx-0.5 self-center" />
            )}
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
          <LineChart data={chartDataWithTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="fecha"
              tick={{ fontSize: 11, fill: '#6B7280' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(val, idx) => chartDataWithTrend.length > 20 ? (idx % 4 === 0 ? val : '') : val}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#6B7280' }}
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
              name="Asistencia"
              stroke="#2E78C8"
              strokeWidth={2}
              dot={{ fill: '#2E78C8', r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="tendencia"
              stroke="#f59e0b"
              strokeWidth={1.5}
              strokeDasharray="6 3"
              dot={false}
              activeDot={false}
              name="Tendencia"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm">
        <p className="text-sm font-medium text-gray-700 mb-4">Presencial vs. Virtual</p>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={chartBreakdownData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="fecha"
              tick={{ fontSize: 11, fill: '#6B7280' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(val, idx) => chartBreakdownData.length > 20 ? (idx % 4 === 0 ? val : '') : val}
            />
            <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} width={35} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB' }} />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
            <Line type="monotone" dataKey="Presencial" stroke="#2E78C8" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Virtual"    stroke="#3D5878" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-sm font-medium text-gray-700">Historial reciente</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 border-b border-gray-50">
                <th className="text-left px-5 py-3">Fecha</th>
                <th className="text-right px-4 py-3">Presencial</th>
                <th className="text-right px-4 py-3">Virtual</th>
                <th className="text-right px-4 py-3">vs ant.</th>
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
    </div>
  )
}
