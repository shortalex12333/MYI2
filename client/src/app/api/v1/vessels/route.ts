import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's vessels
    const { data: vessels, error: vesselsError } = await supabase
      .from('vessels')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })

    if (vesselsError) {
      return NextResponse.json(
        { error: vesselsError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ vessels })
  } catch (error) {
    console.error('Get vessels error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, type, length_ft, year_built, home_port } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Vessel name is required' },
        { status: 400 }
      )
    }

    // Create vessel
    const { data: vessel, error: createError } = await supabase
      .from('vessels')
      .insert({
        owner_id: user.id,
        name,
        type,
        length_ft: length_ft ? parseInt(length_ft) : null,
        year_built: year_built ? parseInt(year_built) : null,
        home_port,
      })
      .select()
      .single()

    if (createError) {
      return NextResponse.json(
        { error: createError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ vessel })
  } catch (error) {
    console.error('Create vessel error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
