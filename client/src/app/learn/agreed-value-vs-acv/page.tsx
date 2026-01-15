import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, X, AlertTriangle, TrendingDown } from 'lucide-react'

export const metadata = {
  title: 'Agreed Value vs Actual Cash Value (ACV) - Yacht Insurance Comparison',
  description: 'Compare agreed value and actual cash value yacht insurance policies. Understand total loss payouts, depreciation, and which policy type protects you better with real examples.',
  openGraph: {
    title: 'Agreed Value vs ACV - Yacht Insurance Policy Comparison',
    description: 'Understand the critical difference in how your yacht is valued and how much you receive after a total loss',
    type: 'article',
  },
}

export default function AgreedValueVsACVPage() {
  const lastUpdated = 'January 15, 2026'

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Breadcrumbs */}
      <nav className="text-sm text-muted-foreground mb-4">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/yacht-insurance" className="hover:text-foreground">Yacht Insurance</Link>
        <span className="mx-2">/</span>
        <span>Agreed Value vs ACV</span>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Agreed Value vs Actual Cash Value (ACV): Which Yacht Insurance is Better?</h1>
        <p className="text-xl text-muted-foreground mb-2">
          Understand the critical difference in total loss payouts and how depreciation affects your coverage
        </p>
        <p className="text-sm text-muted-foreground">
          Last updated: {lastUpdated}
        </p>
      </header>

      {/* Main Content */}
      <article className="prose prose-slate dark:prose-invert max-w-none">

        <section id="overview" className="mb-12">
          <h2 className="text-3xl font-bold mb-4">The Core Difference</h2>

          <p className="text-lg mb-4">
            When your yacht is declared a total loss, how much does your insurance company pay you? The answer depends entirely on whether your policy uses <strong>agreed value</strong> or <strong>actual cash value (ACV)</strong>.
          </p>

          <div className="bg-yellow-50 dark:bg-yellow-950 border-l-4 border-yellow-500 p-4 mb-6">
            <p className="font-semibold mb-2 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Bottom Line:
            </p>
            <p>
              With <strong>agreed value</strong>, you and your insurer agree upfront on your yacht's worth. With <strong>ACV</strong>, they pay the depreciated value at the time of loss—which can be 20-40% less than what you paid or owe.
            </p>
          </div>
        </section>

        <section id="comparison-table" className="mb-12">
          <h2 className="text-3xl font-bold mb-4">Side-by-Side Comparison</h2>

          <div className="overflow-x-auto mb-6 not-prose">
            <table className="min-w-full border-collapse border">
              <thead>
                <tr className="bg-muted">
                  <th className="border p-3 text-left">Factor</th>
                  <th className="border p-3 text-left">Agreed Value</th>
                  <th className="border p-3 text-left">Actual Cash Value (ACV)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-3 font-semibold">How it works</td>
                  <td className="border p-3">You and insurer agree on value when policy starts</td>
                  <td className="border p-3">Insurer determines depreciated value at time of loss</td>
                </tr>
                <tr className="bg-muted/30">
                  <td className="border p-3 font-semibold">Total loss payout</td>
                  <td className="border p-3 text-green-600">✓ Full agreed amount (minus deductible)</td>
                  <td className="border p-3 text-red-600">✗ Market value minus depreciation</td>
                </tr>
                <tr>
                  <td className="border p-3 font-semibold">Predictability</td>
                  <td className="border p-3 text-green-600">✓ You know exactly what you'll receive</td>
                  <td className="border p-3 text-red-600">✗ Payout uncertain until claim</td>
                </tr>
                <tr className="bg-muted/30">
                  <td className="border p-3 font-semibold">Depreciation</td>
                  <td className="border p-3 text-green-600">✓ None - value locked in</td>
                  <td className="border p-3 text-red-600">✗ Yes - reduces payout every year</td>
                </tr>
                <tr>
                  <td className="border p-3 font-semibold">Premium cost</td>
                  <td className="border p-3 text-red-600">✗ Higher (~10-20% more)</td>
                  <td className="border p-3 text-green-600">✓ Lower</td>
                </tr>
                <tr className="bg-muted/30">
                  <td className="border p-3 font-semibold">Financed yachts</td>
                  <td className="border p-3 text-green-600">✓ Lender usually requires this</td>
                  <td className="border p-3 text-red-600">✗ Often insufficient to cover loan</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="real-example" className="mb-12">
          <h2 className="text-3xl font-bold mb-4">Real-World Example: Total Loss After 3 Years</h2>

          <p className="mb-4">
            You purchased a yacht 3 years ago for <strong>$500,000</strong>. A hurricane sinks it. Here's what each policy type pays:
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-6 not-prose">
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader>
                <Check className="h-8 w-8 text-green-600 mb-2" />
                <CardTitle>Agreed Value Policy</CardTitle>
                <CardDescription>$500,000 agreed value set 3 years ago</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-muted-foreground">Agreed value:</span>
                    <span className="font-semibold">$500,000</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-muted-foreground">Deductible (5%):</span>
                    <span className="font-semibold">-$25,000</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                    <span className="text-muted-foreground font-bold">You receive:</span>
                    <span className="font-bold text-green-600 text-xl">$475,000</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  ✓ Enough to buy equivalent replacement yacht
                </p>
              </CardContent>
            </Card>

            <Card className="border-red-200 dark:border-red-800">
              <CardHeader>
                <X className="h-8 w-8 text-red-600 mb-2" />
                <CardTitle>Actual Cash Value Policy</CardTitle>
                <CardDescription>Market value depreciated 30% over 3 years</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-muted-foreground">Original value:</span>
                    <span className="font-semibold">$500,000</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-muted-foreground">Depreciation (30%):</span>
                    <span className="font-semibold">-$150,000</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-muted-foreground">ACV:</span>
                    <span className="font-semibold">$350,000</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-muted-foreground">Deductible (5% of ACV):</span>
                    <span className="font-semibold">-$17,500</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                    <span className="text-muted-foreground font-bold">You receive:</span>
                    <span className="font-bold text-red-600 text-xl">$332,500</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  ✗ $142,500 less than agreed value policy
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-red-50 dark:bg-red-950 border-l-4 border-red-500 p-4 mb-6">
            <p className="font-semibold mb-2">Financing Impact:</p>
            <p>
              If you still owe $400,000 on your yacht loan, the ACV policy leaves you <strong>$67,500 short</strong> ($400,000 loan - $332,500 payout). You're responsible for paying the lender the difference—and you no longer have a yacht.
            </p>
          </div>
        </section>

        <section id="when-to-use" className="mb-12">
          <h2 className="text-3xl font-bold mb-4">Which Should You Choose?</h2>

          <h3 className="text-2xl font-semibold mb-3 text-green-600">Choose Agreed Value If:</h3>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li><strong>You have a loan:</strong> Nearly all marine lenders <em>require</em> agreed value coverage to protect their collateral</li>
            <li><strong>Your yacht is newer (less than 10 years old):</strong> Depreciation hasn't significantly reduced value yet</li>
            <li><strong>You want certainty:</strong> You'll know exactly what you'll receive in a total loss</li>
            <li><strong>You've made significant upgrades:</strong> Electronics, rigging, engines—agreed value captures these improvements</li>
            <li><strong>You couldn't afford to absorb a loss:</strong> The premium difference (10-20%) is worth the peace of mind</li>
          </ul>

          <h3 className="text-2xl font-semibold mb-3 text-blue-600">Consider ACV If:</h3>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li><strong>Your yacht is older (15+ years):</strong> Depreciation has already occurred; less difference between ACV and market value</li>
            <li><strong>It's fully paid off:</strong> No lender requirement for agreed value</li>
            <li><strong>You have cash reserves:</strong> You can handle a lower payout and aren't relying on insurance to replace the yacht</li>
            <li><strong>Premium savings matter more:</strong> You're prioritizing lower annual costs</li>
          </ul>

          <div className="bg-blue-50 dark:bg-blue-950 p-6 rounded-lg mb-6">
            <h4 className="font-semibold mb-3">Industry Standard:</h4>
            <p>
              <strong>Most yacht owners choose agreed value.</strong> According to marine insurance brokers, approximately 85% of yacht policies under $2 million are written on an agreed value basis, especially for yachts less than 20 years old.
            </p>
          </div>
        </section>

        <section id="how-agreed-value-set" className="mb-12">
          <h2 className="text-3xl font-bold mb-4">How Is Agreed Value Determined?</h2>

          <p className="mb-4">
            When you apply for agreed value coverage, the insurer evaluates:
          </p>

          <ol className="list-decimal pl-6 mb-6 space-y-2">
            <li><strong>Purchase price:</strong> What you paid (if recent)</li>
            <li><strong>Marine survey:</strong> A professional surveyor's appraisal (often required for yachts over $100K)</li>
            <li><strong>Comparable sales:</strong> Similar yachts sold recently</li>
            <li><strong>Condition and upgrades:</strong> Maintenance records, recent refits, equipment additions</li>
            <li><strong>Year, make, model:</strong> Standard valuation guides (BUC, NADA)</li>
          </ol>

          <p className="mb-4">
            The insurer may adjust your requested value up or down based on these factors. Once agreed upon, this value is locked in for the policy term (usually 1 year).
          </p>

          <div className="bg-yellow-50 dark:bg-yellow-950 border-l-4 border-yellow-500 p-4 mb-6">
            <p className="font-semibold mb-2">Annual Review:</p>
            <p>
              At each renewal, you can adjust the agreed value. If you've added $50K in new electronics or engines, increase the value. If the market has declined, you might reduce it to lower your premium.
            </p>
          </div>
        </section>

        <section id="partial-losses" className="mb-12">
          <h2 className="text-3xl font-bold mb-4">What About Partial Losses?</h2>

          <p className="mb-4">
            For <strong>partial damage</strong> (repairable claims), both agreed value and ACV policies work the same way:
          </p>

          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Insurance pays <strong>actual repair costs</strong> minus your deductible</li>
            <li>You don't receive a depreciated payout for parts or labor</li>
            <li>Example: $30,000 in storm damage is covered for $30,000 (minus deductible), regardless of policy type</li>
          </ul>

          <p className="mb-4">
            The difference <strong>only matters in total loss scenarios</strong>, where the yacht is deemed unrepairable or repair costs exceed ~75-80% of the insured value.
          </p>
        </section>

        <section id="faqs" className="mb-12">
          <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Can I switch from ACV to agreed value mid-year?</h3>
              <p>
                Typically, no. You'll need to wait until your policy renewal. However, if you recently purchased the yacht or completed major upgrades, some insurers allow mid-term endorsements. Contact your broker to discuss options.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">What if I disagree with the insurer's agreed value offer?</h3>
              <p>
                Provide additional documentation: a recent marine survey, comparable sales listings, or upgrade receipts. If the insurer won't budge and you believe your yacht is worth more, you can seek coverage from a different carrier or accept a lower agreed value to reduce premium.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Do I get the full agreed value even if the yacht wasn't worth that much?</h3>
              <p>
                Yes—that's the point of agreed value. If you and the insurer agreed on $500,000, but the yacht's true market value was only $450,000, you still receive $500,000 (minus deductible) in a total loss. However, insurers verify value at policy inception to prevent over-insuring.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">How much more expensive is agreed value coverage?</h3>
              <p>
                Premiums for agreed value policies are typically <strong>10-20% higher</strong> than equivalent ACV policies. For a yacht with a $5,000 annual premium, you might pay $5,500-$6,000 for agreed value. Most yacht owners consider this a worthwhile investment.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Can I over-insure my yacht with agreed value?</h3>
              <p>
                No. Insurers cap agreed value at fair market value based on surveys and comparables. You can't insure a $300,000 yacht for $500,000 just to profit from a total loss. This is considered insurance fraud and voids your policy.
              </p>
            </div>
          </div>
        </section>

      </article>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-8 mt-12">
        <h2 className="text-2xl font-bold mb-4">Ready to Review Your Coverage?</h2>
        <p className="mb-6">
          Use our guides and tools to understand your policy and make informed decisions
        </p>
        <div className="flex flex-wrap gap-4">
          <Link href="/yacht-insurance">
            <Button size="lg" variant="secondary">Read Full Yacht Insurance Guide</Button>
          </Link>
          <Link href="/tools/named-storm-deductible-calculator?value=500000&deductible=5&standard=2500&premium=4500">
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
              Calculate Deductibles
            </Button>
          </Link>
        </div>
      </section>

      {/* Related Pages */}
      <section className="mt-12 pt-8 border-t">
        <h2 className="text-2xl font-bold mb-6">Related Resources</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Link href="/learn/named-storm-deductible">
            <Card className="hover:border-primary transition-colors h-full">
              <CardHeader>
                <CardTitle className="text-lg">Named Storm Deductibles</CardTitle>
                <CardDescription>Understand percentage-based hurricane deductibles</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/yacht-insurance">
            <Card className="hover:border-primary transition-colors h-full">
              <CardHeader>
                <CardTitle className="text-lg">Yacht Insurance Overview</CardTitle>
                <CardDescription>Complete guide to coverage types</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/glossary">
            <Card className="hover:border-primary transition-colors h-full">
              <CardHeader>
                <CardTitle className="text-lg">Insurance Glossary</CardTitle>
                <CardDescription>Key terms explained</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </section>

      {/* Schema.org FAQPage markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "Can I switch from ACV to agreed value mid-year?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Typically, no. You'll need to wait until your policy renewal. However, if you recently purchased the yacht or completed major upgrades, some insurers allow mid-term endorsements."
                }
              },
              {
                "@type": "Question",
                "name": "How much more expensive is agreed value coverage?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Premiums for agreed value policies are typically 10-20% higher than equivalent ACV policies. For a yacht with a $5,000 annual premium, you might pay $5,500-$6,000 for agreed value."
                }
              },
              {
                "@type": "Question",
                "name": "Do I get the full agreed value even if the yacht wasn't worth that much?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes—that's the point of agreed value. If you and the insurer agreed on $500,000, you receive $500,000 (minus deductible) in a total loss. However, insurers verify value at policy inception to prevent over-insuring."
                }
              }
            ]
          })
        }}
      />
    </div>
  )
}
