import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata = {
  title: 'Agreed Value - Yacht Insurance Glossary',
  description: 'Definition of agreed value in yacht insurance. Learn how agreed value policies work and how they differ from actual cash value (ACV) coverage.',
}

export default function AgreedValuePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <nav className="text-sm text-muted-foreground mb-4">
        <Link href="/">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/glossary">Glossary</Link>
        <span className="mx-2">/</span>
        <span>Agreed Value</span>
      </nav>

      <article className="prose prose-slate dark:prose-invert max-w-none">
        <h1>Agreed Value</h1>

        <p className="lead">
          A policy valuation method where you and your insurer agree on your yacht's value when the policy begins. In a total loss, you receive this agreed amount (minus deductible), regardless of market fluctuations.
        </p>

        <h2>How It Works</h2>
        <p>
          When you purchase an agreed value policy, the insurer evaluates your yacht through surveys, comparables, and purchase records to determine its fair market value. Once both parties agree on a specific dollar amount (e.g., $500,000), this becomes the maximum the insurer will pay in a total loss claim.
        </p>

        <h2>Example</h2>
        <p>
          You buy a 45-foot yacht for $450,000. After a marine survey, you and your insurer agree on a value of $450,000. Three years later, a hurricane sinks the yacht. You receive $450,000 (minus your deductible), even if similar yachts now sell for only $350,000 due to market depreciation.
        </p>

        <h2>Key Benefits</h2>
        <ul>
          <li><strong>Predictability:</strong> You know exactly what you'll receive</li>
          <li><strong>No depreciation:</strong> Market changes don't reduce your payout</li>
          <li><strong>Lender requirement:</strong> Most marine lenders require agreed value</li>
        </ul>

        <h2>Related Terms</h2>
        <div className="grid md:grid-cols-2 gap-4 not-prose">
          <Link href="/glossary/actual-cash-value">
            <Card className="hover:border-primary transition-colors">
              <CardHeader>
                <CardTitle className="text-base">Actual Cash Value (ACV)</CardTitle>
                <CardDescription>Alternative valuation method</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/learn/agreed-value-vs-acv">
            <Card className="hover:border-primary transition-colors">
              <CardHeader>
                <CardTitle className="text-base">Full Comparison Guide</CardTitle>
                <CardDescription>Agreed Value vs ACV explained</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </article>
    </div>
  )
}
