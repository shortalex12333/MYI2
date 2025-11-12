import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/v1/posts - List posts with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const tag = searchParams.get('tag')
    const location = searchParams.get('location')
    const company = searchParams.get('company')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    const supabase = await createClient()

    let query = supabase
      .from('posts')
      .select(`
        *,
        author:profiles!author_id(*),
        category:categories(*),
        tags:post_tags(tag:tags(*))
      `, { count: 'exact' })
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (category) {
      query = query.eq('category_id', category)
    }

    if (location) {
      query = query.eq('location_id', location)
    }

    if (company) {
      query = query.eq('company_id', company)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,body.ilike.%${search}%`)
    }

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Flatten tags
    const posts = data?.map(post => ({
      ...post,
      tags: post.tags?.map((t: any) => t.tag) || []
    }))

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Get posts error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/v1/posts - Create a new post
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, body: content, category_id, tags, yacht_type, yacht_length, company_id, location_id } = body

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    // Create post
    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({
        author_id: user.id,
        title,
        body: content,
        category_id,
        yacht_type,
        yacht_length,
        company_id,
        location_id,
        status: 'published',
      })
      .select()
      .single()

    if (postError) {
      return NextResponse.json({ error: postError.message }, { status: 400 })
    }

    // Add tags if provided
    if (tags && tags.length > 0) {
      const tagInserts = tags.map((tagId: string) => ({
        post_id: post.id,
        tag_id: tagId,
      }))

      await supabase.from('post_tags').insert(tagInserts)
    }

    return NextResponse.json({ post }, { status: 201 })
  } catch (error) {
    console.error('Create post error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
