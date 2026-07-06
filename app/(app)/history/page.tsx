'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/context/UserContext'
import { MonthSection } from '@/components/history/MonthSection'
import { ViewToggle } from '@/components/history/ViewToggle'
import { monthKey, monthRangeLabel } from '@/components/history/dateUtils'
import { downloadHistoryCsv } from '@/components/history/exportCsv'

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
const VIEW_STORAGE_KEY = 'gather_history_view'

interface SessionWithDelta extends Row {
  delta: number | null
}

interface MonthGroup {
  key: string
  sessions: SessionWithDelta[]
}

function groupWithDelta(pageRows: Row[], extraRow: Row | null): MonthGroup[] {
  const groups: MonthGroup[] = []
  pageRows.forEach((row, i) => {
    const key = monthKey(row.date)
    let group = groups.find(g => g.key === key)
    if (!group) {
      group = { key, sessions: [] }
      groups.push(group)
    }
    const next = pageRows[i + 1]
    let delta: number | null = null
    if (next && monthKey(next.date) === key) {
      delta = row.total_general - next.total_general
    } else if (!next && extraRow && monthKey(extraRow.date) === key) {
      delta = row.total_general - extraRow.total_general
    }
    group.sessions.push({ ...row, delta })
  })
  return groups
}

export default function HistoryPage() {
  const { profile } = useUser()
  const router = useRouter()
  const [rows, setRows] = useState<Row[]>([])
  const [extraRow, setExtraRow] = useState<Row | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [viewMode, setViewMode] = useState<'cards' | 'list'>(() => {
    if (typeof window === 'undefined') return 'cards'
    return window.localStorage.getItem(VIEW_STORAGE_KEY) === 'list' ? 'list' : 'cards'
  })
  const [deleteTarget, setDeleteTarget] = useState<{
    serviceId: string
    recordId: string
    date: string
  } | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [removingId, setRemovingId] = useState<string | null>(null)

  useEffect(() => {
    window.localStorage.setItem(VIEW_STORAGE_KEY, viewMode)
  }, [viewMode])

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
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
        .range(from, to + 1)

      if (error) {
        console.error('History query error:', error)
        setRows([])
        setExtraRow(null)
        setLoading(false)
        return
      }

      type AttRec = {
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
      }

      interface RawService {
        id: string
        date: string
        attendance_records: AttRec[] | AttRec | null
      }

      const mapped: Row[] = ((data as unknown as RawService[]) ?? [])
        .map(s => {
          const ar = s.attendance_records
          const rec: AttRec | null = Array.isArray(ar)
            ? (ar.length > 0 ? ar[0] : null)
            : ar
          if (!rec) return null
          return {
            record_id: rec.id,
            service_id: s.id,
            date: s.date,
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
        .filter((r): r is Row => r !== null)

      setRows(mapped.slice(0, PAGE_SIZE))
      setExtraRow(mapped.length > PAGE_SIZE ? mapped[PAGE_SIZE] : null)
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

    const res = await fetch(`/api/attendance/${target.serviceId}`, {
      method: 'DELETE',
    })

    if (!res.ok) {
      const data = await res.json()
      setDeleteError(data.error ?? 'Error al eliminar')
      setDeleting(false)
      return
    }

    setDeleteTarget(null)
    setDeleting(false)
    setRemovingId(target.serviceId)
    setTimeout(() => {
      setRows(prev => prev.filter(r => r.service_id !== target.serviceId))
      setTotal(prev => Math.max(0, prev - 1))
      setRemovingId(null)
    }, 300)
  }

  function handleExport() {
    downloadHistoryCsv(rows, `gather-historial-pagina-${page + 1}.csv`)
  }

  const canEdit = profile?.role === 'ADMIN' || profile?.role === 'EM'
  const totalPages = Math.ceil(total / PAGE_SIZE)
  const groups = useMemo(() => groupWithDelta(rows, extraRow), [rows, extraRow])
  const rangeLabel = rows.length > 0
    ? monthRangeLabel(rows[rows.length - 1].date, rows[0].date)
    : ''

  if (loading) {
    return (
      <div className="pt-2 animate-pulse">
        <div className="bg-white rounded-xl h-96" />
      </div>
    )
  }

  return (
    <div className="pt-2 flex flex-col">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex flex-col gap-0.5">
          <span className="text-[13px] font-semibold text-[#141c30]">{rangeLabel}</span>
          <span className="text-[11.5px] text-[#71798a]">
            Página {page + 1} de {Math.max(totalPages, 1)} · {total} sesiones registradas
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <ViewToggle value={viewMode} onChange={setViewMode} />
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3.5 py-[7px] rounded-[9px] border border-[#dfe3ea] bg-white text-[#141c30] text-[13px] font-semibold hover:bg-[#f0f4fa] transition-colors"
          >
            <i className="ti ti-download text-[13px]" aria-hidden="true" />
            <span className="hidden sm:inline">Exportar</span>
          </button>
          {canEdit && (
            <button
              type="button"
              onClick={() => router.push('/attendance/new')}
              className="flex items-center gap-1.5 px-3.5 py-[7px] rounded-[9px] bg-[#0D518C] text-white border border-[#0D518C] text-[13px] font-semibold hover:bg-[#083f73] transition-colors"
            >
              <i className="ti ti-plus text-[13px]" aria-hidden="true" />
              <span className="hidden sm:inline">Nueva sesión</span>
            </button>
          )}
        </div>
      </div>

      {viewMode === 'cards' ? (
        rows.length === 0 ? (
          <div className="bg-white rounded-xl p-10 text-center text-sm text-gray-400">
            No hay registros.
          </div>
        ) : (
          <div>
            {groups.map(g => (
              <MonthSection
                key={g.key}
                monthKey={g.key}
                sessions={g.sessions.map(s => ({
                  serviceId: s.service_id,
                  recordId: s.record_id,
                  date: s.date,
                  values: {
                    salon_principal: s.salon_principal,
                    toldo: s.toldo,
                    salon_l: s.salon_l,
                    ujieres: s.ujieres,
                    maestros: s.maestros,
                    ninos: s.ninos,
                    multimedia: s.multimedia,
                    facebook: s.facebook,
                    zoom: s.zoom,
                  },
                  total: s.total_general,
                  delta: s.delta,
                }))}
                canEdit={canEdit}
                removingId={removingId}
                onEdit={id => router.push(`/attendance/${id}/edit`)}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
        )
      ) : (
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
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-[18px] border-t border-[#dfe3ea] text-[12.5px] text-[#71798a]">
          <button
            type="button"
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="font-semibold text-[#0D518C] disabled:text-[#71798a] disabled:cursor-default"
          >
            ← Anterior
          </button>
          <span>Página {page + 1} de {totalPages}</span>
          <button
            type="button"
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="font-semibold text-[#0D518C] disabled:text-[#71798a] disabled:cursor-default"
          >
            Siguiente →
          </button>
        </div>
      )}

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
