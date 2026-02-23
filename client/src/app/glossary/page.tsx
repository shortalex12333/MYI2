import Link from 'next/link'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Yacht Insurance Glossary - Key Terms & Definitions',
  description: 'Comprehensive glossary of yacht insurance terms including agreed value, ACV, hull & machinery, P&I, navigation limits, and more. Definitions explained in plain English.',
  openGraph: {
    title: 'Yacht Insurance Glossary',
    description: 'Key insurance terms explained in plain English',
    type: 'website',
  },
}

interface GlossaryTerm {
  id: string
  term: string
  slug: string
  definition: string
  category: string
}

async function getGlossaryTerms(): Promise<GlossaryTerm[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('glossary_terms')
    .select('id, term, slug, definition, category')
    .eq('active', true)
    .order('display_order', { ascending: true })
    .order('term', { ascending: true })

  if (error || !data) {
    console.error('Error fetching glossary terms:', error)
    return []
  }

  return data as GlossaryTerm[]
}

export default async function GlossaryPage() {
  const terms = await getGlossaryTerms()
  const categories = [...new Set(terms.map(t => t.category))].sort()

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Breadcrumbs */}
      <nav className="text-sm text-muted-foreground mb-4">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span className="mx-2">/</span>
        <span>Glossary</span>
      </nav>

      {/* Header */}
      <header className="text-center mb-12">
        <div className="flex justify-center mb-4">
          <BookOpen className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-4xl font-bold mb-4">Yacht Insurance Glossary</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Key terms and definitions explained in plain English
        </p>
      </header>

      {/* Terms by Category */}
      {categories.map((category) => (
        <section key={category} className="mb-12">
          <h2 className="text-2xl font-bold mb-6">{category}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {terms
              .filter((t) => t.category === category)
              .map((term) => (
                <Link href={`/glossary/${term.slug}`} key={term.slug}>
                  <Card className="hover:border-primary transition-colors h-full cursor-pointer">
                    <CardHeader>
                      <CardTitle className="text-lg">{term.term}</CardTitle>
                      <CardDescription>{term.definition}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
          </div>
        </section>
      ))}

      {/* Related Resources */}
      <section className="mt-12 pt-8 border-t">
        <h2 className="text-2xl font-bold mb-6">Learning Guides</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Link href="/yacht-insurance">
            <Card className="hover:border-primary transition-colors h-full">
              <CardHeader>
                <CardTitle className="text-lg">Yacht Insurance Overview</CardTitle>
                <CardDescription>Complete guide to coverage types and costs</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/learn/agreed-value-vs-acv">
            <Card className="hover:border-primary transition-colors h-full">
              <CardHeader>
                <CardTitle className="text-lg">Agreed Value vs ACV</CardTitle>
                <CardDescription>Compare policy valuation methods</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/tools/named-storm-deductible-calculator">
            <Card className="hover:border-primary transition-colors h-full">
              <CardHeader>
                <CardTitle className="text-lg">Deductible Calculator</CardTitle>
                <CardDescription>Calculate hurricane deductible exposure</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </section>
    </div>
  )
}
