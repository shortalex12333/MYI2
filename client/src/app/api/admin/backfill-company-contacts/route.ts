import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCompanyContact } from '@/lib/companyContacts'

function norm(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

export async function POST(request: NextRequest) {
  // Security: require ADMIN_API_KEY in production; allow in dev if unset
  const adminKey = process.env.ADMIN_API_KEY
  const headerKey = request.headers.get('x-admin-key') || ''
  if (process.env.NODE_ENV === 'production' && (!adminKey || headerKey !== adminKey)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE
  if (!serviceKey) {
    return NextResponse.json({ error: 'Missing service role' }, { status: 500 })
  }

  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey)
  // Fetch companies
  const { data: companies, error } = await admin
    .from('companies')
    .select('id,name,website,contact_url,phone,email,address')
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  const updates: any[] = []
  for (const c of companies || []) {
    const extra = getCompanyContact(c.name)
    if (!extra) continue
    const u: any = { id: c.id }
    if (!c.website && extra.website) u.website = extra.website
    if (!c.contact_url && extra.contactUrl) u.contact_url = extra.contactUrl
    if (!c.phone && extra.phone) u.phone = extra.phone
    if (!c.email && extra.email) u.email = extra.email
    if (!c.address && extra.address) u.address = extra.address
    if (Object.keys(u).length > 1) updates.push(u)
  }

  let updated = 0
  if (updates.length) {
    const { error: upErr } = await admin.from('companies').upsert(updates)
    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 400 })
    updated = updates.length
  }

  return NextResponse.json({ ok: true, updated, total: (companies || []).length })
}

