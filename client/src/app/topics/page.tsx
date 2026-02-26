import Link from 'next/link'

type Topic = {
  title: string
  slug: string
  summary: string | null
  category: string | null
  last_updated: string | null
}

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Yacht Insurance Topics — Guides for Boat Owners',
  description: 'Comprehensive guides to yacht insurance fundamentals. Coverage options, cost factors, claim processes, and expert advice for new and experienced boat owners.'
}

const CATEGORY_ORDER = [
  'Coverage Basics',
  'Cost & Quotes',
  'Claims',
  'Policy Types',
  'Florida & Hurricane',
  'General'
]

export default async function TopicsIndexPage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Yacht Insurance Topics</h1>
        <p className="text-red-500">Configuration error - missing database connection.</p>
      </div>
    )
  }

  let topics: Topic[] = []
  try {
    const res = await fetch(
      `${url}/rest/v1/consumer_topics?select=title,slug,summary,category,last_updated&status=eq.published&order=category.asc,title.asc`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
        cache: 'no-store',
      }
    )
    if (res.ok) {
      topics = await res.json()
    } else {
      console.error('Topics fetch failed:', res.status, await res.text())
    }
  } catch (e) {
    console.error('Topics fetch error:', e)
  }

  // Group by category
  const byCategory = topics.reduce((acc, t) => {
    const cat = t.category || 'General'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(t)
    return acc
  }, {} as Record<string, Topic[]>)

  // Sort categories by predefined order
  const sortedCategories = CATEGORY_ORDER.filter(cat => byCategory[cat])
  // Add any categories not in the predefined order
  Object.keys(byCategory).forEach(cat => {
    if (!sortedCategories.includes(cat)) {
      sortedCategories.push(cat)
    }
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Yacht Insurance Topics</h1>
      <p className="text-muted-foreground mb-8">
        Expert guides on yacht insurance fundamentals. Clear explanations for boat owners at every experience level.
      </p>

      {topics.length === 0 ? (
        <p className="text-muted-foreground">No topics published yet.</p>
      ) : (
        <div className="space-y-10">
          {sortedCategories.map(category => (
            <section key={category}>
              <h2 className="text-xl font-semibold mb-4 border-b pb-2">{category}</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {byCategory[category].map((t) => (
                  <Link
                    key={t.slug}
                    href={`/topics/${t.slug}`}
                    className="border rounded-lg p-4 hover:border-primary transition-colors"
                  >
                    <h3 className="font-medium">{t.title}</h3>
                    {t.summary && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{t.summary}</p>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
