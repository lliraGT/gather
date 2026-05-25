import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { EmailOtpType } from '@supabase/auth-js'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const token_hash = requestUrl.searchParams.get('token_hash')
  const token = requestUrl.searchParams.get('token')
  const type = requestUrl.searchParams.get('type') as string | null
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'

  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  if (code) {
    // Flujo PKCE (magic link login / reset password)
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      return NextResponse.redirect(new URL('/login?error=auth_error', requestUrl.origin))
    }
  } else if (token_hash && type) {
    // Flujo OTP / invite (token en query param)
    const { error } = await supabase.auth.verifyOtp({ token_hash, type: type as EmailOtpType })
    if (error) {
      return NextResponse.redirect(new URL('/login?error=auth_error', requestUrl.origin))
    }
  } else if (token && type) {
    // Flujo recovery con ?token=pkce_... (Supabase PKCE moderno)
    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: type as EmailOtpType,
    })
    if (error) {
      return NextResponse.redirect(new URL('/login?error=auth_error', requestUrl.origin))
    }
  }

  if (type === 'invite') {
    return NextResponse.redirect(new URL('/auth/set-password', requestUrl.origin))
  }
  if (type === 'recovery') {
    return NextResponse.redirect(new URL('/auth/reset-password', requestUrl.origin))
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin))
}
