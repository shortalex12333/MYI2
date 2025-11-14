import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, Calendar } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default async function CompanyPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  // @ts-ignore - Supabase type inference issue
  const { data: company, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !company) {
    notFound()
  }

  // Fetch related posts
  // @ts-ignore - Supabase type inference issue
  const { data: posts } = await supabase
    .from('posts')
    .select(`
      id,
      title,
      created_at,
      view_count,
      author:profiles!author_id(username),
      category:categories(name)
    `)
    .eq('company_id', params.id)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-4xl font-bold">{company.name}</h1>
            {company.verified && (
              <Badge className="bg-green-500">
                ✓ Verified Provider
              </Badge>
            )}
          </div>

          {company.description && (
            <p className="text-lg text-muted-foreground mb-4">
              {company.description}
            </p>
          )}

          {company.website && (
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              Visit Website
            </a>
          )}
        </div>

        {/* Company Info Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Listed since</span>
              <span>{formatDate(company.created_at)}</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Status:</span>{' '}
              <span className="font-medium">
                {company.verified ? 'Verified Provider' : 'Community Listed'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Related Posts */}
        <div>
          <h2 className="text-2xl font-bold mb-4">
            Discussions mentioning {company.name}
          </h2>

          {!posts || posts.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">
                No discussions about this provider yet. Be the first to share your experience!
              </p>
              <Link
                href="/posts/new"
                className="inline-block mt-4 text-primary hover:underline"
              >
                Start a discussion
              </Link>
            </Card>
          ) : (
            <div className="space-y-3">
              {posts.map((post: any) => (
                <Link
                  key={post.id}
                  href={`/posts/${post.id}`}
                  className="block border rounded-lg p-4 hover:border-primary transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1 hover:text-primary">
                        {post.title}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>by {post.author?.username || 'Unknown'}</span>
                        {post.category && (
                          <>
                            <span>•</span>
                            <span>{post.category.name}</span>
                          </>
                        )}
                        <span>•</span>
                        <span>{formatDate(post.created_at)}</span>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground whitespace-nowrap">
                      {post.view_count || 0} views
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
