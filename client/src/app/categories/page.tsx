import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageCircle, TrendingUp } from 'lucide-react'

export default async function CategoriesPage() {
  const supabase = await createClient()

  // Fetch categories with post counts
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true })

  // Get post counts for each category
  const categoriesWithCounts = await Promise.all(
    (categories || []).map(async (category) => {
      const { count } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', category.id)
        .eq('status', 'published')

      return {
        ...category,
        post_count: count || 0,
      }
    })
  )

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex gap-6">
        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Browse Categories</h1>
            <p className="text-muted-foreground">
              Explore yacht insurance topics organized by category
            </p>
          </div>

          {/* Categories Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            {categoriesWithCounts && categoriesWithCounts.length > 0 ? (
              categoriesWithCounts.map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className="block"
                >
                  <Card className="hover:shadow-lg transition-all hover:border-primary/50 h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-1">
                            {category.name}
                          </CardTitle>
                          {category.description && (
                            <CardDescription>
                              {category.description}
                            </CardDescription>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          <span>
                            {category.post_count} {category.post_count === 1 ? 'post' : 'posts'}
                          </span>
                        </div>
                        {category.post_count > 0 && (
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" />
                            <span>Active</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground mb-4">
                  No categories available yet.
                </p>
              </div>
            )}
          </div>
        </main>

        {/* Sidebar */}
        <aside className="hidden lg:block w-80 shrink-0">
          <div className="sticky top-20 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">About Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-muted-foreground">
                  Categories help organize discussions about different aspects of
                  yacht insurance. Browse by topic to find relevant conversations.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Have a Question?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-muted-foreground">
                  Post your question in the most relevant category to get the best
                  responses from the community.
                </p>
                <Button asChild className="w-full" size="sm">
                  <Link href="/posts/new">Ask a Question</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Categories</span>
                  <span className="font-semibold">{categoriesWithCounts?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Posts</span>
                  <span className="font-semibold">
                    {categoriesWithCounts?.reduce((sum, cat) => sum + cat.post_count, 0) || 0}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Other Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Link href="/companies" className="block text-primary hover:underline">
                  Verified Companies
                </Link>
                <Link href="/faq" className="block text-primary hover:underline">
                  FAQ
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
