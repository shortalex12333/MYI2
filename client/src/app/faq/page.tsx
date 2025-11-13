import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ReactMarkdown from 'react-markdown'

export default async function FAQPage() {
  const supabase = await createClient()

  // @ts-ignore - Supabase type inference issue
  const { data: faqs } = await supabase
    .from('faqs')
    .select(`
      *,
      category:categories(*)
    `)
    .order('display_order', { ascending: true })

  // Group FAQs by category
  const faqsByCategory = faqs?.reduce((acc: any, faq) => {
    const categoryName = faq.category?.name || 'General'
    if (!acc[categoryName]) {
      acc[categoryName] = []
    }
    acc[categoryName].push(faq)
    return acc
  }, {})

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Find answers to common questions about yacht insurance
        </p>

        <div className="space-y-8">
          {!faqs || faqs.length === 0 ? (
            <div className="text-center p-12 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground">
                No FAQs available yet. Check back soon or ask the community!
              </p>
            </div>
          ) : (
            faqsByCategory && Object.entries(faqsByCategory).map(([category, categoryFaqs]: [string, any]) => (
              <div key={category}>
                <h2 className="text-2xl font-semibold mb-4">{category}</h2>
                <div className="space-y-4">
                  {categoryFaqs.map((faq: any) => (
                    <Card key={faq.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{faq.question}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="prose prose-sm max-w-none">
                          <ReactMarkdown>{faq.answer}</ReactMarkdown>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-12 text-center p-8 bg-muted rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Can't find what you're looking for?</h3>
          <p className="text-muted-foreground mb-4">
            Ask the community or browse existing discussions
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="/posts/new"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Ask a Question
            </a>
            <a
              href="/posts"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring h-10 px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground"
            >
              Browse Posts
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
