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
      console.log('[UserContext] loadProfile() iniciado para', userId)
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, email, full_name, role, active')
          .eq('id', userId)
          .single()
        console.log('[UserContext] profiles query resultado', {
          data: data?.id ?? null,
          error: error?.message ?? null,
        })
        if (mounted) setProfile((data as Profile) ?? null)
      } catch (e) {
        console.log('[UserContext] loadProfile catch', e)
        if (mounted) setProfile(null)
      } finally {
        console.log('[UserContext] setLoading(false) — mounted:', mounted)
        if (mounted) setLoading(false)
      }
    }

    // onAuthStateChange maneja tanto INITIAL_SESSION (hard refresh)
    // como cambios posteriores (login/logout). No ignorar INITIAL_SESSION.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[UserContext] onAuthStateChange evento:', event,
                    'user:', session?.user?.id ?? null)

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
