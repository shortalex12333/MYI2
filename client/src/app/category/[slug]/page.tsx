import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { CategoryDetailHero } from '@/components/categories/CategoryDetailHero'
import { CategoryDetailStats } from '@/components/categories/CategoryDetailStats'
import { CategoryDetailPostsGrid } from '@/components/categories/CategoryDetailPostsGrid'
import { CategoryDetailSidebar } from '@/components/categories/CategoryDetailSidebar'
import { CategoryDetailCTA } from '@/components/categories/CategoryDetailCTA'

interface CategoryDetailPageProps {
  params: {
    slug: string
  }
}

export default async function CategoryDetailPage({ params }: CategoryDetailPageProps) {
  const supabase = await createClient()

  // Fetch category by slug
  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (categoryError || !category) {
    notFound()
  }

  // Fetch posts in this category with full relations
  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles!posts_author_id_fkey(id, username, avatar_url, role, reputation),
      category:categories!posts_category_id_fkey(id, name, slug),
      tags(id, name),
      comments(count)
    `)
    .eq('category_id', category.id)
    .order('created_at', { ascending: false })

  if (postsError) {
    console.error('Error fetching posts:', postsError)
  }

  const postsWithCounts = posts?.map(post => ({
    ...post,
    comments_count: post.comments?.[0]?.count || 0,
  })) || []

  // Fetch popular tags used in this category
  const { data: categoryTags } = await supabase
    .from('post_tags')
    .select(`
      tag_id,
      tags(id, name)
    `)
    .in('post_id', postsWithCounts.map(p => p.id))
    .limit(10)

  // Get unique tags with counts
  const tagCounts = new Map<string, { id: string; name: string; count: number }>()
  categoryTags?.forEach(pt => {
    if (pt.tags) {
      const tag = Array.isArray(pt.tags) ? pt.tags[0] : pt.tags
      const existing = tagCounts.get(tag.id)
      if (existing) {
        existing.count++
      } else {
        tagCounts.set(tag.id, { id: tag.id, name: tag.name, count: 1 })
      }
    }
  })

  const relatedTags = Array.from(tagCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)

  // Fetch related categories (exclude current one, limit to 5)
  const { data: relatedCategories } = await supabase
    .from('categories')
    .select('id, name, slug, icon')
    .neq('id', category.id)
    .order('display_order', { ascending: true })
    .limit(5)

  // Calculate stats
  const totalQuestions = postsWithCounts.length
  const avgResponseTime = '24h' // TODO: Calculate from actual data
  const verifiedExperts = 12 // TODO: Count unique verified experts who answered in this category
  const engagementLevel = totalQuestions > 50 ? 'High' : totalQuestions > 20 ? 'Medium' : 'Growing'

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Hero Header */}
      <CategoryDetailHero category={category} />

      {/* Stats Bar */}
      <CategoryDetailStats
        totalQuestions={totalQuestions}
        avgResponseTime={avgResponseTime}
        verifiedExperts={verifiedExperts}
        engagementLevel={engagementLevel}
      />

      {/* Main Content: Sidebar + Posts Grid */}
      <section className="py-16 md:py-24 bg-white relative">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(212, 175, 55, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(212, 175, 55, 0.1) 1px, transparent 1px)`,
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Sidebar - 25% on desktop */}
            <aside className="lg:col-span-3 order-2 lg:order-1">
              <div className="lg:sticky lg:top-24">
                <CategoryDetailSidebar
                  category={category}
                  relatedTags={relatedTags}
                  relatedCategories={relatedCategories || []}
                />
              </div>
            </aside>

            {/* Main Content - 75% on desktop */}
            <main className="lg:col-span-9 order-1 lg:order-2">
              <CategoryDetailPostsGrid
                posts={postsWithCounts}
                categoryName={category.name}
              />
            </main>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <CategoryDetailCTA
        categoryName={category.name}
        categorySlug={category.slug}
      />
    </div>
  )
}
