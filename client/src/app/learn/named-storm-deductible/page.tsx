import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Calculator, Info } from 'lucide-react'

export const metadata = {
  title: 'Named Storm Deductible Florida - Hurricane Insurance Explained',
  description: 'Understand named storm deductibles for yacht insurance in Florida. Learn how percentage-based hurricane deductibles work with real examples ($300K yacht × 5% = $15,000 deductible).',
  openGraph: {
    title: 'Named Storm Deductible Florida - Hurricane Insurance Explained',
    description: 'Percentage-based hurricane deductibles explained with real examples',
    type: 'article',
  },
}

export default function NamedStormDeductiblePage() {
  const lastUpdated = 'January 15, 2026'

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Breadcrumbs */}
      <nav className="text-sm text-muted-foreground mb-4">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/yacht-insurance" className="hover:text-foreground">Yacht Insurance</Link>
        <span className="mx-2">/</span>
        <span>Named Storm Deductibles</span>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Named Storm Deductible: Florida Hurricane Insurance Explained</h1>
        <p className="text-xl text-muted-foreground mb-2">
          Understand percentage-based hurricane deductibles and how they affect your out-of-pocket costs
        </p>
        <p className="text-sm text-muted-foreground">
          Last updated: {lastUpdated}
        </p>
      </header>

      {/* Quick Calculator CTA */}
      <Card className="mb-8 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <Calculator className="h-8 w-8 text-blue-600 mb-2" />
          <CardTitle>Calculate Your Exact Deductible</CardTitle>
          <CardDescription>
            Use our free calculator to see your exact hurricane deductible amount
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/tools/named-storm-deductible-calculator?value=300000&deductible=5&standard=1000">
            <Button className="w-full sm:w-auto">Calculate Your Deductible →</Button>
          </Link>
          <p className="text-sm text-muted-foreground mt-2">
            Pre-filled with $300k example • Customize for your yacht
          </p>
        </CardContent>
      </Card>

      {/* Main Content */}
      <article className="prose prose-slate dark:prose-invert max-w-none">

        <section id="what-is-it" className="mb-12">
          <h2 className="text-3xl font-bold mb-4">What Is a Named Storm Deductible?</h2>

          <p className="text-lg mb-4">
            A <strong>named storm deductible</strong> (also called a <em>hurricane deductible</em> or <em>windstorm deductible</em>) is a higher, percentage-based deductible that applies when the National Hurricane Center assigns a name to a tropical storm or hurricane.
          </p>

          <p className="mb-4">
            Unlike your standard flat-dollar deductible (typically $1,000-$5,000), named storm deductibles are calculated as a <strong>percentage of your yacht's insured value</strong>—usually between 2% and 10%.
          </p>

          <div className="bg-yellow-50 dark:bg-yellow-950 border-l-4 border-yellow-500 p-4 mb-6">
            <p className="font-semibold mb-2 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Key Point:
            </p>
            <p>
              For a $300,000 yacht with a 5% named storm deductible, you pay the first <strong>$15,000</strong> of any hurricane damage before insurance kicks in. This can be significantly higher than your standard deductible. <Link href="/tools/named-storm-deductible-calculator?value=300000&deductible=5" className="text-primary hover:underline font-semibold">Calculate yours →</Link>
            </p>
          </div>
        </section>

        <section id="how-it-works" className="mb-12">
          <h2 className="text-3xl font-bold mb-4">How Named Storm Deductibles Work</h2>

          <h3 className="text-2xl font-semibold mb-3">When It's Triggered</h3>
          <p className="mb-4">
            Your named storm deductible applies when <strong>all three</strong> of these conditions are met:
          </p>

          <ol className="list-decimal pl-6 mb-6 space-y-2">
            <li><strong>The National Hurricane Center names the storm:</strong> Tropical Storm Alex, Hurricane Ian, etc.</li>
            <li><strong>Damage occurs during the storm period:</strong> Typically from 12-48 hours before the storm enters your policy's coverage area until 12-48 hours after it exits</li>
            <li><strong>The damage is wind- or water-related:</strong> Hull damage, rigging damage, flooding, etc.</li>
          </ol>

          <h3 className="text-2xl font-semibold mb-3">How the Percentage Works</h3>
          <p className="mb-4">
            The deductible percentage is applied to your yacht's <Link href="/glossary/agreed-value" className="text-primary hover:underline">agreed value</Link> or <Link href="/glossary/actual-cash-value" className="text-primary hover:underline">actual cash value</Link> (depending on your policy type).
          </p>

          <div className="bg-blue-50 dark:bg-blue-950 p-6 rounded-lg mb-6">
            <h4 className="font-semibold mb-3 text-lg">Example Calculation:</h4>
            <div className="space-y-3 font-mono text-sm">
              <div className="grid grid-cols-2 gap-4">
                <span className="text-muted-foreground">Insured Value:</span>
                <span className="font-semibold">$500,000</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <span className="text-muted-foreground">Named Storm Deductible:</span>
                <span className="font-semibold">5%</span>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <span className="text-muted-foreground">Your Deductible Amount:</span>
                <span className="font-bold text-lg">$25,000</span>
              </div>
            </div>
            <div className="mt-4">
              <Link href="/tools/named-storm-deductible-calculator?value=500000&deductible=5&standard=2500" className="text-sm text-primary hover:underline">
                Try this scenario in the calculator →
              </Link>
            </div>
          </div>

          <h3 className="text-2xl font-semibold mb-3">Partial Loss vs Total Loss Scenarios</h3>

          <div className="overflow-x-auto mb-6">
            <table className="min-w-full border-collapse border">
              <thead>
                <tr className="bg-muted">
                  <th className="border p-3 text-left">Scenario</th>
                  <th className="border p-3 text-left">Damage Amount</th>
                  <th className="border p-3 text-left">Your Deductible (5%)</th>
                  <th className="border p-3 text-left">Insurance Pays</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-3">Minor damage</td>
                  <td className="border p-3">$10,000</td>
                  <td className="border p-3">$10,000</td>
                  <td className="border p-3">$0</td>
                </tr>
                <tr className="bg-muted/30">
                  <td className="border p-3">Moderate damage</td>
                  <td className="border p-3">$80,000</td>
                  <td className="border p-3">$25,000</td>
                  <td className="border p-3">$55,000</td>
                </tr>
                <tr>
                  <td className="border p-3">Total loss</td>
                  <td className="border p-3">$500,000</td>
                  <td className="border p-3">$25,000</td>
                  <td className="border p-3">$475,000</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-red-50 dark:bg-red-950 border-l-4 border-red-500 p-4 mb-6">
            <p className="font-semibold mb-2">Important:</p>
            <p>
              If your damage is less than your deductible (like the $10,000 example above), you pay the entire repair cost out of pocket. Insurance only pays once damage exceeds your deductible amount.
            </p>
          </div>
        </section>

        <section id="comparison" className="mb-12">
          <h2 className="text-3xl font-bold mb-4">Named Storm vs Standard Deductible</h2>

          <p className="mb-4">
            Most yacht insurance policies have two separate deductibles:
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-6 not-prose">
            <Card>
              <CardHeader>
                <CardTitle>Standard Deductible</CardTitle>
                <CardDescription>For all other claims</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>✓ Fixed dollar amount ($1,000-$5,000)</li>
                  <li>✓ Applies to: collision, grounding, fire, theft, etc.</li>
                  <li>✓ Predictable and manageable</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Named Storm Deductible</CardTitle>
                <CardDescription>Hurricane/tropical storm only</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>✓ Percentage of insured value (2-10%)</li>
                  <li>✓ Applies to: named tropical storms & hurricanes</li>
                  <li>✓ Can be $10,000-$100,000+ depending on yacht value</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="florida-specifics" className="mb-12">
          <h2 className="text-3xl font-bold mb-4">Why Florida Has Higher Named Storm Deductibles</h2>

          <p className="mb-4">
            Florida yacht insurance policies typically have <strong>higher named storm deductibles</strong> (often 5-10%) compared to other regions for several reasons:
          </p>

          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li><strong>Hurricane frequency:</strong> Florida averages 1-2 hurricane impacts per year</li>
            <li><strong>High repair costs:</strong> Catastrophic events create supply shortages and price spikes</li>
            <li><strong>Reinsurance costs:</strong> Insurers pay more to reinsure Florida hurricane risk</li>
            <li><strong>Regulatory environment:</strong> Florida's insurance market has experienced instability, leading to conservative underwriting</li>
          </ul>

          <p className="mb-4">
            Some insurers even require <strong>separate hurricane coverage</strong> or <strong>exclude named storm damage</strong> entirely for vessels kept in certain Florida waters during hurricane season (June 1 - November 30).
          </p>
        </section>

        <section id="what-to-know" className="mb-12">
          <h2 className="text-3xl font-bold mb-4">What You Need to Know Before Hurricane Season</h2>

          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold mb-2">1. Know Your Exact Deductible Amount</h3>
              <p>
                Don't wait until a storm is approaching. Use our <Link href="/tools/named-storm-deductible-calculator" className="text-primary hover:underline">Named Storm Deductible Calculator</Link> to calculate your exact dollar exposure and plan accordingly.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">2. Review Your Navigation Limits</h3>
              <p>
                Your policy may have <Link href="/learn/navigation-limits-and-layup-warranty" className="text-primary hover:underline">navigation limits</Link> or <em>named storm warranties</em> that require you to move your yacht out of high-risk areas when a storm is forecast.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">3. Plan Your Cash Reserves</h3>
              <p>
                If you have a $25,000 deductible, ensure you have liquid funds available. Some marinas and boatyards require upfront payment for haul-outs and emergency repairs.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">4. Document Pre-Storm Condition</h3>
              <p>
                Take dated photos and video of your yacht before hurricane season. This documentation helps establish pre-existing damage vs storm damage during claims.
              </p>
            </div>
          </div>
        </section>

        <section id="faqs" className="mb-12">
          <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Does a tropical storm count, or only hurricanes?</h3>
              <p>
                Yes, <strong>tropical storms count</strong>. The named storm deductible applies to any system that the National Hurricane Center assigns a name to, regardless of whether it reaches hurricane strength. Tropical Storm Eta still triggers your named storm deductible even though it never became Hurricane Eta.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Can I lower my named storm deductible?</h3>
              <p>
                Some insurers offer lower deductible options (e.g., 2% instead of 5%), but expect to pay <strong>significantly higher premiums</strong>. In high-risk areas like South Florida, lower deductibles may not be available at all.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">What if my yacht is damaged by wind but the storm isn't named?</h3>
              <p>
                If the windstorm was <strong>not</strong> a named tropical system, your <strong>standard deductible</strong> applies. For example, a severe thunderstorm or microburst would trigger your regular $2,500 deductible, not your 5% named storm deductible.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">How long does the named storm period last?</h3>
              <p>
                Most policies define the "named storm period" as starting 12-48 hours before the storm enters your coverage area and ending 12-48 hours after it exits. Check your policy declarations for the exact window—this varies by insurer.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Can I avoid the deductible by moving my yacht?</h3>
              <p>
                If you successfully evacuate your yacht to a location <strong>outside the storm's forecast path</strong> and it sustains no damage, you avoid the deductible entirely. However, if you move the yacht but it's still damaged, the named storm deductible applies based on where the damage occurred.
              </p>
            </div>
          </div>
        </section>

      </article>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-8 mt-12">
        <h2 className="text-2xl font-bold mb-4">Calculate Your Hurricane Deductible</h2>
        <p className="mb-6">
          See your exact out-of-pocket cost for hurricane damage with our free calculator
        </p>
        <Link href="/tools/named-storm-deductible-calculator">
          <Button size="lg" variant="secondary">Use Calculator →</Button>
        </Link>
      </section>

      {/* Related Pages */}
      <section className="mt-12 pt-8 border-t">
        <h2 className="text-2xl font-bold mb-6">Related Resources</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Link href="/learn/agreed-value-vs-acv">
            <Card className="hover:border-primary transition-colors h-full">
              <CardHeader>
                <CardTitle className="text-lg">Agreed Value vs ACV</CardTitle>
                <CardDescription>Understand how your yacht is valued for total loss payouts</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/learn/navigation-limits-and-layup-warranty">
            <Card className="hover:border-primary transition-colors h-full">
              <CardHeader>
                <CardTitle className="text-lg">Navigation Limits</CardTitle>
                <CardDescription>Geographic restrictions and seasonal warranties explained</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/glossary">
            <Card className="hover:border-primary transition-colors h-full">
              <CardHeader>
                <CardTitle className="text-lg">Insurance Glossary</CardTitle>
                <CardDescription>Key yacht insurance terms defined</CardDescription>
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
                "name": "Does a tropical storm count, or only hurricanes?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, tropical storms count. The named storm deductible applies to any system that the National Hurricane Center assigns a name to, regardless of whether it reaches hurricane strength."
                }
              },
              {
                "@type": "Question",
                "name": "Can I lower my named storm deductible?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Some insurers offer lower deductible options (e.g., 2% instead of 5%), but expect to pay significantly higher premiums. In high-risk areas like South Florida, lower deductibles may not be available at all."
                }
              },
              {
                "@type": "Question",
                "name": "What if my yacht is damaged by wind but the storm isn't named?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "If the windstorm was not a named tropical system, your standard deductible applies. For example, a severe thunderstorm would trigger your regular deductible, not your named storm deductible."
                }
              },
              {
                "@type": "Question",
                "name": "How long does the named storm period last?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Most policies define the named storm period as starting 12-48 hours before the storm enters your coverage area and ending 12-48 hours after it exits. Check your policy for exact timing."
                }
              }
            ]
          })
        }}
      />
    </div>
  )
}
