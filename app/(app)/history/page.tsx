'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/context/UserContext'

interface Row {
  service_id: string
  date: string
  salon_principal: number
  toldo: number
  salon_l: number
  ujieres: number
  maestros: number
  ninos: number
  multimedia: number
  facebook: number
  zoom: number
  total_general: number
}

function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('es-GT', {
    year: 'numeric', month: 'short', day: 'numeric'
  })
}

const PAGE_SIZE = 15

export default function HistoryPage() {
  const { profile } = useUser()
  const router = useRouter()
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const from = page * PAGE_SIZE
      const to = from + PAGE_SIZE - 1

      const { data, error, count } = await supabase
        .from('attendance_records')
        .select(`
          id, service_id, salon_principal, toldo, salon_l,
          ujieres, maestros, ninos, multimedia, facebook, zoom,
          total_general,
          sunday_services!service_id (
            id, date
          )
        `, { count: 'exact' })
        .order('id', { ascending: false })
        .range(from, to)

      if (error) {
        console.error('History query error:', error)
        setRows([])
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
        total_general: number
        sunday_services: { id: string; date: string }[]
      }

      const mapped: Row[] = ((data as RawRecord[]) ?? [])
        .filter(r => r.sunday_services?.length > 0)
        .map(r => ({
          service_id: r.service_id,
          date: r.sunday_services[0].date,
          salon_principal: r.salon_principal,
          toldo: r.toldo,
          salon_l: r.salon_l,
          ujieres: r.ujieres,
          maestros: r.maestros,
          ninos: r.ninos,
          multimedia: r.multimedia,
          facebook: r.facebook,
          zoom: r.zoom,
          total_general: r.total_general,
        }))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      setRows(mapped)
      setTotal(count ?? 0)
      setLoading(false)
    }
    fetchData()
  }, [page])

  const canEdit = profile?.role === 'ADMIN' || profile?.role === 'EM'
  const totalPages = Math.ceil(total / PAGE_SIZE)

  if (loading) {
    return (
      <div className="pt-2 animate-pulse">
        <div className="bg-white rounded-xl h-96" />
      </div>
    )
  }

  return (
    <div className="pt-2 space-y-4">
      <h1 className="text-xl font-semibold text-gray-800">Historial</h1>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm whitespace-nowrap">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3">Fecha</th>
                <th className="text-right px-3 py-3">S.Ppal</th>
                <th className="text-right px-3 py-3">Toldo</th>
                <th className="text-right px-3 py-3">S.L</th>
                <th className="text-right px-3 py-3">Ujieres</th>
                <th className="text-right px-3 py-3">Maestros</th>
                <th className="text-right px-3 py-3">Niños</th>
                <th className="text-right px-3 py-3">Multi.</th>
                <th className="text-right px-3 py-3">FB</th>
                <th className="text-right px-3 py-3">Zoom</th>
                <th className="text-right px-4 py-3 font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center py-12 text-gray-400 text-sm">
                    No hay registros.
                  </td>
                </tr>
              ) : (
                rows.map(row => (
                  <tr
                    key={row.service_id}
                    className={`border-b border-gray-50 last:border-0 ${
                      canEdit ? 'hover:bg-gray-50 cursor-pointer' : ''
                    }`}
                    onClick={() => canEdit && router.push(`/attendance/${row.service_id}/edit`)}
                  >
                    <td className="px-4 py-3 text-gray-700">{formatDate(row.date)}</td>
                    <td className="px-3 py-3 text-right text-gray-600">{row.salon_principal}</td>
                    <td className="px-3 py-3 text-right text-gray-600">{row.toldo}</td>
                    <td className="px-3 py-3 text-right text-gray-600">{row.salon_l}</td>
                    <td className="px-3 py-3 text-right text-gray-600">{row.ujieres}</td>
                    <td className="px-3 py-3 text-right text-gray-600">{row.maestros}</td>
                    <td className="px-3 py-3 text-right text-gray-600">{row.ninos}</td>
                    <td className="px-3 py-3 text-right text-gray-600">{row.multimedia}</td>
                    <td className="px-3 py-3 text-right text-gray-600">{row.facebook}</td>
                    <td className="px-3 py-3 text-right text-gray-600">{row.zoom}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-800">{row.total_general}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="text-sm text-[#2D6A4F] disabled:text-gray-300 hover:underline"
            >
              Anterior
            </button>
            <span className="text-xs text-gray-400">
              Página {page + 1} de {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="text-sm text-[#2D6A4F] disabled:text-gray-300 hover:underline"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
