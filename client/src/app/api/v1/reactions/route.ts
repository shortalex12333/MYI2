import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/v1/reactions - Add or remove a reaction
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { post_id, comment_id, type } = await request.json()

    if (!type || (!post_id && !comment_id)) {
      return NextResponse.json(
        { error: 'type and either post_id or comment_id are required' },
        { status: 400 }
      )
    }

    // Check if reaction already exists
    let query = supabase
      .from('reactions')
      .select()
      .eq('user_id', user.id)
      .eq('type', type)

    if (post_id) {
      query = query.eq('post_id', post_id)
    } else {
      query = query.eq('comment_id', comment_id)
    }

    const { data: existing } = await query.single()

    if (existing) {
      // Remove existing reaction (toggle off)
      const { error } = await supabase
        .from('reactions')
        .delete()
        .eq('id', existing.id)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      return NextResponse.json({ action: 'removed' })
    } else {
      // Add new reaction
      // @ts-ignore - Supabase type inference issue
      const { data: reaction, error } = await supabase
        .from('reactions')
        .insert({
          user_id: user.id,
          post_id,
          comment_id,
          type,
        })
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      return NextResponse.json({ action: 'added', reaction }, { status: 201 })
    }
  } catch (error) {
    console.error('Reaction error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
