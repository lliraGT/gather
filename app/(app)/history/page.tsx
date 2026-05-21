'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/context/UserContext'

interface Row {
  record_id: string
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
  const [deleteTarget, setDeleteTarget] = useState<{
    serviceId: string
    recordId: string
    date: string
  } | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const from = page * PAGE_SIZE
      const to = from + PAGE_SIZE - 1

      const { data, error, count } = await supabase
        .from('sunday_services')
        .select(`
          id, date,
          attendance_records (
            id, salon_principal, toldo, salon_l,
            ujieres, maestros, ninos, multimedia, facebook, zoom,
            total_general
          )
        `, { count: 'exact' })
        .order('date', { ascending: false })
        .range(from, to)

      if (error) {
        console.error('History query error:', error)
        setRows([])
        setLoading(false)
        return
      }

      interface RawService {
        id: string
        date: string
        attendance_records: {
          id: string
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
        }[]
      }

      const mapped: Row[] = ((data as unknown as RawService[]) ?? [])
        .filter(r => r.attendance_records.length > 0)
        .map(r => {
          const rec = r.attendance_records[0]
          return {
            record_id: rec.id,
            service_id: r.id,
            date: r.date,
            salon_principal: rec.salon_principal,
            toldo: rec.toldo,
            salon_l: rec.salon_l,
            ujieres: rec.ujieres,
            maestros: rec.maestros,
            ninos: rec.ninos,
            multimedia: rec.multimedia,
            facebook: rec.facebook,
            zoom: rec.zoom,
            total_general: rec.total_general,
          }
        })

      setRows(mapped)
      setTotal(count ?? 0)
      setLoading(false)
    }
    fetchData()
  }, [page])

  async function handleDelete() {
    if (!deleteTarget) return
    const target = deleteTarget
    setDeleting(true)
    setDeleteError('')
    const supabase = createClient()

    const { error: recErr } = await supabase
      .from('attendance_records')
      .delete()
      .eq('id', target.recordId)

    if (recErr) {
      setDeleteError('Error al eliminar el registro.')
      setDeleting(false)
      return
    }

    const { error: svcErr } = await supabase
      .from('sunday_services')
      .delete()
      .eq('id', target.serviceId)

    if (svcErr) {
      setDeleteError('Error al eliminar el servicio.')
      setDeleting(false)
      return
    }

    setDeleteTarget(null)
    setDeleting(false)
    setRows(prev => prev.filter(r => r.service_id !== target.serviceId))
    setTotal(prev => Math.max(0, prev - 1))
  }

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
                {canEdit && <th className="px-3 py-3" />}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={canEdit ? 12 : 11} className="text-center py-12 text-gray-400 text-sm">
                    No hay registros.
                  </td>
                </tr>
              ) : (
                rows.map(row => (
                  <tr
                    key={row.service_id}
                    className="border-b border-gray-50 last:border-0"
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
                    {canEdit && (
                      <td className="px-3 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => router.push(`/attendance/${row.service_id}/edit`)}
                            className="p-1.5 rounded-lg text-[#2E78C8] hover:bg-[#E6F0FA] transition-colors"
                            title="Editar"
                          >
                            <i className="ti ti-pencil text-[14px]" aria-hidden="true" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget({ serviceId: row.service_id, recordId: row.record_id, date: row.date })}
                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                            title="Eliminar"
                          >
                            <i className="ti ti-trash text-[14px]" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    )}
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
              className="text-sm text-[#2E78C8] disabled:text-gray-300 hover:underline"
            >
              Anterior
            </button>
            <span className="text-xs text-gray-400">
              Página {page + 1} de {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="text-sm text-[#2E78C8] disabled:text-gray-300 hover:underline"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-2">Eliminar registro</h2>
            <p className="text-sm text-gray-600 mb-4">
              ¿Eliminar el registro del{' '}
              <span className="font-medium">{formatDate(deleteTarget.date)}</span>?{' '}
              Esta acción no se puede deshacer.
            </p>
            {deleteError && (
              <p className="text-red-500 text-xs mb-3">{deleteError}</p>
            )}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setDeleteTarget(null); setDeleteError('') }}
                disabled={deleting}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {deleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
