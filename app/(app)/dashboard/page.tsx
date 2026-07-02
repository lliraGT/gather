'use client'

export const dynamic = 'force-dynamic'

import { useCallback, useEffect, useState } from 'react'
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

  // Sparkline fantasma del hero card — decorativa, hasta 12 puntos tomados de chartData
  const sparkTotals = chartData.slice(-12).map(d => d.total)
  const sparkMax = Math.max(...sparkTotals)
  const sparkMin = Math.min(...sparkTotals)
  const sparkPoints = sparkTotals.length >= 2
    ? sparkTotals
        .map((t, i) => {
          const x = (i / (sparkTotals.length - 1)) * 420
          const y = sparkMax === sparkMin
            ? 40
            : 2 + (78 - 2) * ((sparkMax - t) / (sparkMax - sparkMin))
          return `${x},${y}`
        })
        .join(' ')
    : null

  return (
    <div className="pt-2">
      <h1 className="text-xl font-semibold text-gray-800 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_210px] gap-[14px] mb-[14px]">
        {/* Hero card — Último domingo */}
        <div
          className="relative overflow-hidden rounded-[14px] py-7 px-8"
          style={{ backgroundImage: 'linear-gradient(130deg, #0D518C 0%, #1a6cb0 100%)' }}
        >
          {/* Decoración circular sutil */}
          <div
            className="pointer-events-none absolute rounded-full"
            style={{
              right: '-50px',
              top: '-50px',
              width: '220px',
              height: '220px',
              background: 'radial-gradient(circle, rgba(255,255,255,.12), transparent 70%)',
            }}
          />
          {/* Sparkline fantasma — decorativa, no interactiva */}
          {sparkPoints && (
            <svg
              className="pointer-events-none absolute"
              style={{ right: '28px', bottom: '20px', opacity: 0.22 }}
              width={160}
              viewBox="0 0 420 80"
              preserveAspectRatio="none"
            >
              <polyline
                points={sparkPoints}
                fill="none"
                stroke="#fff"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
          <p style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,.7)', marginBottom: '10px' }}>
            Último domingo{servicesWithData[0]?.date ? ` · ${formatDate(servicesWithData[0].date)}` : ''}
          </p>
          <p style={{ fontSize: '58px', fontWeight: 800, letterSpacing: '-0.05em', color: '#fff', lineHeight: 1 }}>
            {latest?.total_general ?? '—'}
          </p>
          {lastDiff !== null && (
            <span
              className="inline-flex items-center whitespace-nowrap"
              style={{
                gap: '5px',
                marginTop: '12px',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 600,
                background: lastDiff > 0
                  ? 'rgba(74,222,128,.22)'
                  : lastDiff < 0
                  ? 'rgba(239,68,68,.28)'
                  : 'rgba(255,255,255,.18)',
                color: lastDiff > 0
                  ? '#86efac'
                  : lastDiff < 0
                  ? '#fecaca'
                  : 'rgba(255,255,255,.85)',
              }}
            >
              {lastDiff > 0 ? `↑ +${lastDiff} vs sem. ant.` : lastDiff < 0 ? `↓ ${Math.abs(lastDiff)} vs sem. ant.` : '→ Sin cambio'}
            </span>
          )}
        </div>

        {/* Stats column */}
        <div className="flex flex-col gap-3">
          <div className="rounded-[14px] border border-[#dfe3ea] bg-white px-5 py-[18px]">
            <p style={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#71798a', marginBottom: '6px' }}>
              Promedio 4 sem.
            </p>
            <p style={{ fontSize: '30px', fontWeight: 800, letterSpacing: '-0.04em', color: '#141c30', lineHeight: 1 }}>
              {avg4}
            </p>
            <div className="flex items-center" style={{ gap: '5px', marginTop: '5px', fontSize: '11.5px', color: '#71798a' }}>
              {avgDiff !== null && (
                <span style={{ fontWeight: 600, color: avgDiff > 0 ? '#16a34a' : avgDiff < 0 ? '#DC2626' : '#71798a' }}>
                  {avgDiff > 0 ? `↑ +${avgDiff}` : avgDiff < 0 ? `↓ ${Math.abs(avgDiff)}` : '→'}
                </span>
              )}
              {avgPrev !== null && servicesWithData.length >= 5 && (
                <span>Prom. ant.: {avgPrev}</span>
              )}
            </div>
          </div>
          <div className="rounded-[14px] border border-[#dfe3ea] bg-white px-5 py-[18px]">
            <p style={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#71798a', marginBottom: '6px' }}>
              Récord histórico
            </p>
            <p style={{ fontSize: '30px', fontWeight: 800, letterSpacing: '-0.04em', color: '#141c30', lineHeight: 1 }}>
              {maxTotal}
            </p>
            {maxService && (
              <div className="flex items-center" style={{ gap: '5px', marginTop: '5px', fontSize: '11.5px', color: '#71798a' }}>
                {formatDate(maxService.date)}
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className="rounded-[14px] border border-[#dfe3ea] bg-white"
        style={{ padding: '22px 26px 20px', marginBottom: '14px' }}
      >
        <div
          className="flex flex-wrap items-center justify-between"
          style={{ gap: '10px', marginBottom: '20px' }}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#141c30', margin: 0 }}>
              {period === '12w' ? 'Últimas 12 semanas'
                : period === 'ytd' ? `Año en curso (${currentYear})`
                : period === 'year' ? `Año ${selectedYear}`
                : 'Histórico completo'}
            </p>
            <span
              className="inline-flex items-center"
              style={
                Math.abs(slope) < 1
                  ? { fontSize: '11px', fontWeight: 600, padding: '3px 9px', borderRadius: '20px', background: '#f3f4f6', color: '#6b7280' }
                  : slope > 0
                  ? { fontSize: '11px', fontWeight: 600, padding: '3px 9px', borderRadius: '20px', background: '#fffbeb', border: '1px solid #fde68a', color: '#b45309' }
                  : { fontSize: '11px', fontWeight: 600, padding: '3px 9px', borderRadius: '20px', background: '#fef2f2', color: '#DC2626' }
              }
            >
              {trendLabel.text}
            </span>
          </div>
          <div className="flex items-center flex-shrink-0 flex-wrap" style={{ gap: '3px' }}>
            {(['12w', 'ytd', 'all'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className="transition-colors"
                style={{
                  fontSize: '11.5px',
                  fontWeight: 600,
                  padding: '5px 11px',
                  borderRadius: '7px',
                  border: '1px solid transparent',
                  transition: 'all .12s',
                  background: period === p ? '#0D518C' : 'transparent',
                  color: period === p ? '#fff' : '#71798a',
                }}
                onMouseEnter={e => {
                  if (period !== p) {
                    e.currentTarget.style.background = '#f0f4fa'
                    e.currentTarget.style.color = '#0D518C'
                  }
                }}
                onMouseLeave={e => {
                  if (period !== p) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#71798a'
                  }
                }}
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
                className="transition-colors"
                style={{
                  fontSize: '11.5px',
                  fontWeight: 600,
                  padding: '5px 11px',
                  borderRadius: '7px',
                  border: '1px solid transparent',
                  transition: 'all .12s',
                  background: period === 'year' && selectedYear === y ? '#0D518C' : 'transparent',
                  color: period === 'year' && selectedYear === y ? '#fff' : '#71798a',
                }}
                onMouseEnter={e => {
                  if (!(period === 'year' && selectedYear === y)) {
                    e.currentTarget.style.background = '#f0f4fa'
                    e.currentTarget.style.color = '#0D518C'
                  }
                }}
                onMouseLeave={e => {
                  if (!(period === 'year' && selectedYear === y)) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#71798a'
                  }
                }}
              >
                {y}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartDataWithTrend}>
            <CartesianGrid horizontal vertical={false} stroke="#f0f3f8" />
            <XAxis
              dataKey="fecha"
              tick={{ fontSize: 11, fill: '#71798a' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(val, idx) => chartDataWithTrend.length > 20 ? (idx % 4 === 0 ? val : '') : val}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#71798a' }}
              axisLine={false}
              tickLine={false}
              width={35}
            />
            <Tooltip
              contentStyle={{ background: '#1E3A5F', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, padding: '10px' }}
              itemStyle={{ color: '#fff' }}
              labelStyle={{ color: '#fff' }}
            />
            <Line
              type="monotone"
              dataKey="total"
              name="Asistencia"
              stroke="#2E78C8"
              strokeWidth={2.5}
              dot={{ fill: '#2E78C8', stroke: '#fff', strokeWidth: 1.5, r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="tendencia"
              stroke="#f59e0b"
              strokeWidth={1.6}
              strokeDasharray="5 4"
              dot={false}
              activeDot={false}
              name="Tendencia"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div
        className="rounded-[14px] border border-[#dfe3ea] bg-white"
        style={{ padding: '22px 26px 20px', marginBottom: '14px' }}
      >
        <p style={{ fontSize: '14px', fontWeight: 700, color: '#141c30', margin: 0 }}>
          Presencial vs. Virtual
        </p>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={chartBreakdownData}>
            <CartesianGrid horizontal vertical={false} stroke="#f0f3f8" />
            <XAxis
              dataKey="fecha"
              tick={{ fontSize: 11, fill: '#71798a' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(val, idx) => chartBreakdownData.length > 20 ? (idx % 4 === 0 ? val : '') : val}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#71798a' }}
              axisLine={false}
              tickLine={false}
              width={35}
            />
            <Tooltip
              contentStyle={{ background: '#1E3A5F', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, padding: '10px' }}
              itemStyle={{ color: '#fff' }}
              labelStyle={{ color: '#fff' }}
            />
            <Line
              type="monotone"
              dataKey="Presencial"
              stroke="#2E78C8"
              strokeWidth={2.5}
              dot={{ fill: '#2E78C8', stroke: '#fff', strokeWidth: 1.5, r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="Virtual"
              stroke="#93c5fd"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex items-center" style={{ gap: '18px', marginTop: '14px' }}>
          <div className="flex items-center" style={{ gap: '7px', fontSize: '12px', fontWeight: 500, color: '#71798a' }}>
            <span
              className="inline-block rounded-full"
              style={{ width: '9px', height: '9px', background: '#2E78C8' }}
            />
            Presencial
          </div>
          <div className="flex items-center" style={{ gap: '7px', fontSize: '12px', fontWeight: 500, color: '#71798a' }}>
            <span
              className="inline-block rounded-full"
              style={{ width: '9px', height: '9px', background: '#93c5fd' }}
            />
            Virtual
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[14px] border border-[#dfe3ea] overflow-hidden">
        <div className="px-[26px] pt-[18px] pb-[14px] border-b border-[#dfe3ea]">
          <p className="text-sm font-bold text-[#141c30]">Historial reciente</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#fafbfd] border-b border-[#dfe3ea]">
                <th className="text-left px-[26px] py-[10px] text-[11px] font-bold uppercase tracking-[0.07em] text-[#71798a]">Fecha</th>
                <th className="text-right px-[26px] py-[10px] text-[11px] font-bold uppercase tracking-[0.07em] text-[#71798a]">Presencial</th>
                <th className="text-right px-[26px] py-[10px] text-[11px] font-bold uppercase tracking-[0.07em] text-[#71798a]">Virtual</th>
                <th className="text-right px-[26px] py-[10px] text-[11px] font-bold uppercase tracking-[0.07em] text-[#71798a]">vs ant.</th>
                <th className="text-right px-[26px] py-[10px] text-[11px] font-bold uppercase tracking-[0.07em] text-[#71798a]">Total</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((s, i) => {
                const rec = s.attendance_records[0]
                const nextRec = tableRows[i + 1]?.attendance_records[0]
                const variation = nextRec != null
                  ? (rec?.total_general ?? 0) - (nextRec.total_general ?? 0)
                  : null
                const varColor = variation === null ? '' : variation > 0 ? 'text-[#16a34a]' : variation < 0 ? 'text-[#DC2626]' : 'text-gray-400'
                const varLabel = variation === null ? '—' : variation > 0 ? `+${variation}` : variation < 0 ? `${variation}` : '='
                return (
                  <tr key={s.id} className="border-b border-[#f0f3f8] last:border-0 hover:bg-[#fafbfd]">
                    <td className="px-[26px] py-[13px] text-[13.5px] tabular-nums font-semibold text-[#141c30]">{formatDate(s.date)}</td>
                    <td className="px-[26px] py-[13px] text-[13.5px] tabular-nums text-right text-[#3a4460] font-medium">{rec?.total_presencial ?? '—'}</td>
                    <td className="px-[26px] py-[13px] text-[13.5px] tabular-nums text-right text-[#3a4460] font-medium">{rec?.total_virtual ?? '—'}</td>
                    <td className={`px-[26px] py-[13px] text-[13.5px] tabular-nums text-right font-bold ${varColor}`}>{varLabel}</td>
                    <td className="px-[26px] py-[13px] text-[13.5px] tabular-nums text-right font-bold text-[#141c30]">{rec?.total_general ?? '—'}</td>
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
