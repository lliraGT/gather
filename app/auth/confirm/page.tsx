'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthConfirmPage() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    const handleAuth = async () => {
      console.log('CONFIRM - href:', window.location.href)
      console.log('CONFIRM - hash:', window.location.hash)
      console.log('CONFIRM - search:', window.location.search)
      // Leer tokens del hash (flujo legacy Supabase invitaciones)
      const hash = window.location.hash
      if (hash) {
        const params = new URLSearchParams(hash.replace('#', ''))
        const accessToken = params.get('access_token')
        const refreshToken = params.get('refresh_token')
        const type = params.get('type')

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })
          if (!error) {
            router.refresh()
            if (type === 'invite') {
              router.replace('/auth/set-password')
            } else {
              router.replace('/dashboard')
            }
          } else {
            router.replace('/login?error=auth_error')
          }
          return
        }
      }

      // Fallback: escuchar onAuthStateChange (por si el hash ya fue procesado)
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (event === 'SIGNED_IN' && session) {
            const hash = window.location.hash
            const params = new URLSearchParams(hash.replace('#', ''))
            const type = params.get('type')
            router.refresh()
            if (type === 'invite') {
              router.replace('/auth/set-password')
            } else {
              router.replace('/dashboard')
            }
          }
        }
      )
      return () => subscription.unsubscribe()
    }

    handleAuth()
  }, [router])

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
      <p className="text-gray-500 text-sm">Verificando acceso...</p>
    </div>
  )
}
