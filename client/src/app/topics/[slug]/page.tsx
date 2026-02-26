import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Metadata } from 'next'

type Topic = {
  title: string
  slug: string
  summary: string | null
  content: string
  category: string | null
  faqs: { question: string; answer: string }[] | null
  related_papers: { title: string; slug: string }[] | null
  last_updated: string | null
}

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ slug: string }>
}

async function getTopic(slug: string): Promise<Topic | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) return null

  try {
    const res = await fetch(
      `${url}/rest/v1/consumer_topics?slug=eq.${encodeURIComponent(slug)}&status=eq.published&select=*`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
        cache: 'no-store',
      }
    )
    if (!res.ok) return null
    const data = await res.json()
    return data[0] || null
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const topic = await getTopic(slug)

  if (!topic) {
    return { title: 'Topic Not Found' }
  }

  return {
    title: `${topic.title} — Yacht Insurance Guide`,
    description: topic.summary || `Learn about ${topic.title.toLowerCase()} for yacht and boat insurance.`,
  }
}

function generateFAQSchema(topic: Topic) {
  if (!topic.faqs || topic.faqs.length === 0) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: topic.faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

export default async function TopicPage({ params }: Props) {
  const { slug } = await params
  const topic = await getTopic(slug)

  if (!topic) {
    notFound()
  }

  const faqSchema = generateFAQSchema(topic)

  // Content is generated internally by our pipeline - trusted source
  // For additional security, consider adding DOMPurify sanitization

  return (
    <>
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <article className="container mx-auto px-4 py-8 max-w-3xl">
        <nav className="text-sm text-muted-foreground mb-6">
          <Link href="/topics" className="hover:underline">Topics</Link>
          {topic.category && (
            <>
              <span className="mx-2">›</span>
              <span>{topic.category}</span>
            </>
          )}
        </nav>

        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-3">{topic.title}</h1>
          {topic.summary && (
            <p className="text-lg text-muted-foreground">{topic.summary}</p>
          )}
          {topic.last_updated && (
            <p className="text-sm text-muted-foreground mt-3">
              Updated {new Date(topic.last_updated).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          )}
        </header>

        <div
          className="prose prose-slate max-w-none"
          dangerouslySetInnerHTML={{ __html: topic.content }}
        />

        {/* FAQ Section */}
        {topic.faqs && topic.faqs.length > 0 && (
          <section className="mt-12 border-t pt-8">
            <h2 className="text-2xl font-semibold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {topic.faqs.map((faq, i) => (
                <div key={i} className="border-b pb-4 last:border-b-0">
                  <h3 className="font-medium text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Related Papers */}
        {topic.related_papers && topic.related_papers.length > 0 && (
          <section className="mt-12 border-t pt-8">
            <h2 className="text-xl font-semibold mb-4">Related Intelligence Papers</h2>
            <p className="text-sm text-muted-foreground mb-4">
              For deeper technical analysis with industry citations:
            </p>
            <ul className="space-y-2">
              {topic.related_papers.map((paper, i) => (
                <li key={i}>
                  <Link
                    href={`/papers/${paper.slug}`}
                    className="text-primary hover:underline"
                  >
                    {paper.title} →
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Back to Topics */}
        <nav className="mt-12 pt-8 border-t">
          <Link href="/topics" className="text-primary hover:underline">
            ← Back to all topics
          </Link>
        </nav>
      </article>
    </>
  )
}
