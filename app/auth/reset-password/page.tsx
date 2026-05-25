'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type State = 'checking' | 'idle' | 'loading' | 'done' | 'error'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [state, setState] = useState<State>('checking')
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace('/login?error=link_expirado')
      } else {
        setState('idle')
      }
    })
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) {
      setError('Mínimo 8 caracteres')
      return
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden')
      return
    }
    setError('')
    setState('loading')
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError('Error al guardar la contraseña')
      setState('idle')
    } else {
      setState('done')
      setTimeout(() => router.replace('/dashboard'), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-md p-8">
        <h1 className="text-xl font-semibold text-[#1B1B1B] mb-2">
          Restablecer contraseña
        </h1>
        <p className="text-sm text-[#6B7280] mb-6">
          Ingresa tu nueva contraseña.
        </p>

        {state === 'checking' && (
          <p className="text-sm text-gray-500 text-center">Verificando...</p>
        )}

        {state === 'done' && (
          <p className="text-green-600 text-sm text-center">
            ¡Contraseña actualizada! Redirigiendo...
          </p>
        )}

        {(state === 'idle' || state === 'loading') && (
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
              disabled={state === 'loading'}
              className="w-full bg-[#2E78C8] text-white rounded-lg py-2.5
                         text-sm font-medium hover:bg-[#1E3A5F]
                         disabled:opacity-50 transition-colors"
            >
              {state === 'loading' ? 'Guardando...' : 'Guardar nueva contraseña'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
