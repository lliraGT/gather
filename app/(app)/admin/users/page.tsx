'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/context/UserContext'

interface Profile {
  id: string
  email: string
  full_name: string | null
  role: 'ADMIN' | 'EM' | 'ANCIANO'
  active: boolean
}

const ROLE_LABELS = { ADMIN: 'Admin', EM: 'EM', ANCIANO: 'Anciano' }

export default function AdminUsersPage() {
  const { profile, loading: profileLoading } = useUser()
  const router = useRouter()
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [showInvite, setShowInvite] = useState(false)
  const [editingUser, setEditingUser] = useState<Profile | null>(null)

  const [inviteForm, setInviteForm] = useState({ email: '', full_name: '', role: 'EM' })
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
    if (res.ok) setUsers(await res.json())
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
    const data = await res.json()
    if (!res.ok) {
      setMessage('Error: ' + data.error)
    } else {
      setMessage('Invitación enviada a ' + inviteForm.email)
      setShowInvite(false)
      setInviteForm({ email: '', full_name: '', role: 'EM' })
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
    const data = await res.json()
    if (!res.ok) {
      setMessage('Error: ' + data.error)
    } else {
      setEditingUser(null)
      fetchUsers()
    }
    setSubmitting(false)
  }

  function openEdit(user: Profile) {
    setEditingUser(user)
    setEditForm({ full_name: user.full_name ?? '', role: user.role, active: user.active })
    setMessage('')
  }

  if (profileLoading || loading) {
    return (
      <div className="pt-2 animate-pulse">
        <div className="bg-white rounded-xl h-64" />
      </div>
    )
  }

  return (
    <div className="pt-2 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">Usuarios</h1>
        <button
          onClick={() => { setShowInvite(true); setMessage('') }}
          className="bg-[#2E78C8] text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-[#1E3A5F] transition-colors"
        >
          Invitar usuario
        </button>
      </div>

      {message && (
        <p className={`text-sm px-4 py-2 rounded-lg ${message.startsWith('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
          {message}
        </p>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-400 border-b border-gray-100 bg-gray-50">
              <th className="text-left px-5 py-3">Nombre</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Rol</th>
              <th className="text-left px-4 py-3">Estado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-b border-gray-50 last:border-0">
                <td className="px-5 py-3 text-gray-800">{user.full_name ?? '—'}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{user.email}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    user.role === 'ADMIN' ? 'bg-purple-50 text-purple-700' :
                    user.role === 'EM' ? 'bg-blue-50 text-blue-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {ROLE_LABELS[user.role]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    user.active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {user.active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => openEdit(user)}
                    className="text-xs text-[#2E78C8] hover:underline"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
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
                <option value="EM">EM</option>
                <option value="ANCIANO">Anciano</option>
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
