import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not allowed' }, { status: 403 })
  }
  const body = await request.json().catch(() => ({}))
  const { email, password, username } = body || {}
  if (!email || !password || !username) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE
  if (!serviceKey) {
    return NextResponse.json({ error: 'Missing service role' }, { status: 500 })
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey
  )
  // Create user and auto-confirm
  const { data: userData, error: adminError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { username },
  })
  if (adminError || !userData.user) {
    return NextResponse.json({ error: adminError?.message || 'createUser failed' }, { status: 400 })
  }
  // Upsert profile row
  await admin.from('profiles').upsert(
    { id: userData.user.id, email, username, role: 'user' },
    { onConflict: 'id' }
  )
  return NextResponse.json({ ok: true, user: { id: userData.user.id, email, username } })
}

