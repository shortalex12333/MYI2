import { MetadataRoute } from 'next'

// Fetch papers from Supabase
async function fetchPapers(): Promise<{ slug: string; updated: string | null }[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return []

  try {
    const res = await fetch(
      `${url}/rest/v1/papers?select=slug,last_updated&review_status=eq.published`,
      {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
        next: { revalidate: 3600 }
      }
    )
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

// Fetch topics from Supabase
async function fetchTopics(): Promise<{ slug: string; last_updated: string | null }[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return []

  try {
    const res = await fetch(
      `${url}/rest/v1/consumer_topics?select=slug,last_updated&status=eq.published`,
      {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
        next: { revalidate: 3600 }
      }
    )
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.myyachtsinsurance.com'
  const lastModified = new Date()

  // Fetch dynamic content
  const [papers, topics] = await Promise.all([fetchPapers(), fetchTopics()])

  // Static core pages (only indexable pages)
  const corePages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/editorial-policy`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  // Learning hub - high priority SEO content
  const learningPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/yacht-insurance`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/learn/named-storm-deductible`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/learn/agreed-value-vs-acv`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/learn/navigation-limits-and-layup-warranty`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
  ]

  // Glossary pages (only pages that exist)
  const glossaryPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/glossary`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/glossary/agreed-value`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/glossary/actual-cash-value`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ]

  // Tools - linkable assets
  const toolsAndResources: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/tools/named-storm-deductible-calculator`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.8,
    },
  ]

  // Papers - intelligence briefs (priority 0.9)
  const paperPages: MetadataRoute.Sitemap = papers.map((p: any) => ({
    url: `${baseUrl}/papers/${p.slug}`,
    lastModified: p.last_updated ? new Date(p.last_updated) : lastModified,
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }))

  // Topics - consumer guides (priority 0.8)
  const topicPages: MetadataRoute.Sitemap = topics.map(t => ({
    url: `${baseUrl}/topics/${t.slug}`,
    lastModified: t.last_updated ? new Date(t.last_updated) : lastModified,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  // Index pages for papers and topics
  const indexPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/papers`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/topics`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]

  // Combine only indexable pages (excludes noindex community pages)
  return [
    ...corePages,
    ...learningPages,
    ...glossaryPages,
    ...toolsAndResources,
    ...indexPages,
    ...paperPages,
    ...topicPages,
  ]
}
