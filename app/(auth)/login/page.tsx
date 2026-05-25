'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { GatherLogo } from '@/components/ui/GatherLogo'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email, password
    })
    if (error) {
      setError('Correo o contraseña incorrectos')
      setLoading(false)
    } else {
      const params = new URLSearchParams(window.location.search)
      const next = params.get('next') ?? '/dashboard'
      router.refresh()    // CRÍTICO: invalida cache antes de navegar
      router.push(next)
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
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4
                       py-2.5 text-sm focus:outline-none focus:ring-2
                       focus:ring-[#2E78C8]"
            required
          />
          <div className="flex justify-end">
            <a href="/auth/forgot-password" className="text-xs text-[#2E78C8] hover:underline">
              ¿Olvidaste tu contraseña?
            </a>
          </div>
          {error && (
            <p className="text-red-500 text-xs">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2E78C8] text-white rounded-lg
                       py-2.5 text-sm font-medium hover:bg-[#1E3A5F]
                       disabled:opacity-50 transition-colors"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}
