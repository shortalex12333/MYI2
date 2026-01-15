import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata = {
  title: 'Actual Cash Value (ACV) - Yacht Insurance Glossary',
  description: 'Definition of actual cash value in yacht insurance. Understand how ACV policies calculate payouts based on depreciated market value.',
}

export default function ACVPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <nav className="text-sm text-muted-foreground mb-4">
        <Link href="/">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/glossary">Glossary</Link>
        <span className="mx-2">/</span>
        <span>Actual Cash Value</span>
      </nav>

      <article className="prose prose-slate dark:prose-invert max-w-none">
        <h1>Actual Cash Value (ACV)</h1>

        <p className="lead">
          A policy valuation method that pays the depreciated market value of your yacht at the time of loss, not the original purchase price or agreed value.
        </p>

        <h2>How It Works</h2>
        <p>
          ACV policies calculate payouts as: <strong>Replacement cost - Depreciation</strong>. The insurer determines what your yacht is worth on the current market, accounting for age, condition, and market trends. This amount is paid in a total loss claim (minus deductible).
        </p>

        <h2>Example</h2>
        <p>
          You bought a yacht for $300,000 five years ago. Market depreciation and wear mean similar yachts now sell for $200,000. If your yacht is totaled, an ACV policy pays approximately $200,000 (minus deductible), even though you paid $300,000.
        </p>

        <h2>Key Considerations</h2>
        <ul>
          <li><strong>Lower premiums:</strong> ACV policies cost 10-20% less than agreed value</li>
          <li><strong>Depreciation risk:</strong> Payout decreases over time</li>
          <li><strong>Financing issues:</strong> May not cover your outstanding loan balance</li>
        </ul>

        <h2>Related Terms</h2>
        <div className="grid md:grid-cols-2 gap-4 not-prose">
          <Link href="/glossary/agreed-value">
            <Card className="hover:border-primary transition-colors">
              <CardHeader>
                <CardTitle className="text-base">Agreed Value</CardTitle>
                <CardDescription>Alternative valuation method</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/learn/agreed-value-vs-acv">
            <Card className="hover:border-primary transition-colors">
              <CardHeader>
                <CardTitle className="text-base">Full Comparison Guide</CardTitle>
                <CardDescription>ACV vs Agreed Value explained</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </article>
    </div>
  )
}
