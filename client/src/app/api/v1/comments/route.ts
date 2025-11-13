import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/v1/comments?post_id={id} - List comments for a post
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('post_id')

    if (!postId) {
      return NextResponse.json(
        { error: 'post_id is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: comments, error } = await supabase
      .from('comments')
      .select(`
        *,
        author:profiles!author_id(*)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Build threaded structure
    const commentMap = new Map()
    const rootComments: any[] = []

    comments?.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] })
    })

    comments?.forEach(comment => {
      if (comment.parent_id) {
        const parent = commentMap.get(comment.parent_id)
        if (parent) {
          parent.replies.push(commentMap.get(comment.id))
        }
      } else {
        rootComments.push(commentMap.get(comment.id))
      }
    })

    return NextResponse.json({ comments: rootComments })
  } catch (error) {
    console.error('Get comments error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/v1/comments - Create a comment
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { post_id, parent_id, body } = await request.json()

    if (!post_id || !body) {
      return NextResponse.json(
        { error: 'post_id and body are required' },
        { status: 400 }
      )
    }

    // @ts-ignore - Supabase type inference issue
    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        post_id,
        parent_id,
        author_id: user.id,
        body,
      })
      .select(`
        *,
        author:profiles!author_id(*)
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ comment }, { status: 201 })
  } catch (error) {
    console.error('Create comment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
