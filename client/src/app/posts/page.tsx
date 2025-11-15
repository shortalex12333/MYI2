import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PostCard } from '@/components/posts/PostCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Users, MessageCircle, Clock } from 'lucide-react'

export default async function PostsPage({
  searchParams,
}: {
  searchParams: { category?: string; tag?: string; sort?: string }
}) {
  const supabase = await createClient()

  // Build query based on search params
  let query = supabase
    .from('posts')
    .select(`
      *,
      author:profiles!author_id(*),
      category:categories(*),
      tags:post_tags(tag:tags(*))
    `)
    .eq('status', 'published')

  // Filter by category if provided
  if (searchParams.category) {
    query = query.eq('category_id', searchParams.category)
  }

  // Sort based on parameter
  const sortBy = searchParams.sort || 'newest'
  if (sortBy === 'newest') {
    query = query.order('created_at', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  query = query.limit(20)

  const { data: postsData } = await query

  // Flatten tags and filter by tag if needed
  let posts = postsData?.map(post => ({
    ...post,
    tags: post.tags?.map((t: any) => t.tag) || [],
    comments_count: 0,
    reactions_count: { like: 0, dislike: 0, share: 0, bookmark: 0 }
  })) || []

  // Client-side tag filtering
  if (searchParams.tag) {
    posts = posts.filter((post: any) =>
      post.tags?.some((tag: any) => tag.id === searchParams.tag)
    )
  }

  // Fetch categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true })

  // Fetch top tags
  const { data: tags } = await supabase
    .from('tags')
    .select('*')
    .limit(10)

  const currentSort = searchParams.sort || 'newest'

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex gap-6">
        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">All Questions</h1>
            <Button asChild>
              <Link href="/posts/new">Ask Question</Link>
            </Button>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b">
            <span className="text-sm text-muted-foreground">
              {posts.length} questions
            </span>
            <div className="flex gap-2">
              <Button
                variant={currentSort === 'newest' ? 'default' : 'ghost'}
                size="sm"
                asChild
              >
                <Link href="/posts?sort=newest">
                  <Clock className="h-4 w-4 mr-1" />
                  Newest
                </Link>
              </Button>
              <Button
                variant={currentSort === 'hot' ? 'default' : 'ghost'}
                size="sm"
                asChild
              >
                <Link href="/posts?sort=hot">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Hot
                </Link>
              </Button>
              <Button
                variant={currentSort === 'active' ? 'default' : 'ghost'}
                size="sm"
                asChild
              >
                <Link href="/posts?sort=active">
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Active
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/posts?sort=unanswered">Unanswered</Link>
              </Button>
            </div>
          </div>

          {/* Posts List */}
          <div className="border rounded-lg bg-card">
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  No questions yet. Be the first to ask!
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
            {/* Community Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Community Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Questions</span>
                  <span className="font-semibold">{posts.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active Users</span>
                  <span className="font-semibold">234</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Answers</span>
                  <span className="font-semibold">1.2k</span>
                </div>
              </CardContent>
            </Card>

            {/* Popular Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Popular Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {tags?.map((tag) => (
                    <Link key={tag.id} href={`/posts?tag=${tag.id}`}>
                      <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                        {tag.name}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {categories?.map((category) => (
                    <Link
                      key={category.id}
                      href={`/category/${category.slug}`}
                      className="block px-2 py-1.5 rounded-md hover:bg-accent transition-colors text-sm"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Helpful Resources */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Helpful Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Link href="/faq" className="block text-primary hover:underline">
                  FAQ
                </Link>
                <Link href="/companies" className="block text-primary hover:underline">
                  Verified Companies
                </Link>
                <Link href="/contact" className="block text-primary hover:underline">
                  Contact Support
                </Link>
              </CardContent>
            </Card>
          </div>
        </aside>
      </div>
    </div>
  )
}
