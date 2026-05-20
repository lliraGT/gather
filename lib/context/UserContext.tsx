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

    async function loadProfile(userId: string) {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('id, email, full_name, role, active')
          .eq('id', userId)
          .single()
        setProfile((data as Profile) ?? null)
      } catch {
        setProfile(null)
      } finally {
        setLoading(false)
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          await loadProfile(session.user.id)
        } else {
          setProfile(null)
          setLoading(false)
          const path = window.location.pathname
          if (!path.startsWith('/login') && !path.startsWith('/auth')) {
            router.push('/login')
          }
        }
      }
    )

    return () => subscription.unsubscribe()
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
