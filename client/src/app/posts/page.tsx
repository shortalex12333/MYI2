import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PostPreviewCard } from '@/components/posts/PostPreviewCard'
import { PostsFilterBar } from '@/components/posts/PostsFilterBar'
import { PostsInfoBar } from '@/components/posts/PostsInfoBar'
import { PostsCategorySidebar } from '@/components/posts/PostsCategorySidebar'
import { GradientText } from '@/components/ui/gradient-text'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default async function PostsPage({
  searchParams,
}: {
  searchParams: { category?: string; tag?: string; sort?: string; search?: string }
}) {
  const supabase = await createClient()
  const currentSort = searchParams.sort || 'newest'

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

  // Apply sorting
  if (currentSort === 'hot') {
    query = query.order('score', { ascending: false })
  } else if (currentSort === 'active') {
    query = query.order('updated_at', { ascending: false })
  } else if (currentSort === 'unanswered') {
    // TODO: filter by posts with 0 comments
    query = query.order('created_at', { ascending: false })
  } else {
    // newest
    query = query.order('created_at', { ascending: false })
  }

  // Filter by category
  if (searchParams.category) {
    query = query.eq('category_id', searchParams.category)
  }

  // Filter by search
  if (searchParams.search) {
    query = query.or(`title.ilike.%${searchParams.search}%,body.ilike.%${searchParams.search}%`)
  }

  query = query.limit(20)

  const { data: postsData } = await query

  // Flatten tags
  const posts = postsData?.map(post => ({
    ...post,
    tags: post.tags?.map((t: any) => t.tag) || [],
    comments_count: 0, // TODO: get real count
    reactions_count: { like: 0, dislike: 0, share: 0, bookmark: 0 }
  })) || []

  // Fetch categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true })

  return (
    <div className="min-h-screen bg-maritime-navy text-maritime-cream">
      {/* SECTION: Hero Header */}
      <section className="border-b border-maritime-gold/10 bg-maritime-navy-light/30">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              All <GradientText>Questions</GradientText>
            </h1>
            <p className="text-lg md:text-xl text-maritime-cream/60 mb-6">
              Expert answers from captains, engineers, surveyors, and insurers.
            </p>
            <Button
              size="lg"
              asChild
              className="bg-maritime-gold hover:bg-maritime-gold-light text-maritime-navy font-semibold shadow-lg shadow-maritime-gold/20 transition-all duration-300 hover:scale-105"
            >
              <Link href="/posts/new">
                <Plus className="mr-2 h-5 w-5" />
                Ask Question
              </Link>
            </Button>
          </div>
        </div>

        {/* Decorative Gold Line */}
        <div className="h-px bg-gradient-to-r from-transparent via-maritime-gold/50 to-transparent" />
      </section>

      {/* SECTION: Premium Filter Bar */}
      <section className="border-b border-maritime-gold/10 bg-maritime-navy">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <PostsFilterBar />
            <div className="text-sm text-maritime-cream/50">
              {posts.length} question{posts.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: Maritime InfoBar */}
      <PostsInfoBar totalQuestions={posts.length} />

      {/* SECTION: Main Content Grid */}
      <section className="py-12 bg-maritime-navy relative">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(${
                'to right, rgba(212, 175, 55, 0.1) 1px, transparent 1px'
              }), linear-gradient(to bottom, rgba(212, 175, 55, 0.1) 1px, transparent 1px)`,
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex gap-8">
            {/* LEFT: Categories Sidebar (25%) */}
            <PostsCategorySidebar categories={categories || []} />

            {/* RIGHT: Posts Feed (75%) */}
            <main className="flex-1 min-w-0">
              {posts.length === 0 ? (
                <div className="text-center py-20">
                  <div className="inline-block p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                    <p className="text-xl text-maritime-cream/70 mb-6">
                      No questions yet. Be the first to ask!
                    </p>
                    <Button
                      size="lg"
                      asChild
                      className="bg-maritime-gold hover:bg-maritime-gold-light text-maritime-navy font-semibold"
                    >
                      <Link href="/posts/new">
                        <Plus className="mr-2 h-5 w-5" />
                        Ask the First Question
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map((post, idx) => (
                    <PostPreviewCard key={post.id} post={post} index={idx} />
                  ))}
                </div>
              )}

              {/* Load More (Future Enhancement) */}
              {posts.length >= 20 && (
                <div className="mt-8 text-center">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-maritime-gold/30 text-maritime-gold hover:bg-maritime-gold/10"
                  >
                    Load More Questions
                  </Button>
                </div>
              )}
            </main>
          </div>
        </div>
      </section>
    </div>
  )
}
