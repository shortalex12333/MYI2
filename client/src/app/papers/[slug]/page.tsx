import { notFound } from 'next/navigation'
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

  return (
    <div className="container mx-auto px-4 py-8">
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

