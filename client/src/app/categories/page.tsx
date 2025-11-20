import { createClient } from '@/lib/supabase/server'
import { CategoryHero } from '@/components/categories/CategoryHero'
import { CategoryStatsBar } from '@/components/categories/CategoryStatsBar'
import { CategoryGrid } from '@/components/categories/CategoryGrid'
import { CategoryCTA } from '@/components/categories/CategoryCTA'

export default async function CategoriesPage() {
  const supabase = await createClient()

  // Fetch categories with post counts
  // @ts-ignore - Supabase type inference issue
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*, posts(count)')
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching categories:', error)
  }

  // Calculate total questions across all categories
  const totalQuestions = categories?.reduce((sum, cat) => {
    const count = cat.posts?.[0]?.count || 0
    return sum + count
  }, 0) || 0

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Hero Header Section */}
      <CategoryHero />

      {/* Maritime Stats Bar */}
      <CategoryStatsBar
        totalCategories={categories?.length || 0}
        totalQuestions={totalQuestions}
      />

      {/* Main Category Grid */}
      {!categories || categories.length === 0 ? (
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-block p-8 rounded-lg bg-gray-100  border border-gray-200">
              <p className="text-xl text-gray-900/70">
                No categories available yet.
              </p>
            </div>
          </div>
        </section>
      ) : (
        <CategoryGrid categories={categories} />
      )}

      {/* Bottom CTA Section */}
      <CategoryCTA />
    </div>
  )
}
