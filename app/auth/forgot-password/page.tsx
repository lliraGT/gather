'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { GatherLogo } from '@/components/ui/GatherLogo'

type State = 'idle' | 'loading' | 'sent' | 'error'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<State>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setState('loading')
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: process.env.NEXT_PUBLIC_APP_URL + '/auth/callback?next=/auth/reset-password',
    })
    if (error) {
      setState('error')
    } else {
      setState('sent')
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-md p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="mb-3">
            <GatherLogo size={52} />
          </div>
          <h1 className="text-[22px] font-medium text-[#1E3A5F] tracking-[0.12em]">
            GATHER
          </h1>
          <p className="text-[13px] text-gray-400 mt-1">
            Centro Bíblico El Camino
          </p>
        </div>

        {state === 'sent' ? (
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              Si ese correo está registrado, recibirás un link para restablecer
              tu contraseña en los próximos minutos.
            </p>
            <a
              href="/login"
              className="text-xs text-[#2E78C8] hover:underline block"
            >
              Volver a iniciar sesión
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4
                         py-2.5 text-sm focus:outline-none focus:ring-2
                         focus:ring-[#2E78C8]"
              required
            />
            {state === 'error' && (
              <p className="text-red-500 text-xs">Ocurrió un error. Intenta de nuevo.</p>
            )}
            <button
              type="submit"
              disabled={state === 'loading'}
              className="w-full bg-[#2E78C8] text-white rounded-lg
                         py-2.5 text-sm font-medium hover:bg-[#1E3A5F]
                         disabled:opacity-50 transition-colors"
            >
              {state === 'loading' ? 'Enviando...' : 'Enviar link de recuperación'}
            </button>
            <div className="text-center">
              <a
                href="/login"
                className="text-xs text-[#2E78C8] hover:underline"
              >
                Volver a iniciar sesión
              </a>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
