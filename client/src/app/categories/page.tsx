import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function CategoriesPage() {
  const supabase = await createClient()

  // @ts-ignore - Supabase type inference issue
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*, posts(count)')
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching categories:', error)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Categories</h1>

      {!categories || categories.length === 0 ? (
        <p className="text-muted-foreground">No categories available yet.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category: any) => (
            <Link
              key={category.id}
              href={`/posts?category=${category.id}`}
              className="border rounded-lg p-6 hover:border-primary transition-colors"
            >
              <h2 className="text-xl font-semibold mb-2">{category.name}</h2>
              {category.description && (
                <p className="text-sm text-muted-foreground mb-4">
                  {category.description}
                </p>
              )}
              <p className="text-sm text-primary">
                {category.posts?.[0]?.count || 0} posts
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
