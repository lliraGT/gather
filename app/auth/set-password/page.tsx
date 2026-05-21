'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      setError('Las contraseñas no coinciden')
      return
    }
    if (password.length < 8) {
      setError('Mínimo 8 caracteres')
      return
    }
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError('Error al guardar la contraseña')
      setLoading(false)
    } else {
      setDone(true)
      router.refresh()
      setTimeout(() => router.replace('/dashboard'), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-md p-8">
        <h1 className="text-xl font-semibold text-[#1B1B1B] mb-2">
          Crea tu contraseña
        </h1>
        <p className="text-sm text-[#6B7280] mb-6">
          Elige una contraseña para acceder a Gather.
        </p>
        {done ? (
          <p className="text-green-600 text-sm text-center">
            ¡Bienvenido! Redirigiendo al dashboard...
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              placeholder="Nueva contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5
                         text-sm focus:outline-none focus:ring-2
                         focus:ring-[#2E78C8]"
              required
            />
            <input
              type="password"
              placeholder="Confirmar contraseña"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5
                         text-sm focus:outline-none focus:ring-2
                         focus:ring-[#2E78C8]"
              required
            />
            {error && (
              <p className="text-red-500 text-xs">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2E78C8] text-white rounded-lg py-2.5
                         text-sm font-medium hover:bg-[#1E3A5F]
                         disabled:opacity-50 transition-colors"
            >
              {loading ? 'Guardando...' : 'Crear contraseña'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
