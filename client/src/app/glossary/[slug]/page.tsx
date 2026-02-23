import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface GlossaryTermPageProps {
  params: Promise<{ slug: string }>
}

interface GlossaryTerm {
  id: string
  term: string
  slug: string
  definition: string
  body: string | null
  category: string | null
  related_terms: string[] | null
  meta_title: string | null
  meta_description: string | null
  created_at: string
  updated_at: string
}

interface RelatedTerm {
  id: string
  term: string
  slug: string
  definition: string
}

async function getGlossaryTerm(slug: string): Promise<GlossaryTerm | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('glossary_terms')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !data) {
    return null
  }

  return data as GlossaryTerm
}

async function getRelatedTerms(relatedSlugs: string[] | null): Promise<RelatedTerm[]> {
  if (!relatedSlugs || relatedSlugs.length === 0) {
    return []
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('glossary_terms')
    .select('id, term, slug, definition')
    .in('slug', relatedSlugs)

  if (error || !data) {
    return []
  }

  return data as RelatedTerm[]
}

export async function generateMetadata({ params }: GlossaryTermPageProps): Promise<Metadata> {
  const { slug } = await params
  const term = await getGlossaryTerm(slug)

  if (!term) {
    return {
      title: 'Term Not Found - Yacht Insurance Glossary',
      description: 'The requested glossary term could not be found.',
    }
  }

  const title = term.meta_title || `${term.term} - Yacht Insurance Glossary`
  const description = term.meta_description || term.definition

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
    },
  }
}

export default async function GlossaryTermPage({ params }: GlossaryTermPageProps) {
  const { slug } = await params
  const term = await getGlossaryTerm(slug)

  if (!term) {
    notFound()
  }

  const relatedTerms = await getRelatedTerms(term.related_terms)

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <nav className="text-sm text-muted-foreground mb-4">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/glossary" className="hover:text-foreground">Glossary</Link>
        <span className="mx-2">/</span>
        <span>{term.term}</span>
      </nav>

      <article className="prose prose-slate dark:prose-invert max-w-none">
        <h1>{term.term}</h1>

        <p className="lead">
          {term.definition}
        </p>

        {term.body && (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {term.body}
          </ReactMarkdown>
        )}

        {relatedTerms.length > 0 && (
          <>
            <h2>Related Terms</h2>
            <div className="grid md:grid-cols-2 gap-4 not-prose">
              {relatedTerms.map((relatedTerm) => (
                <Link href={`/glossary/${relatedTerm.slug}`} key={relatedTerm.id}>
                  <Card className="hover:border-primary transition-colors h-full">
                    <CardHeader>
                      <CardTitle className="text-base">{relatedTerm.term}</CardTitle>
                      <CardDescription>{relatedTerm.definition}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        )}
      </article>

      {/* Back to Glossary */}
      <div className="mt-8 pt-8 border-t">
        <Link
          href="/glossary"
          className="text-primary hover:underline text-sm"
        >
          &larr; Back to Glossary
        </Link>
      </div>
    </div>
  )
}
