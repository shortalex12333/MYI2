import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { createClient } from '@supabase/supabase-js'

type Paper = {
  id: string
  title: string
  slug: string
  body_markdown: string | null
  tldr: string | null
  last_updated: string | null
}

async function fetchPaper(slug: string): Promise<Paper | null> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
  const { data } = await supabase
    .from('papers')
    .select('id,title,slug,body_markdown,tldr,last_updated')
    .eq('slug', slug)
    .single()
  return (data as Paper) || null
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const p = await fetchPaper(params.slug)
  if (!p) {
    return { title: 'Paper not found — MyYachtsInsurance' }
  }
  const description = p.tldr || `${p.title} — yacht insurance intelligence brief.`
  const url = `https://www.myyachtsinsurance.com/papers/${p.slug}`
  return {
    title: `${p.title} — MyYachtsInsurance`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: p.title,
      description,
      url,
      type: 'article',
      siteName: 'MyYachtsInsurance',
      publishedTime: p.last_updated || undefined,
      modifiedTime: p.last_updated || undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: p.title,
      description,
    },
  }
}

export default async function PaperDetailPage({ params }: { params: { slug: string } }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )

  const { data, error } = await supabase
    .from('papers')
    .select('id,title,slug,body_markdown,tldr,last_updated')
    .eq('slug', params.slug)
    .single()

  if (error || !data) {
    notFound()
  }
  const p = data as Paper

  // Strip duplicate title line from body if it starts with "## Title"
  let bodyContent = p.body_markdown || ''
  const titlePattern = new RegExp(`^## ${p.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\n+`, 'm')
  bodyContent = bodyContent.replace(titlePattern, '')

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: p.title,
    description: p.tldr || undefined,
    datePublished: p.last_updated || undefined,
    dateModified: p.last_updated || undefined,
    author: {
      '@type': 'Person',
      name: 'Alex Short',
      url: 'https://alex-short.com/experience',
    },
    reviewedBy: {
      '@type': 'Person',
      name: 'Alex Short',
      jobTitle: 'Independent Yacht Insurance Risk Analyst',
      url: 'https://alex-short.com/experience',
    },
    publisher: {
      '@type': 'Organization',
      name: 'MyYachtsInsurance',
      url: 'https://www.myyachtsinsurance.com',
    },
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="max-w-3xl mx-auto">
        <header className="mb-6">
          {p.last_updated && (
            <p className="text-xs text-muted-foreground mb-2">{new Date(p.last_updated).toLocaleDateString()}</p>
          )}
          <h1 className="text-3xl font-bold">{p.title}</h1>
        </header>

        {bodyContent ? (
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{bodyContent}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-muted-foreground">This paper is not yet available.</p>
        )}

      </article>
    </div>
  )
}

