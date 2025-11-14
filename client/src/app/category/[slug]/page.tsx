import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { PostCard } from '@/components/posts/PostCard'

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const supabase = await createClient()

  // Fetch category by slug
  // @ts-ignore - Supabase type inference issue
  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (categoryError || !category) {
    notFound()
  }

  // Fetch posts in this category
  // @ts-ignore - Supabase type inference issue
  const { data: postsData } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles!author_id(*),
      category:categories(*),
      tags:post_tags(tag:tags(*))
    `)
    .eq('category_id', category.id)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(50)

  // Flatten tags
  const posts = postsData?.map(post => ({
    ...post,
    tags: post.tags?.map((t: any) => t.tag) || [],
    comments_count: 0,
    reactions_count: { like: 0, helpful: 0, insightful: 0 }
  })) || []

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link href="/posts" className="hover:text-primary">Posts</Link>
          <span>/</span>
          <span className="text-foreground">{category.name}</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{category.name}</h1>
          {category.description && (
            <p className="text-lg text-muted-foreground">{category.description}</p>
          )}
        </div>

        {/* Posts */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-muted-foreground">
            {posts.length} {posts.length === 1 ? 'post' : 'posts'}
          </span>
          <Button asChild>
            <Link href="/posts/new">Ask Question</Link>
          </Button>
        </div>

        {posts.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">
              No posts in this category yet.
            </p>
            <Button asChild>
              <Link href="/posts/new">Be the first to post</Link>
            </Button>
          </Card>
        ) : (
          <div className="border rounded-lg bg-card">
            {posts.map((post) => <PostCard key={post.id} post={post} />)}
          </div>
        )}
      </div>
    </div>
  )
}
