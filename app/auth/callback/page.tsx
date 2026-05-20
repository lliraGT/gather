'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    const handleHashToken = async () => {
      const hash = window.location.hash
      if (!hash) return

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
      }
    }

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

    handleHashToken()

    return () => subscription.unsubscribe()
  }, [router])

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
      <p className="text-gray-500 text-sm">Verificando acceso...</p>
    </div>
  )
}
