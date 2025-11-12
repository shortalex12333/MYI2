import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PostCard } from '@/components/posts/PostCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default async function PostsPage() {
  const supabase = await createClient()

  // Fetch posts
  const { data: postsData } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles!author_id(*),
      category:categories(*),
      tags:post_tags(tag:tags(*))
    `)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(20)

  // Flatten tags
  const posts = postsData?.map(post => ({
    ...post,
    tags: post.tags?.map((t: any) => t.tag) || [],
    comments_count: 0,
    reactions_count: { like: 0, dislike: 0, share: 0, bookmark: 0 }
  })) || []

  // Fetch categories for filter sidebar
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="sticky top-20 space-y-6">
            <div>
              <h3 className="font-semibold mb-3">Categories</h3>
              <div className="space-y-2">
                <Link
                  href="/posts"
                  className="block px-3 py-2 rounded-md hover:bg-accent transition-colors"
                >
                  All Posts
                </Link>
                {categories?.map((category) => (
                  <Link
                    key={category.id}
                    href={`/category/${category.slug}`}
                    className="block px-3 py-2 rounded-md hover:bg-accent transition-colors"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Quick Links</h3>
              <div className="space-y-2">
                <Link
                  href="/companies"
                  className="block px-3 py-2 rounded-md hover:bg-accent transition-colors"
                >
                  Companies
                </Link>
                <Link
                  href="/faq"
                  className="block px-3 py-2 rounded-md hover:bg-accent transition-colors"
                >
                  FAQ
                </Link>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">All Posts</h1>
            <Button asChild>
              <Link href="/posts/new">Create Post</Link>
            </Button>
          </div>

          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  No posts yet. Be the first to share!
                </p>
                <Button asChild>
                  <Link href="/posts/new">Create the first post</Link>
                </Button>
              </div>
            ) : (
              posts.map((post) => <PostCard key={post.id} post={post} />)
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
