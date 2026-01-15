import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Calculator, Shield, FileText } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center py-12 md:py-20">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Yacht Insurance Answers
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Clear guides, practical tools, and expert explanations to help you understand yacht insurance coverage, costs, and claims.
        </p>
        <div className="flex justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/yacht-insurance">Start Learning</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/tools/named-storm-deductible-calculator">Try Calculator</Link>
          </Button>
        </div>
      </section>

      {/* Key Resources */}
      <section className="grid md:grid-cols-2 gap-6 mb-12">
        <Link href="/tools/named-storm-deductible-calculator">
          <Card className="hover:border-primary transition-colors cursor-pointer h-full">
            <CardHeader>
              <Calculator className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Named Storm Deductible Calculator</CardTitle>
              <CardDescription>
                Calculate your exact hurricane deductible exposure for Florida waters
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/learn/agreed-value-vs-acv">
          <Card className="hover:border-primary transition-colors cursor-pointer h-full">
            <CardHeader>
              <FileText className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Agreed Value vs ACV Guide</CardTitle>
              <CardDescription>
                Understand total loss payouts and which policy type protects you better
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </section>

      {/* Learning Hub */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Essential Yacht Insurance Guides</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { name: 'Named Storm Deductibles', slug: '/learn/named-storm-deductible', description: 'Florida hurricane deductibles explained with real examples' },
            { name: 'Agreed Value vs ACV', slug: '/learn/agreed-value-vs-acv', description: 'Compare policy valuation methods and payout scenarios' },
            { name: 'Navigation Limits', slug: '/learn/navigation-limits-and-layup-warranty', description: 'Geographic restrictions and seasonal warranties' },
            { name: 'Hull & Machinery', slug: '/yacht-insurance#hull-machinery', description: 'Physical damage coverage for your vessel' },
            { name: 'P&I Liability', slug: '/yacht-insurance#protection-indemnity', description: 'Liability coverage for injury and property damage' },
            { name: 'Insurance Glossary', slug: '/glossary', description: 'Key terms and definitions explained in plain English' },
          ].map((guide) => (
            <Link href={guide.slug} key={guide.slug}>
              <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="text-lg">{guide.name}</CardTitle>
                  <CardDescription>{guide.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-8 md:p-12 text-center">
        <h2 className="text-3xl font-bold mb-4">Need help finding the right coverage?</h2>
        <p className="text-lg mb-6 max-w-2xl mx-auto opacity-90">
          Our guides explain yacht insurance in plain language so you can make informed decisions with your broker.
        </p>
        <Button size="lg" variant="secondary" asChild>
          <Link href="/yacht-insurance">Read the Full Guide</Link>
        </Button>
      </section>
    </div>
  )
}
