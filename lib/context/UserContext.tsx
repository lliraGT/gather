'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Profile {
  id: string
  email: string
  full_name: string | null
  role: 'ADMIN' | 'EM' | 'ANCIANO'
  active: boolean
}

interface UserContextValue {
  profile: Profile | null
  loading: boolean
}

const UserContext = createContext<UserContextValue>({
  profile: null,
  loading: true,
})

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    let mounted = true

    async function loadProfile(userId: string) {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('id, email, full_name, role, active')
          .eq('id', userId)
          .single()
        if (mounted) setProfile((data as Profile) ?? null)
      } catch {
        if (mounted) setProfile(null)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    // Carga inicial explícita — INITIAL_SESSION puede perderse si el
    // listener se registra tarde en hard refresh
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!mounted) return
      if (user) {
        loadProfile(user.id)
      } else {
        setProfile(null)
        setLoading(false)
        const path = window.location.pathname
        if (!path.startsWith('/login') && !path.startsWith('/auth')) {
          router.push('/login')
        }
      }
    })

    // Listener solo para cambios posteriores (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'INITIAL_SESSION') return

        if (session?.user) {
          await loadProfile(session.user.id)
        } else {
          if (mounted) {
            setProfile(null)
            setLoading(false)
          }
          const path = window.location.pathname
          if (!path.startsWith('/login') && !path.startsWith('/auth')) {
            router.push('/login')
          }
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  return (
    <UserContext.Provider value={{ profile, loading }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}
