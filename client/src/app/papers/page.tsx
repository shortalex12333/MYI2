import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

type Paper = {
  title: string
  slug: string
  tldr: string | null
  cluster_id: string | null
  last_updated: string | null
  word_count: number | null
}

export const metadata = {
  title: 'Papers — Marine Insurance Intelligence',
  description: 'Long‑form, citation‑bound papers on yacht insurance topics. Neutral, framework‑first, reviewed for structure and evidence.'
}

export default async function PapersIndexPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )

  const { data, error } = await supabase
    .from('papers')
    .select('title,slug,tldr,cluster_id,last_updated,word_count')
    .order('last_updated', { ascending: false })
    .limit(50)

  const papers: Paper[] = data || []

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Intelligence Papers</h1>
      <p className="text-muted-foreground mb-8">
        Long‑form analyses with verified citations. Structured for retrieval and reviewed for evidence integrity.
      </p>

      {papers.length === 0 ? (
        <p className="text-muted-foreground">No papers published yet.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {papers.map((p) => (
            <Link key={p.slug} href={`/papers/${p.slug}`} className="border rounded-lg p-5 hover:border-primary transition-colors">
              <div className="min-w-0">
                <h2 className="text-lg font-semibold truncate">{p.title}</h2>
                {p.tldr && (
                  <p className="text-sm text-muted-foreground line-clamp-3 mt-1">{p.tldr}</p>
                )}
                <div className="text-xs text-muted-foreground mt-3 flex gap-3">
                  {p.cluster_id && <span>Cluster: {p.cluster_id}</span>}
                  {p.word_count && <span>{p.word_count} words</span>}
                  {p.last_updated && <span>{new Date(p.last_updated).toLocaleDateString()}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

