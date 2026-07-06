'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/context/UserContext'
import { MetricCard } from '@/components/admin/MetricCard'
import { FilterChips, FilterKey } from '@/components/admin/FilterChips'
import { UserRow, UserRowData } from '@/components/admin/UserRow'
import { PendingInviteRow } from '@/components/admin/PendingInviteRow'

interface PendingItem {
  id: string
  email: string
  role: 'ADMIN' | 'EM' | 'ANCIANO'
  invited_at: string
}

interface Metrics {
  total: number
  active: number
  pending: number
  sessionsThisMonth: number
  sessionsLastMonth: number
}

interface AdminUsersResponse {
  users: UserRowData[]
  pending: PendingItem[]
  metrics: Metrics
}

const AVATAR_COLORS = ['#1E3A5F', '#0D518C', '#2E78C8', '#45506a', '#8a93a5']

export default function AdminUsersPage() {
  const { profile, loading: profileLoading } = useUser()
  const router = useRouter()
  const [data, setData] = useState<AdminUsersResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [showInvite, setShowInvite] = useState(false)
  const [editingUser, setEditingUser] = useState<UserRowData | null>(null)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<FilterKey>('all')
  const [resendingEmail, setResendingEmail] = useState<string | null>(null)

  const [inviteForm, setInviteForm] = useState({ email: '', full_name: '', role: 'ANCIANO' })
  const [editForm, setEditForm] = useState({ full_name: '', role: 'EM', active: true })
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!profileLoading && profile?.role !== 'ADMIN') {
      router.replace('/dashboard')
    }
  }, [profile, profileLoading, router])

  useEffect(() => {
    if (profile?.role === 'ADMIN') fetchUsers()
  }, [profile])

  async function fetchUsers() {
    setLoading(true)
    const res = await fetch('/api/admin/users')
    if (res.ok) setData(await res.json())
    setLoading(false)
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setMessage('')
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inviteForm),
    })
    const resData = await res.json()
    if (!res.ok) {
      setMessage('Error: ' + resData.error)
    } else {
      setMessage('Invitación enviada a ' + inviteForm.email)
      setShowInvite(false)
      setInviteForm({ email: '', full_name: '', role: 'ANCIANO' })
      fetchUsers()
    }
    setSubmitting(false)
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editingUser) return
    setSubmitting(true)
    setMessage('')
    const res = await fetch(`/api/admin/users/${editingUser.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    })
    const resData = await res.json()
    if (!res.ok) {
      setMessage('Error: ' + resData.error)
    } else {
      setEditingUser(null)
      fetchUsers()
    }
    setSubmitting(false)
  }

  function openEdit(user: UserRowData) {
    setEditingUser(user)
    setEditForm({ full_name: user.full_name ?? '', role: user.role, active: user.active })
    setMessage('')
  }

  async function handleToggleActive(user: UserRowData) {
    setMessage('')
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !user.active }),
    })
    const resData = await res.json()
    if (!res.ok) {
      setMessage('Error: ' + resData.error)
    } else {
      setMessage(user.active ? 'Usuario desactivado' : 'Usuario activado')
      fetchUsers()
    }
  }

  async function handleResend(email: string) {
    setResendingEmail(email)
    setMessage('')
    const res = await fetch('/api/admin/users/resend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    const resData = await res.json()
    if (!res.ok) {
      setMessage('Error: ' + resData.error)
    } else {
      setMessage('Invitación reenviada a ' + email)
    }
    setResendingEmail(null)
  }

  const users = data?.users ?? []
  const pending = data?.pending ?? []
  const metrics = data?.metrics ?? { total: 0, active: 0, pending: 0, sessionsThisMonth: 0, sessionsLastMonth: 0 }
  const sessionsDelta = metrics.sessionsThisMonth - metrics.sessionsLastMonth

  const q = query.trim().toLowerCase()

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      if (filter === 'pending') return false
      if (filter === 'inactive' && u.active) return false
      if ((filter === 'ADMIN' || filter === 'EM' || filter === 'ANCIANO') && u.role !== filter) return false
      if (q && !(`${u.full_name ?? ''} ${u.email}`.toLowerCase().includes(q))) return false
      return true
    })
  }, [users, filter, q])

  const filteredPending = useMemo(() => {
    if (filter !== 'all' && filter !== 'pending') return []
    return pending.filter(p => !q || p.email.toLowerCase().includes(q))
  }, [pending, filter, q])

  const hasResults = filteredUsers.length > 0 || filteredPending.length > 0

  if (profileLoading || loading) {
    return (
      <div className="pt-2 animate-pulse">
        <div className="bg-white rounded-xl h-64" />
      </div>
    )
  }

  return (
    <div className="pt-2 flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-[22px]">
        <div className="flex flex-col gap-0.5">
          <span className="text-[13px] font-semibold text-[#141c30]">Equipo de GATHER</span>
          <span className="text-[11.5px] text-[#71798a]">
            {metrics.total} usuario{metrics.total === 1 ? '' : 's'}
            {metrics.pending > 0 && ` · ${metrics.pending} invitación${metrics.pending === 1 ? '' : 'es'} pendiente${metrics.pending === 1 ? '' : 's'}`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-white border border-[#dfe3ea] rounded-[9px] px-3 py-[7px] flex-1 md:flex-none md:w-[260px]">
            <i className="ti ti-search text-[14px] text-[#71798a] flex-shrink-0" aria-hidden="true" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar usuario…"
              className="w-full bg-transparent border-none outline-none text-[13px] text-[#141c30] placeholder:text-[#a4acbc]"
            />
          </div>
          <button
            type="button"
            onClick={() => { setShowInvite(true); setMessage('') }}
            className="flex-shrink-0 flex items-center gap-1.5 px-[13px] py-[7px] rounded-[9px] bg-[#0D518C] text-white text-[13px] font-semibold hover:bg-[#083f73] transition-colors"
          >
            <i className="ti ti-plus text-[13px]" aria-hidden="true" />
            Invitar usuario
          </button>
        </div>
      </div>

      {message && (
        <p className={`text-sm px-4 py-2 rounded-lg mb-4 ${message.startsWith('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
          {message}
        </p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <MetricCard value={metrics.total} label="Usuarios totales" />
        <MetricCard value={metrics.active} label="Activos" />
        <MetricCard value={metrics.pending} label="Invitación pendiente" />
        <MetricCard value={metrics.sessionsThisMonth} label="Sesiones registradas este mes" delta={sessionsDelta > 0 ? sessionsDelta : null} />
      </div>

      <div className="mb-3.5">
        <FilterChips value={filter} onChange={setFilter} />
      </div>

      <div className="bg-white border border-[#dfe3ea] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#fafbfd] border-b border-[#dfe3ea]">
              <th style={{ width: '30%' }} className="text-left px-[18px] py-3 text-[10.5px] font-bold uppercase tracking-[0.1em] text-[#9aa3b5]">Usuario</th>
              <th className="text-left px-[18px] py-3 text-[10.5px] font-bold uppercase tracking-[0.1em] text-[#9aa3b5]">Rol</th>
              <th className="text-left px-[18px] py-3 text-[10.5px] font-bold uppercase tracking-[0.1em] text-[#9aa3b5]">Estado</th>
              <th className="hidden md:table-cell text-left px-[18px] py-3 text-[10.5px] font-bold uppercase tracking-[0.1em] text-[#9aa3b5]">Último acceso</th>
              <th className="hidden md:table-cell text-left px-[18px] py-3 text-[10.5px] font-bold uppercase tracking-[0.1em] text-[#9aa3b5]">Actividad · 8 sem</th>
              <th className="px-[18px] py-3" />
            </tr>
          </thead>
          <tbody>
            {!hasResults ? (
              <tr>
                <td colSpan={6} className="text-center py-7 text-[#71798a] text-sm">
                  Sin resultados
                </td>
              </tr>
            ) : (
              <>
                {filteredUsers.map((u, i) => (
                  <UserRow
                    key={u.id}
                    user={u}
                    avatarColor={AVATAR_COLORS[i % AVATAR_COLORS.length]}
                    onEdit={() => openEdit(u)}
                    onToggleActive={() => handleToggleActive(u)}
                  />
                ))}
                {filteredPending.map(p => (
                  <PendingInviteRow
                    key={p.id}
                    email={p.email}
                    role={p.role}
                    invitedAt={p.invited_at}
                    onResend={() => handleResend(p.email)}
                    resending={resendingEmail === p.email}
                  />
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>

      {showInvite && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-base font-semibold text-gray-800 mb-4">Invitar usuario</h2>
            <form onSubmit={handleInvite} className="space-y-3">
              <input
                type="text"
                placeholder="Nombre completo"
                value={inviteForm.full_name}
                onChange={e => setInviteForm(f => ({ ...f, full_name: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E78C8]"
              />
              <input
                type="email"
                placeholder="Correo electrónico"
                value={inviteForm.email}
                onChange={e => setInviteForm(f => ({ ...f, email: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E78C8]"
                required
              />
              <select
                value={inviteForm.role}
                onChange={e => setInviteForm(f => ({ ...f, role: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E78C8]"
              >
                <option value="ANCIANO">Anciano</option>
                <option value="EM">EM</option>
              </select>
              {message && <p className="text-red-500 text-xs">{message}</p>}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowInvite(false)}
                  className="flex-1 border border-gray-200 text-gray-600 rounded-lg py-2 text-sm hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-[#2E78C8] text-white rounded-lg py-2 text-sm font-medium hover:bg-[#1E3A5F] disabled:opacity-50"
                >
                  {submitting ? 'Enviando...' : 'Invitar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingUser && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-base font-semibold text-gray-800 mb-4">
              Editar: {editingUser.email}
            </h2>
            <form onSubmit={handleEdit} className="space-y-3">
              <input
                type="text"
                placeholder="Nombre completo"
                value={editForm.full_name}
                onChange={e => setEditForm(f => ({ ...f, full_name: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E78C8]"
              />
              <select
                value={editForm.role}
                onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E78C8]"
              >
                <option value="EM">EM</option>
                <option value="ANCIANO">Anciano</option>
                <option value="ADMIN">Admin</option>
              </select>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editForm.active}
                  onChange={e => setEditForm(f => ({ ...f, active: e.target.checked }))}
                  className="accent-[#2E78C8]"
                />
                Usuario activo
              </label>
              {message && <p className="text-red-500 text-xs">{message}</p>}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 border border-gray-200 text-gray-600 rounded-lg py-2 text-sm hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-[#2E78C8] text-white rounded-lg py-2 text-sm font-medium hover:bg-[#1E3A5F] disabled:opacity-50"
                >
                  {submitting ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
