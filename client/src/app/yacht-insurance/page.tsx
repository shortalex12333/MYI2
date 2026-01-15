import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Anchor, Shield, AlertTriangle, Users } from 'lucide-react'

export const metadata = {
  title: 'Yacht Insurance Guide - Coverage, Costs & What You Need to Know',
  description: 'Comprehensive guide to yacht insurance including hull & machinery, P&I liability, agreed value vs ACV, and what changes for charter/commercial use.',
  openGraph: {
    title: 'Yacht Insurance Guide - Coverage, Costs & What You Need to Know',
    description: 'Learn about yacht insurance coverage types, policy structures, and what to ask your broker before buying.',
    type: 'article',
  },
}

export default function YachtInsurancePage() {
  const lastUpdated = 'January 15, 2026'

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Breadcrumbs */}
      <nav className="text-sm text-muted-foreground mb-4">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span className="mx-2">/</span>
        <span>Yacht Insurance</span>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Yacht Insurance: A Comprehensive Guide</h1>
        <p className="text-xl text-muted-foreground mb-2">
          Understanding hull coverage, liability protection, and policy structures for yacht owners
        </p>
        <p className="text-sm text-muted-foreground">
          Last updated: {lastUpdated}
        </p>
      </header>

      {/* Quick Navigation */}
      <Card className="mb-8 bg-blue-50 dark:bg-blue-950">
        <CardHeader>
          <CardTitle className="text-lg">Quick Navigation</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid md:grid-cols-2 gap-2 text-sm">
            <li><a href="#what-includes" className="text-primary hover:underline">What Yacht Insurance Includes</a></li>
            <li><a href="#hull-machinery" className="text-primary hover:underline">Hull & Machinery Coverage</a></li>
            <li><a href="#protection-indemnity" className="text-primary hover:underline">Protection & Indemnity (Liability)</a></li>
            <li><a href="#charter-commercial" className="text-primary hover:underline">Charter & Commercial Use</a></li>
            <li><a href="#florida-storms" className="text-primary hover:underline">Florida Named Storm Deductibles</a></li>
            <li><a href="#faqs" className="text-primary hover:underline">Frequently Asked Questions</a></li>
          </ul>
        </CardContent>
      </Card>

      {/* Main Content */}
      <article className="prose prose-slate dark:prose-invert max-w-none">

        <section id="what-includes" className="mb-12">
          <h2 className="text-3xl font-bold mb-4">What Yacht Insurance Usually Includes</h2>

          <p className="text-lg mb-4">
            Yacht insurance policies typically consist of two main components working together to protect your vessel and your financial interests:
          </p>

          <div className="grid md:grid-cols-2 gap-6 not-prose mb-6">
            <Card>
              <CardHeader>
                <Anchor className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Hull & Machinery (H&M)</CardTitle>
                <CardDescription>Physical damage to your yacht</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Collision and sinking damage</li>
                  <li>Fire and explosion</li>
                  <li>Theft and vandalism</li>
                  <li>Weather-related damage</li>
                  <li>Machinery breakdown (depending on policy)</li>
                </ul>
                <Link href="/hull-and-machinery-insurance" className="inline-block mt-4">
                  <Button variant="link" className="px-0">Learn more about H&M coverage →</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Protection & Indemnity (P&I)</CardTitle>
                <CardDescription>Liability for injury and damage to others</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Bodily injury to passengers or crew</li>
                  <li>Property damage to other vessels or docks</li>
                  <li>Environmental pollution cleanup</li>
                  <li>Wreck removal costs</li>
                  <li>Legal defense expenses</li>
                </ul>
                <Link href="/protection-and-indemnity-pi" className="inline-block mt-4">
                  <Button variant="link" className="px-0">Learn more about P&I coverage →</Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-950 border-l-4 border-yellow-500 p-4 mb-6">
            <p className="font-semibold mb-2">Key Point:</p>
            <p>
              Your policy's <Link href="/glossary/agreed-value" className="text-primary hover:underline font-medium">agreed value</Link> or{' '}
              <Link href="/glossary/actual-cash-value" className="text-primary hover:underline font-medium">actual cash value (ACV)</Link> basis determines how much you'll receive if your yacht is declared a total loss. This difference can be significant.
            </p>
          </div>

          <p>
            <Link href="/agreed-value-vs-actual-cash-value" className="text-primary hover:underline font-medium">
              Read our complete guide: Agreed Value vs Actual Cash Value →
            </Link>
          </p>
        </section>

        <section id="charter-commercial" className="mb-12">
          <h2 className="text-3xl font-bold mb-4">What Changes for Charter and Commercial Use</h2>

          <p className="mb-4">
            Most personal yacht insurance policies <strong>exclude coverage when the vessel is used for charter or commercial purposes</strong>. If you plan to charter your yacht, even occasionally, you typically need:
          </p>

          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>Charter endorsement:</strong> An add-on to your personal policy allowing limited charter use</li>
            <li><strong>Commercial yacht insurance:</strong> A separate policy designed for full-time charter operations</li>
            <li><strong>Increased liability limits:</strong> Charter operations usually require higher P&I coverage</li>
            <li><strong>Crew coverage considerations:</strong> Professional crew may need specific <Link href="/yacht-crew-insurance-crew-medical-jones-act" className="text-primary hover:underline">crew medical and Jones Act protection</Link></li>
          </ul>

          <div className="bg-red-50 dark:bg-red-950 border-l-4 border-red-500 p-4 mb-6">
            <p className="font-semibold mb-2">Critical Warning:</p>
            <p>
              Operating your yacht for charter without the proper endorsement or commercial policy can void your coverage entirely, leaving you personally liable for any incidents. Always notify your broker before accepting charter bookings.
            </p>
          </div>

          <p>
            <Link href="/charter-yacht-insurance-commercial" className="text-primary hover:underline font-medium">
              Read our guide: Charter Yacht Insurance & Commercial Policies →
            </Link>
          </p>
        </section>

        <section id="florida-storms" className="mb-12">
          <h2 className="text-3xl font-bold mb-4">Florida Named Storm Deductibles (High-Level Overview)</h2>

          <p className="mb-4">
            If your yacht is based in or frequently visits Florida, understanding <Link href="/glossary/named-storm-deductible" className="text-primary hover:underline">named storm deductibles</Link> is essential. Unlike your standard deductible (typically $1,000-$5,000 flat amount), named storm deductibles are usually:
          </p>

          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>Percentage-based:</strong> Typically 2-10% of your insured value</li>
            <li><strong>Triggered by named storms:</strong> Applies when the National Hurricane Center issues a storm name</li>
            <li><strong>Significantly higher than standard deductibles:</strong> A 5% deductible on a $500,000 yacht means a $25,000 out-of-pocket cost</li>
          </ul>

          <div className="bg-blue-50 dark:bg-blue-950 p-6 rounded-lg mb-6">
            <h3 className="font-semibold mb-3">Example Scenario:</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Insured value:</strong> $500,000</p>
              <p><strong>Named storm deductible:</strong> 5%</p>
              <p><strong>Your deductible amount:</strong> $25,000</p>
              <p className="pt-2 border-t">
                If Hurricane Ian damages your yacht requiring $100,000 in repairs, you would pay the first $25,000, and insurance would cover the remaining $75,000.
              </p>
            </div>
          </div>

          <p className="mb-4">
            <Link href="/named-storm-deductible-florida" className="text-primary hover:underline font-medium">
              Read our complete guide: Named Storm Deductibles in Florida →
            </Link>
          </p>

          <p>
            Or use our <Link href="/tools/named-storm-deductible-calculator" className="text-primary hover:underline font-medium">Named Storm Deductible Calculator</Link> to see what your deductible would be.
          </p>
        </section>

        <section id="faqs" className="mb-12">
          <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">What's the difference between agreed value and actual cash value?</h3>
              <p>
                <Link href="/glossary/agreed-value" className="text-primary hover:underline">Agreed value</Link> means you and your insurer agree on your yacht's value when you buy the policy. If it's totaled, you receive that amount (minus deductible). <Link href="/glossary/actual-cash-value" className="text-primary hover:underline">Actual cash value (ACV)</Link> pays the depreciated value at the time of loss, which can be significantly less. Most yacht owners prefer agreed value policies.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Do I need yacht insurance if I have a boat loan?</h3>
              <p>
                Yes. Nearly all marine lenders require hull and machinery coverage (usually on an agreed value basis) and minimum liability limits as a condition of the loan. Even after your yacht is paid off, insurance protects you from catastrophic financial loss.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">What are navigation limits and why do they matter?</h3>
              <p>
                <Link href="/glossary/navigation-limits" className="text-primary hover:underline">Navigation limits</Link> define the geographic area where your policy provides coverage. Operating outside these limits without notifying your insurer can void your coverage. Learn more in our guide: <Link href="/navigation-limits-and-lay-up-warranty" className="text-primary hover:underline">Navigation Limits and Lay-Up Warranty</Link>.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Does my yacht insurance cover my crew?</h3>
              <p>
                It depends. Personal yacht policies may have limited crew coverage. If you have professional crew, you'll likely need specific <Link href="/yacht-crew-insurance-crew-medical-jones-act" className="text-primary hover:underline">crew medical insurance and Jones Act coverage</Link>. Always discuss crew situations with your broker.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">How much does yacht insurance cost?</h3>
              <p>
                Yacht insurance premiums typically range from 0.75% to 2% of your yacht's insured value annually, but this varies widely based on vessel type, age, value, cruising area, claims history, and coverage limits. A $500,000 yacht might cost $3,750-$10,000 per year to insure.
              </p>
            </div>
          </div>
        </section>

      </article>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-8 mt-12">
        <h2 className="text-2xl font-bold mb-4">Ready to Get a Yacht Insurance Quote?</h2>
        <p className="mb-6">
          Connect with experienced yacht insurance brokers who can help you find the right coverage for your vessel and cruising style.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link href="/signup">
            <Button size="lg" variant="secondary">Get Quote</Button>
          </Link>
          <Link href="/contact">
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
              Contact a Broker
            </Button>
          </Link>
        </div>
      </section>

      {/* Related Pages */}
      <section className="mt-12 pt-8 border-t">
        <h2 className="text-2xl font-bold mb-6">Related Resources</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Link href="/agreed-value-vs-actual-cash-value">
            <Card className="hover:border-primary transition-colors h-full">
              <CardHeader>
                <CardTitle className="text-lg">Agreed Value vs ACV</CardTitle>
                <CardDescription>Understand the critical difference in total loss payouts</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/hull-and-machinery-insurance">
            <Card className="hover:border-primary transition-colors h-full">
              <CardHeader>
                <CardTitle className="text-lg">Hull & Machinery</CardTitle>
                <CardDescription>What H&M coverage includes and excludes</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/protection-and-indemnity-pi">
            <Card className="hover:border-primary transition-colors h-full">
              <CardHeader>
                <CardTitle className="text-lg">P&I Liability</CardTitle>
                <CardDescription>Liability exposures every yacht owner should understand</CardDescription>
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
                "name": "What's the difference between agreed value and actual cash value?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Agreed value means you and your insurer agree on your yacht's value when you buy the policy. If it's totaled, you receive that amount (minus deductible). Actual cash value (ACV) pays the depreciated value at the time of loss, which can be significantly less. Most yacht owners prefer agreed value policies."
                }
              },
              {
                "@type": "Question",
                "name": "Do I need yacht insurance if I have a boat loan?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes. Nearly all marine lenders require hull and machinery coverage (usually on an agreed value basis) and minimum liability limits as a condition of the loan."
                }
              },
              {
                "@type": "Question",
                "name": "What are navigation limits and why do they matter?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Navigation limits define the geographic area where your policy provides coverage. Operating outside these limits without notifying your insurer can void your coverage."
                }
              }
            ]
          })
        }}
      />
    </div>
  )
}
