import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/supabase/requireAdmin'

interface ProfileRow {
  id: string
  email: string
  full_name: string | null
  role: 'ADMIN' | 'EM' | 'ANCIANO'
  active: boolean
}

function mostRecentSunday(d: Date): Date {
  const copy = new Date(d)
  copy.setDate(copy.getDate() - copy.getDay())
  copy.setHours(0, 0, 0, 0)
  return copy
}

export async function GET() {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const adminClient = createAdminClient()

  const { data: profiles, error: profilesError } = await adminClient
    .from('profiles')
    .select('id, email, full_name, role, active')
    .order('full_name')
  if (profilesError) return NextResponse.json({ error: profilesError.message }, { status: 500 })

  const { data: authList, error: authError } = await adminClient.auth.admin.listUsers()
  if (authError) return NextResponse.json({ error: authError.message }, { status: 500 })

  const authById = new Map(authList.users.map(u => [u.id, u]))

  // Weekly activity: last 8 weeks, index 0 = 7 weeks ago, index 7 = current week.
  // Given the expected scale (one church's admin/EM team), this scans all
  // sunday_services in the window rather than aggregating in SQL.
  const currentWeekStart = mostRecentSunday(new Date())
  const earliestWeekStart = new Date(currentWeekStart)
  earliestWeekStart.setDate(earliestWeekStart.getDate() - 7 * 7)

  const { data: services, error: servicesError } = await adminClient
    .from('sunday_services')
    .select('date, created_by')
    .gte('date', earliestWeekStart.toISOString().split('T')[0])
  if (servicesError) return NextResponse.json({ error: servicesError.message }, { status: 500 })

  const weeklyActivityByUser = new Map<string, number[]>()
  for (const svc of services ?? []) {
    if (!svc.created_by) continue
    const svcDate = new Date(svc.date + 'T00:00:00')
    const diffWeeks = Math.floor((currentWeekStart.getTime() - svcDate.getTime()) / (7 * 24 * 60 * 60 * 1000))
    const index = 7 - diffWeeks
    if (index < 0 || index > 7) continue
    const arr = weeklyActivityByUser.get(svc.created_by) ?? Array(8).fill(0)
    arr[index] += 1
    weeklyActivityByUser.set(svc.created_by, arr)
  }

  const now = new Date()
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)

  const { count: sessionsThisMonth, error: thisMonthError } = await adminClient
    .from('sunday_services')
    .select('id', { count: 'exact', head: true })
    .gte('date', startOfThisMonth.toISOString().split('T')[0])
    .lt('date', startOfNextMonth.toISOString().split('T')[0])
  if (thisMonthError) return NextResponse.json({ error: thisMonthError.message }, { status: 500 })

  const { count: sessionsLastMonth, error: lastMonthError } = await adminClient
    .from('sunday_services')
    .select('id', { count: 'exact', head: true })
    .gte('date', startOfLastMonth.toISOString().split('T')[0])
    .lt('date', startOfThisMonth.toISOString().split('T')[0])
  if (lastMonthError) return NextResponse.json({ error: lastMonthError.message }, { status: 500 })

  const allUsers = ((profiles as ProfileRow[]) ?? []).map(p => {
    const authUser = authById.get(p.id)
    const lastSignInAt = authUser?.last_sign_in_at ?? null
    const invitedAt = authUser?.invited_at ?? null
    const isPending = Boolean(invitedAt) && !lastSignInAt
    return {
      id: p.id,
      email: p.email,
      full_name: p.full_name,
      role: p.role,
      active: p.active,
      last_sign_in_at: lastSignInAt,
      invited_at: invitedAt,
      isPending,
      weekly_activity: isPending ? null : (weeklyActivityByUser.get(p.id) ?? Array(8).fill(0)),
    }
  })

  const users = allUsers.filter(u => !u.isPending).map(u => ({
    id: u.id,
    email: u.email,
    full_name: u.full_name,
    role: u.role,
    active: u.active,
    last_sign_in_at: u.last_sign_in_at,
    weekly_activity: u.weekly_activity,
  }))
  const pendingList = allUsers.filter(u => u.isPending).map(u => ({
    id: u.id,
    email: u.email,
    role: u.role,
    invited_at: u.invited_at as string,
  }))

  const metrics = {
    total: allUsers.length,
    active: allUsers.filter(u => u.active && !u.isPending).length,
    pending: pendingList.length,
    sessionsThisMonth: sessionsThisMonth ?? 0,
    sessionsLastMonth: sessionsLastMonth ?? 0,
  }

  return NextResponse.json({ users, pending: pendingList, metrics })
}

export async function POST(request: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const { email, full_name, role } = body

  if (!email || !role) {
    return NextResponse.json({ error: 'Email y rol son requeridos' }, { status: 400 })
  }

  const adminClient = createAdminClient()
  const { data, error } = await adminClient.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/confirm`,
    data: { full_name, role },
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}
