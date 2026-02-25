import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { getCompanyContact } from '@/lib/companyContacts'

export async function GET() {
  try {
    const cookieStore = await cookies()
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

    // @ts-ignore type inference
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const items = (data || []).map((c: any) => {
      const extra = getCompanyContact(c.name)
      return {
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description || null,
        verified: !!c.verified,
        website: c.website || extra?.website || null,
        contact_url: extra?.contactUrl || null,
        phone: extra?.phone || null,
        email: extra?.email || null,
        address: extra?.address || null,
      }
    })

    // Auto-backfill missing fields into DB (idempotent) if service role is available
    try {
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE
      if (serviceKey && data && data.length) {
        const admin = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey)
        const updates: any[] = []
        for (const c of data) {
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
        if (updates.length) {
          await admin.from('companies').upsert(updates)
        }
      }
    } catch (_) {
      // best-effort; ignore errors
    }

    return NextResponse.json({ companies: items })
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
