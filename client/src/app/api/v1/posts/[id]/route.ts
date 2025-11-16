import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/v1/posts/[id] - Get a specific post
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    const { data: post, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:profiles!author_id(*),
        category:categories(*),
        tags:post_tags(tag:tags(*)),
        company:companies(*),
        location:locations(*)
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    // Flatten tags
    const postWithTags = {
      ...post,
      tags: post.tags?.map((t: any) => t.tag) || []
    }

    // Increment view count
    await supabase.rpc('increment_post_views', { post_uuid: params.id })

    return NextResponse.json({ post: postWithTags })
  } catch (error) {
    console.error('Get post error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/v1/posts/[id] - Update own post
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, body: content, category_id, tags, yacht_type, yacht_length, company_id, location_id, status } = body

    // Update post
    const { data: post, error: postError } = await supabase
      .from('posts')
      // @ts-ignore - Supabase type inference issue
      .update({
        title,
        body: content,
        category_id,
        yacht_type,
        yacht_length,
        company_id,
        location_id,
        status,
      })
      .eq('id', params.id)
      .eq('author_id', user.id)
      .select()
      .single()

    if (postError) {
      return NextResponse.json({ error: postError.message }, { status: 400 })
    }

    // Update tags if provided
    if (tags !== undefined) {
      // Remove old tags
      await supabase.from('post_tags').delete().eq('post_id', params.id)

      // Add new tags
      if (tags.length > 0) {
        const tagInserts = tags.map((tagId: string) => ({
          post_id: params.id,
          tag_id: tagId,
        }))
        // @ts-ignore - Supabase type inference issue
        await supabase.from('post_tags').insert(tagInserts)
      }
    }

    return NextResponse.json({ post })
  } catch (error) {
    console.error('Update post error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/v1/posts/[id] - Delete own post
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', params.id)
      .eq('author_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete post error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
