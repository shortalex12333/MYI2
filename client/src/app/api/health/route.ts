import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

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

    // Test database connectivity
    const { error } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true })

    if (error) {
      return NextResponse.json(
        {
          status: 'degraded',
          version: '0.1.0',
          database: 'disconnected',
          error: error.message,
        },
        { status: 503 }
      )
    }

    return NextResponse.json({
      status: 'healthy',
      version: '0.1.0',
      database: 'connected',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        version: '0.1.0',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
