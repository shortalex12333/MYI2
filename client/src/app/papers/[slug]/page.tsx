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
  published_at: string | null
}

export default async function PaperDetailPage({ params }: { params: { slug: string } }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )

  const { data, error } = await supabase
    .from('papers')
    .select('id,title,slug,body_markdown,tldr,published_at')
    .eq('slug', params.slug)
    .single()

  if (error || !data) {
    notFound()
  }
  const p = data as Paper

  // citations
  const { data: refs } = await supabase
    .from('paper_citation_map')
    .select('ref_id, relevance_note, position')
    .order('position', { ascending: true })
    .eq('paper_id', p.id)

  return (
    <div className="container mx-auto px-4 py-8">
      <article className="max-w-3xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{p.title}</h1>
          {p.tldr && <p className="text-muted-foreground">{p.tldr}</p>}
          {p.published_at && (
            <p className="text-xs text-muted-foreground mt-2">Published {new Date(p.published_at).toLocaleDateString()}</p>
          )}
        </header>

        {p.body_markdown ? (
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{p.body_markdown}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-muted-foreground">This paper is not yet available.</p>
        )}

        {refs && refs.length > 0 && (
          <section className="mt-10 border-t pt-6">
            <h2 className="text-xl font-semibold mb-3">References</h2>
            <ol className="list-decimal pl-5 space-y-1 text-sm text-muted-foreground">
              {refs.map((r: any) => (
                <li key={r.ref_id}>
                  <span className="text-foreground">{r.ref_id}</span>
                  {r.relevance_note ? ` — ${r.relevance_note}` : ''}
                </li>
              ))}
            </ol>
          </section>
        )}
      </article>
    </div>
  )
}

