import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/supabase/requireAdmin'

interface InviteMetadata {
  full_name?: string
  role?: string
}

interface ProfileFallbackRow {
  full_name: string | null
  role: 'ADMIN' | 'EM' | 'ANCIANO'
}

export async function POST(request: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const { email } = body
  if (!email) return NextResponse.json({ error: 'Email es requerido' }, { status: 400 })

  const adminClient = createAdminClient()

  // Buscar el usuario existente en auth.users por email (la invitación original ya lo creó).
  const { data: authList, error: listError } = await adminClient.auth.admin.listUsers()
  if (listError) return NextResponse.json({ error: listError.message }, { status: 500 })

  const targetEmail = email.toLowerCase()
  const user = authList.users.find(u => u.email?.toLowerCase() === targetEmail)
  if (!user) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
  }

  // Si ya activó su cuenta (tiene last_sign_in_at), no se debe reenviar la invitación.
  const isPending = Boolean(user.invited_at) && !user.last_sign_in_at
  if (!isPending) {
    return NextResponse.json({ error: 'El usuario ya activó su cuenta' }, { status: 400 })
  }

  // user_metadata es la fuente de verdad de la invitación original; si falta algo
  // (no debería pasar normalmente), se recurre a la fila de profiles como respaldo.
  const metadata = user.user_metadata as InviteMetadata
  let fullName = metadata.full_name
  let role = metadata.role

  if (!fullName || !role) {
    const { data: profile } = await adminClient
      .from('profiles')
      .select('full_name, role')
      .eq('id', user.id)
      .single<ProfileFallbackRow>()
    fullName = fullName ?? profile?.full_name ?? undefined
    role = role ?? profile?.role ?? undefined
  }

  // Eliminar el estado pendiente existente antes de reinvitar. Orden obligatorio:
  // profiles primero (tiene FK hacia auth.users.id), luego el usuario de auth.
  const { error: deleteProfileError } = await adminClient
    .from('profiles')
    .delete()
    .eq('id', user.id)
  if (deleteProfileError) {
    return NextResponse.json({ error: deleteProfileError.message }, { status: 500 })
  }

  const { error: deleteUserError } = await adminClient.auth.admin.deleteUser(user.id)
  if (deleteUserError) {
    return NextResponse.json({ error: deleteUserError.message }, { status: 500 })
  }

  const { data, error } = await adminClient.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/confirm`,
    data: { full_name: fullName, role },
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}
