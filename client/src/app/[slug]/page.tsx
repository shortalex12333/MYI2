import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// Define existing static routes that should NOT be handled by this catch-all
// These routes have their own page.tsx files
const STATIC_ROUTES = [
  'about',
  'admin',
  'agreed-value-vs-actual-cash-value',
  'api',
  'categories',
  'category',
  'companies',
  'contact',
  'editorial-policy',
  'experts',
  'faq',
  'forgot-password',
  'glossary',
  'insights',
  'knowledge',
  'learn',
  'login',
  'onboarding',
  'posts',
  'privacy',
  'providers',
  'resources',
  'signup',
  'terms',
  'tools',
  'yacht-insurance',
]

// TypeScript interface for content page from Supabase
interface ContentPage {
  id: string
  slug: string
  title: string
  subtitle?: string
  body: string
  meta_title?: string
  meta_description?: string
  related_pages?: string[] // Array of slugs
  created_at: string
  updated_at: string
}

interface ContentPageProps {
  params: Promise<{ slug: string }>
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ContentPageProps): Promise<Metadata> {
  const { slug } = await params

  // Don't generate metadata for static routes
  if (STATIC_ROUTES.includes(slug)) {
    return {}
  }

  const supabase = await createClient()

  const { data: page } = await supabase
    .from('content_pages')
    .select('title, subtitle, meta_title, meta_description')
    .eq('slug', slug)
    .single() as { data: Pick<ContentPage, 'title' | 'subtitle' | 'meta_title' | 'meta_description'> | null }

  if (!page) {
    return {
      title: 'Page Not Found',
      description: 'The requested page could not be found.',
    }
  }

  const title = page.meta_title || page.title
  const description = page.meta_description || page.subtitle || `Learn about ${page.title} in our comprehensive yacht insurance guide.`

  return {
    title: `${title} | Yacht Insurance Guide`,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default async function ContentPage({ params }: ContentPageProps) {
  const { slug } = await params

  // If the slug matches a static route, let Next.js handle it normally
  // This shouldn't happen because Next.js prioritizes static routes, but as a safety check
  if (STATIC_ROUTES.includes(slug)) {
    notFound()
  }

  const supabase = await createClient()

  // Fetch the content page by slug
  const { data: page, error } = await supabase
    .from('content_pages')
    .select('*')
    .eq('slug', slug)
    .single() as { data: ContentPage | null; error: any }

  if (error || !page) {
    notFound()
  }

  const contentPage = page

  // Fetch related pages if they exist
  let relatedPages: Pick<ContentPage, 'id' | 'slug' | 'title' | 'subtitle'>[] = []
  if (contentPage.related_pages && contentPage.related_pages.length > 0) {
    const { data: related } = await supabase
      .from('content_pages')
      .select('id, slug, title, subtitle')
      .in('slug', contentPage.related_pages) as { data: Pick<ContentPage, 'id' | 'slug' | 'title' | 'subtitle'>[] | null }

    if (related) {
      relatedPages = related
    }
  }

  // Format date for display
  const lastUpdated = new Date(contentPage.updated_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // Build Schema.org structured data for SEO
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": contentPage.title,
    "description": contentPage.subtitle || contentPage.meta_description,
    "datePublished": contentPage.created_at,
    "dateModified": contentPage.updated_at,
    "author": {
      "@type": "Organization",
      "name": "Yacht Insurance Guide"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Yacht Insurance Guide"
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Breadcrumbs */}
      <nav className="text-sm text-muted-foreground mb-4">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/yacht-insurance" className="hover:text-foreground">Yacht Insurance</Link>
        <span className="mx-2">/</span>
        <span>{contentPage.title}</span>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{contentPage.title}</h1>
        {contentPage.subtitle && (
          <p className="text-xl text-muted-foreground mb-2">
            {contentPage.subtitle}
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          Last updated: {lastUpdated}
        </p>
      </header>

      {/* Main Content - Markdown rendered */}
      <article className="prose prose-slate dark:prose-invert max-w-none mb-12">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // Custom heading styles
            h2: ({ children }) => (
              <h2 className="text-3xl font-bold mt-12 mb-4 first:mt-0">{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-2xl font-semibold mt-8 mb-3">{children}</h3>
            ),
            h4: ({ children }) => (
              <h4 className="text-xl font-semibold mt-6 mb-2">{children}</h4>
            ),
            // Style links
            a: ({ href, children }) => {
              // Internal links
              if (href?.startsWith('/')) {
                return (
                  <Link href={href} className="text-primary hover:underline font-medium">
                    {children}
                  </Link>
                )
              }
              // External links
              return (
                <a
                  href={href}
                  className="text-primary hover:underline font-medium"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {children}
                </a>
              )
            },
            // Style blockquotes for callouts
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950 pl-4 py-2 my-4 not-italic">
                {children}
              </blockquote>
            ),
            // Style code blocks
            code: ({ className, children, ...props }) => {
              const isInline = !className
              if (isInline) {
                return (
                  <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-sm" {...props}>
                    {children}
                  </code>
                )
              }
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              )
            },
            // Style tables
            table: ({ children }) => (
              <div className="overflow-x-auto my-6">
                <table className="w-full border-collapse bg-white dark:bg-slate-900 rounded-lg overflow-hidden shadow-sm">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="bg-slate-100 dark:bg-slate-800">{children}</thead>
            ),
            th: ({ children }) => (
              <th className="p-4 text-left font-semibold border-b">{children}</th>
            ),
            td: ({ children }) => (
              <td className="p-4 border-b">{children}</td>
            ),
            // Style lists
            ul: ({ children }) => (
              <ul className="list-disc pl-6 space-y-2 my-4">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal pl-6 space-y-2 my-4">{children}</ol>
            ),
            // Style paragraphs
            p: ({ children }) => (
              <p className="my-4 leading-relaxed">{children}</p>
            ),
            // Style horizontal rules
            hr: () => (
              <hr className="my-8 border-t border-slate-200 dark:border-slate-700" />
            ),
            // Style strong/bold text
            strong: ({ children }) => (
              <strong className="font-semibold">{children}</strong>
            ),
          }}
        >
          {contentPage.body}
        </ReactMarkdown>
      </article>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-8 mb-12">
        <h2 className="text-2xl font-bold mb-4">Have Questions About Your Yacht Insurance?</h2>
        <p className="mb-6">
          Connect with experienced yacht insurance brokers who can help you understand your coverage options and find the right policy for your vessel.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link href="/signup">
            <Button size="lg" variant="secondary">Get a Quote</Button>
          </Link>
          <Link href="/contact">
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
              Contact an Expert
            </Button>
          </Link>
        </div>
      </section>

      {/* Related Pages */}
      {relatedPages.length > 0 && (
        <section className="mt-12 pt-8 border-t">
          <h2 className="text-2xl font-bold mb-6">Related Resources</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {relatedPages.map((relatedPage) => (
              <Link key={relatedPage.id} href={`/${relatedPage.slug}`}>
                <Card className="hover:border-primary transition-colors h-full">
                  <CardHeader>
                    <CardTitle className="text-lg">{relatedPage.title}</CardTitle>
                    {relatedPage.subtitle && (
                      <CardDescription>{relatedPage.subtitle}</CardDescription>
                    )}
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Back to Yacht Insurance Guide */}
      <section className="mt-8 p-6 bg-slate-50 dark:bg-slate-900 rounded-lg">
        <p className="text-sm">
          Return to our main{' '}
          <Link href="/yacht-insurance" className="text-primary hover:underline font-medium">
            Yacht Insurance Guide
          </Link>
          {' '}for a complete overview of coverage types, policy structures, and what to ask your broker.
        </p>
      </section>

      {/* Schema.org Article markup for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schemaData)
        }}
      />
    </div>
  )
}
