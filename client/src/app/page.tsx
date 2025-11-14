import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Shield, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()

  // Fetch categories with post counts
  // @ts-ignore - Supabase type inference issue
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug, description')
    .order('display_order', { ascending: true })

  // Get post counts for each category
  const categoriesWithCounts = await Promise.all(
    (categories || []).map(async (cat: any) => {
      // @ts-ignore - Supabase type inference issue
      const { count } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', cat.id)
        .eq('status', 'published')

      return { ...cat, count: count || 0 }
    })
  )

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center py-12 md:py-20">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Yacht Insurance Community
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Share experiences, ask questions, and connect with yacht owners, brokers, and insurers in the world's first dedicated yacht insurance platform.
        </p>
        <div className="flex justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/signup">Get Started</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/posts">Browse Posts</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <Link href="/posts">
          <Card className="hover:border-primary transition-colors cursor-pointer h-full">
            <CardHeader>
              <MessageSquare className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Community Forum</CardTitle>
              <CardDescription>
                Share experiences and get answers from fellow yacht owners
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/companies">
          <Card className="hover:border-primary transition-colors cursor-pointer h-full">
            <CardHeader>
              <Shield className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Insurance Providers</CardTitle>
              <CardDescription>
                Browse verified insurers and brokers
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/faq">
          <Card className="hover:border-primary transition-colors cursor-pointer h-full">
            <CardHeader>
              <Users className="h-10 w-10 text-primary mb-2" />
              <CardTitle>FAQ</CardTitle>
              <CardDescription>
                Get answers to common yacht insurance questions
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </section>

      {/* Popular Categories */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Popular Topics</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoriesWithCounts.map((category) => (
            <Link href={`/posts?category=${category.id}`} key={category.slug}>
              <Card className="hover:border-primary transition-colors cursor-pointer">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-xl">{category.name}</CardTitle>
                    <Badge variant="secondary">{category.count} posts</Badge>
                  </div>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-muted rounded-lg p-8 md:p-12 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to join the community?</h2>
        <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
          Create your profile, share your yacht details, and start engaging with the world's largest yacht insurance community.
        </p>
        <Button size="lg" asChild>
          <Link href="/signup">Create Your Account</Link>
        </Button>
      </section>
    </div>
  )
}
