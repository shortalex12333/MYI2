import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { generateFAQSchema, generateBreadcrumbSchema, COMMON_BREADCRUMBS } from '@/lib/schema'

type QAEntry = {
  id: number
  question: string
  answer: string
  tags: string[] | null
  confidence: number
  source_url: string
  created_at: string
}

export default async function QADetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )

  const { data, error } = await supabase
    .from('qa_entries')
    .select('id, question, answer, tags, confidence, source_url, created_at')
    .eq('id', params.id)
    .eq('active', true)
    .single()

  if (error || !data) {
    notFound()
  }

  const entry = data as QAEntry

  // Generate FAQPage schema
  const faqSchema = generateFAQSchema(entry.question, entry.answer)

  // Generate BreadcrumbList schema
  const breadcrumbSchema = generateBreadcrumbSchema([
    COMMON_BREADCRUMBS.home,
    COMMON_BREADCRUMBS.knowledge,
    { name: entry.question, url: `/knowledge/${entry.id}` },
  ])

  return (
    <div className="container mx-auto px-4 py-8">
      {/* FAQPage Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* BreadcrumbList Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <article className="max-w-3xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6 text-sm text-muted-foreground">
          <a href="/" className="hover:text-foreground">
            Home
          </a>
          <span className="mx-2">/</span>
          <a href="/knowledge" className="hover:text-foreground">
            Knowledge Base
          </a>
          <span className="mx-2">/</span>
          <span className="text-foreground">Q&A</span>
        </nav>

        <header className="mb-6">
          {/* Question as h1 */}
          <h1 className="text-3xl font-bold mb-4">{entry.question}</h1>

          {/* Confidence badge */}
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-block bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded">
              {(entry.confidence * 100).toFixed(0)}% confidence
            </span>
            {entry.created_at && (
              <p className="text-sm text-muted-foreground">
                Published {new Date(entry.created_at).toLocaleDateString()}
              </p>
            )}
          </div>

          {/* Tags */}
          {entry.tags && entry.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {entry.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-block bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Answer with prose styling */}
        <div className="prose prose-slate dark:prose-invert max-w-none mb-8">
          <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg">
            <h2 className="text-xl font-semibold mb-3 mt-0">Answer</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{entry.answer}</p>
          </div>
        </div>

        {/* Source link */}
        {entry.source_url && (
          <footer className="pt-6 border-t border-gray-200">
            <a
              href={entry.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm"
            >
              View original source →
            </a>
          </footer>
        )}

        {/* Back link */}
        <div className="mt-8">
          <a
            href="/knowledge"
            className="inline-flex items-center text-sm text-blue-600 hover:underline"
          >
            ← Back to Knowledge Base
          </a>
        </div>
      </article>
    </div>
  )
}
