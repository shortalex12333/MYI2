import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PostCard } from '@/components/posts/PostCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'

export default async function CategoryPage({
  params,
}: {
  params: { slug: string }
}) {
  const supabase = await createClient()

  // Fetch category by slug
  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The category you're looking for doesn't exist.
        </p>
        <Button asChild>
          <Link href="/posts">Browse All Posts</Link>
        </Button>
      </div>
    )
  }

  // Fetch posts in this category
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
      <div className="flex gap-6">
        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Header */}
          <div className="mb-6">
            <Button variant="ghost" size="sm" asChild className="mb-4">
              <Link href="/posts">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to All Posts
              </Link>
            </Button>
            <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
            {category.description && (
              <p className="text-muted-foreground">{category.description}</p>
            )}
          </div>

          {/* Filter Bar */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b">
            <span className="text-sm text-muted-foreground">
              {posts.length} {posts.length === 1 ? 'question' : 'questions'}
            </span>
            <Button asChild>
              <Link href="/posts/new">Ask Question</Link>
            </Button>
          </div>

          {/* Posts List */}
          <div className="border rounded-lg bg-card">
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  No questions in this category yet. Be the first to ask!
                </p>
                <Button asChild>
                  <Link href="/posts/new">Ask the first question</Link>
                </Button>
              </div>
            ) : (
              posts.map((post) => <PostCard key={post.id} post={post} />)
            )}
          </div>
        </main>

        {/* Sidebar */}
        <aside className="hidden lg:block w-80 shrink-0">
          <div className="sticky top-20 space-y-4">
            {/* Category Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">About This Category</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Questions</span>
                  <span className="font-semibold">{posts.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-semibold">{category.name}</span>
                </div>
              </CardContent>
            </Card>

            {/* Related Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Browse Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <Link
                    href="/posts"
                    className="block px-2 py-1.5 rounded-md hover:bg-accent transition-colors text-sm"
                  >
                    All Categories
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </aside>
      </div>
    </div>
  )
}
