import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createAdminClient()
  const serviceId = params.id

  const { error: recError } = await supabase
    .from('attendance_records')
    .delete()
    .eq('service_id', serviceId)

  if (recError) {
    return NextResponse.json({ error: recError.message }, { status: 500 })
  }

  const { error: svcError } = await supabase
    .from('sunday_services')
    .delete()
    .eq('id', serviceId)

  if (svcError) {
    return NextResponse.json({ error: svcError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
