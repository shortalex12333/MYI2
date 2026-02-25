import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getCompanyContact } from '@/lib/companyContacts'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    // @ts-ignore
    const { data: c, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', params.id)
      .single()
    if (error || !c) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const extra = getCompanyContact(c.name)
    const company = {
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
    return NextResponse.json({ company })
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

