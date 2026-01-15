import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PostCard } from '@/components/posts/PostCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { notFound } from 'next/navigation'

interface CategoryPageProps {
  params: Promise<{ slug: string }>
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch category by slug
  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (categoryError || !category) {
    notFound()
  }

  // Fetch posts for this category
  const { data: postsData } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles!author_id(*),
      category:categories(*),
      tags:post_tags(tag:tags(*))
    `)
    .eq('status', 'published')
    .eq('category_id', category.id)
    .order('created_at', { ascending: false })
    .limit(50)

  // Flatten tags
  const posts = postsData?.map(post => ({
    ...post,
    tags: post.tags?.map((t: any) => t.tag) || [],
    comments_count: 0,
    reactions_count: { like: 0, dislike: 0, share: 0, bookmark: 0 }
  })) || []

  // Fetch all categories for sidebar
  const { data: allCategories } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true })

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex gap-6">
        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Link href="/categories" className="text-sm text-muted-foreground hover:text-foreground">
                Categories
              </Link>
              <span className="text-muted-foreground">/</span>
              <span className="text-sm font-medium">{category.name}</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
            {category.description && (
              <p className="text-muted-foreground">{category.description}</p>
            )}
          </div>

          {/* Stats Bar */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b">
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
                  <Link href="/posts/new">Ask a Question</Link>
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
                  <span className="text-muted-foreground">Questions</span>
                  <span className="font-semibold">{posts.length}</span>
                </div>
              </CardContent>
            </Card>

            {/* All Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">All Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {allCategories?.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/category/${cat.slug}`}
                      className={`block px-2 py-1.5 rounded-md transition-colors text-sm ${
                        cat.id === category.id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-accent'
                      }`}
                    >
                      {cat.name}
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
