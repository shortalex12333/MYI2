import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Map, Calendar, Anchor } from 'lucide-react'

export const metadata = {
  title: 'Navigation Limits and Lay-Up Warranty - Yacht Insurance Geographic Restrictions',
  description: 'Understand navigation limits, cruising warranties, and seasonal lay-up periods in yacht insurance. Learn how geographic restrictions affect coverage and what happens if you violate them.',
  openGraph: {
    title: 'Navigation Limits and Lay-Up Warranty Explained',
    description: 'Geographic coverage restrictions and seasonal requirements for yacht insurance policies',
    type: 'article',
  },
}

export default function NavigationLimitsPage() {
  const lastUpdated = 'January 15, 2026'

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Breadcrumbs */}
      <nav className="text-sm text-muted-foreground mb-4">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/yacht-insurance" className="hover:text-foreground">Yacht Insurance</Link>
        <span className="mx-2">/</span>
        <span>Navigation Limits</span>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Navigation Limits and Lay-Up Warranty: Geographic Coverage Explained</h1>
        <p className="text-xl text-muted-foreground mb-2">
          Understand where your yacht insurance covers you and what happens if you cruise outside your policy's boundaries
        </p>
        <p className="text-sm text-muted-foreground">
          Last updated: {lastUpdated}
        </p>
      </header>

      {/* Alert */}
      <Card className="mb-8 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
        <CardHeader>
          <AlertTriangle className="h-8 w-8 text-red-600 mb-2" />
          <CardTitle className="text-red-600 dark:text-red-400">Critical Warning</CardTitle>
          <CardDescription>
            Operating your yacht outside your navigation limits without notifying your insurer can <strong>void your coverage entirely</strong>, leaving you personally liable for all damages and losses.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <article className="prose prose-slate dark:prose-invert max-w-none">

        <section id="what-are-navigation-limits" className="mb-12">
          <h2 className="text-3xl font-bold mb-4">What Are Navigation Limits?</h2>

          <p className="text-lg mb-4">
            <strong>Navigation limits</strong> (also called <em>cruising limits</em> or <em>navigational warranties</em>) define the <strong>geographic area</strong> where your yacht insurance policy provides coverage.
          </p>

          <p className="mb-4">
            Think of them as invisible boundaries on a map. If your yacht is damaged or causes damage while operating <strong>inside</strong> these limits, you're covered. Outside the limits? You're on your own—unless you obtained prior permission from your insurer.
          </p>

          <div className="bg-blue-50 dark:bg-blue-950 p-6 rounded-lg mb-6">
            <h3 className="font-semibold mb-3 text-lg">Example Navigation Limits:</h3>
            <ul className="space-y-2 text-sm">
              <li><strong>East Coast USA:</strong> "Atlantic coastal waters from Maine to Florida, including the Bahamas"</li>
              <li><strong>Gulf of Mexico:</strong> "U.S. Gulf Coast waters from Texas to Florida, not including Cuba or Mexico"</li>
              <li><strong>Great Lakes:</strong> "All five Great Lakes and connecting waterways"</li>
              <li><strong>Caribbean:</strong> "U.S. and British Virgin Islands, Puerto Rico, and Lesser Antilles south to Grenada"</li>
            </ul>
          </div>

          <p className="mb-4">
            Your policy declarations page states your specific navigation limits. They're not suggestions—they're <strong>contractual boundaries</strong>.
          </p>
        </section>

        <section id="how-they-work" className="mb-12">
          <h2 className="text-3xl font-bold mb-4">How Navigation Limits Work</h2>

          <h3 className="text-2xl font-semibold mb-3">Standard Coverage Areas</h3>
          <p className="mb-4">
            Most yacht insurance policies default to one of these geographic zones:
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-6 not-prose">
            <Card>
              <CardHeader>
                <Map className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Coastal Waters (Most Common)</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="mb-3">Covers inland and nearshore waters within 50-75 miles of the coast.</p>
                <p className="text-muted-foreground">
                  <strong>Typical use:</strong> Weekend cruising, island hopping, coastal passages
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Anchor className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Offshore / Blue Water</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="mb-3">Extends coverage to open ocean passages and distant cruising grounds.</p>
                <p className="text-muted-foreground">
                  <strong>Typical use:</strong> Ocean crossings, circumnavigations, extended cruising
                </p>
              </CardContent>
            </Card>
          </div>

          <h3 className="text-2xl font-semibold mb-3">Seasonal Restrictions</h3>
          <p className="mb-4">
            Some areas have <strong>seasonal limitations</strong>. Common examples:
          </p>

          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li><strong>Caribbean during hurricane season:</strong> Coverage may be restricted or require the yacht to be hauled out June 1 - November 30</li>
            <li><strong>Northern waters in winter:</strong> Great Lakes policies often require haul-out by November 15</li>
            <li><strong>High-risk zones:</strong> Some insurers exclude coverage in certain areas during specific months (e.g., Bahamas in September)</li>
          </ul>

          <div className="bg-yellow-50 dark:bg-yellow-950 border-l-4 border-yellow-500 p-4 mb-6">
            <p className="font-semibold mb-2">Check Before You Cruise:</p>
            <p>
              If you're planning a passage outside your normal cruising area (e.g., from Florida to the Bahamas, or a trip to Mexico), contact your broker <strong>at least 2 weeks in advance</strong> to request a coverage extension or endorsement.
            </p>
          </div>
        </section>

        <section id="lay-up-warranty" className="mb-12">
          <h2 className="text-3xl font-bold mb-4">What Is a Lay-Up Warranty?</h2>

          <p className="text-lg mb-4">
            A <strong>lay-up warranty</strong> (or <em>haul-out warranty</em>) is a policy requirement that your yacht must be removed from the water and stored ashore during specific months.
          </p>

          <p className="mb-4">
            This is common for yachts kept in regions with harsh winter weather, hurricanes, or ice. The insurer reduces risk (and often your premium) by requiring the yacht to be on land when conditions are most dangerous.
          </p>

          <h3 className="text-2xl font-semibold mb-3">Common Lay-Up Periods</h3>

          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li><strong>Great Lakes:</strong> November 15 - April 15 (ice and freezing)</li>
            <li><strong>Northeast U.S.:</strong> December 1 - March 31 (winter storms)</li>
            <li><strong>Hurricane-prone areas:</strong> Some policies require haul-out during peak hurricane months (August - October)</li>
          </ul>

          <div className="bg-red-50 dark:bg-red-950 border-l-4 border-red-500 p-4 mb-6">
            <p className="font-semibold mb-2">Violation = No Coverage:</p>
            <p>
              If your policy requires haul-out by November 15 and your yacht sinks on November 20 while still in the water, your claim will likely be <strong>denied entirely</strong>. The insurer will cite breach of warranty, voiding coverage.
            </p>
          </div>

          <h3 className="text-2xl font-semibold mb-3">Year-Round Coverage Options</h3>
          <p className="mb-4">
            If you want to keep your yacht in the water year-round, you can often:
          </p>

          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li><strong>Request a waiver:</strong> Some insurers allow lay-up waivers for an additional premium (typically 10-25% more)</li>
            <li><strong>Switch to a marina with heated docks:</strong> Heated slips in northern waters may satisfy lay-up requirements</li>
            <li><strong>Move the yacht south:</strong> Relocate to Florida or the Caribbean for winter (within navigation limits)</li>
          </ul>
        </section>

        <section id="what-happens-if-violated" className="mb-12">
          <h2 className="text-3xl font-bold mb-4">What Happens If You Violate Navigation Limits?</h2>

          <h3 className="text-2xl font-semibold mb-3">Scenario 1: Damage While Out of Limits</h3>
          <p className="mb-4">
            You're cruising in Mexican waters, but your policy limits you to U.S. coastal waters. A storm damages your yacht.
          </p>

          <p className="mb-4">
            <strong>Result:</strong> Your insurer will likely <strong>deny the claim</strong>. You violated a navigational warranty, which voids coverage. You're personally responsible for all repair costs.
          </p>

          <h3 className="text-2xl font-semibold mb-3">Scenario 2: Damage After Returning</h3>
          <p className="mb-4">
            You cruised to Mexico (out of limits) but returned safely to U.S. waters. Two weeks later, your yacht is damaged in a storm while docked in San Diego.
          </p>

          <p className="mb-4">
            <strong>Result:</strong> <strong>Coverage should apply</strong> because the damage occurred within your navigation limits. The prior violation doesn't void future coverage once you're back in bounds. However, insurers may investigate and potentially non-renew your policy for the breach.
          </p>

          <h3 className="text-2xl font-semibold mb-3">Scenario 3: Prior Permission Obtained</h3>
          <p className="mb-4">
            You contacted your broker before cruising to Mexico and paid for a temporary endorsement extending coverage for 30 days.
          </p>

          <p className="mb-4">
            <strong>Result:</strong> <strong>Fully covered</strong>. The endorsement modified your navigation limits for that specific period, so damage in Mexican waters is covered (minus your deductible).
          </p>
        </section>

        <section id="how-to-request-extension" className="mb-12">
          <h2 className="text-3xl font-bold mb-4">How to Request a Navigation Extension</h2>

          <p className="mb-4">
            If you're planning to cruise outside your standard navigation limits:
          </p>

          <ol className="list-decimal pl-6 mb-6 space-y-3">
            <li>
              <strong>Contact your broker 2-4 weeks before departure</strong>
              <p className="text-sm text-muted-foreground mt-1">Don't wait until the day before—underwriters need time to review and approve</p>
            </li>
            <li>
              <strong>Provide trip details:</strong>
              <ul className="list-disc pl-6 mt-2 text-sm">
                <li>Departure and return dates</li>
                <li>Planned route and stops</li>
                <li>Crew experience and qualifications</li>
                <li>Weather window and season</li>
              </ul>
            </li>
            <li>
              <strong>Pay the extension fee</strong>
              <p className="text-sm text-muted-foreground mt-1">Typically 0.5-3% of your insured value, depending on risk and duration</p>
            </li>
            <li>
              <strong>Receive written endorsement</strong>
              <p className="text-sm text-muted-foreground mt-1">Don't depart until you have written confirmation from your insurer</p>
            </li>
          </ol>

          <div className="bg-blue-50 dark:bg-blue-950 p-6 rounded-lg mb-6">
            <h4 className="font-semibold mb-3">Example Extension Cost:</h4>
            <div className="space-y-2 text-sm">
              <p><strong>Trip:</strong> Florida to Bahamas (30 days)</p>
              <p><strong>Yacht value:</strong> $400,000</p>
              <p><strong>Extension fee:</strong> 1% = $4,000</p>
              <p className="pt-2 border-t text-muted-foreground">
                Worth it? Absolutely. One claim denial could cost you hundreds of thousands.
              </p>
            </div>
          </div>
        </section>

        <section id="faqs" className="mb-12">
          <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Can I get unlimited navigation limits?</h3>
              <p>
                Some insurers offer "worldwide" or "unrestricted" navigation for experienced offshore cruisers. However, even these policies often exclude war zones, piracy hotspots (e.g., Gulf of Aden), or high-risk areas. Expect to pay significantly higher premiums (20-50% more).
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">What if I have an emergency and must leave my navigation limits?</h3>
              <p>
                <strong>Life safety emergencies</strong> (medical evacuation, vessel in distress, etc.) are typically covered even if you cross boundaries. However, notify your insurer immediately. "I wanted to see Cuba" is not an emergency—"Hurricane approaching and only safe harbor was in Cuba" may be.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">How do insurers know if I violated navigation limits?</h3>
              <p>
                During a claim investigation, insurers review GPS logs, AIS data, social media posts, marina records, and customs entries. Don't assume they won't find out. The risk isn't worth the potential claim denial.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Can navigation limits change at renewal?</h3>
              <p>
                Yes. If your cruising patterns change, ask your broker to adjust limits. If you're moving from the Great Lakes to Florida permanently, your new policy can reflect Florida coastal waters. Conversely, if you rarely leave your home marina, narrower limits may reduce your premium.
              </p>
            </div>
          </div>
        </section>

      </article>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-8 mt-12">
        <h2 className="text-2xl font-bold mb-4">Planning an Extended Cruise?</h2>
        <p className="mb-6">
          Talk to your broker about navigation extensions before you depart. It's far cheaper than a denied claim.
        </p>
        <Link href="/yacht-insurance">
          <Button size="lg" variant="secondary">Read Full Insurance Guide</Button>
        </Link>
      </section>

      {/* Related Pages */}
      <section className="mt-12 pt-8 border-t">
        <h2 className="text-2xl font-bold mb-6">Related Resources</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Link href="/learn/named-storm-deductible">
            <Card className="hover:border-primary transition-colors h-full">
              <CardHeader>
                <CardTitle className="text-lg">Named Storm Deductibles</CardTitle>
                <CardDescription>Understanding percentage-based hurricane deductibles</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/learn/agreed-value-vs-acv">
            <Card className="hover:border-primary transition-colors h-full">
              <CardHeader>
                <CardTitle className="text-lg">Agreed Value vs ACV</CardTitle>
                <CardDescription>Policy valuation methods compared</CardDescription>
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
                "name": "Can I get unlimited navigation limits?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Some insurers offer worldwide or unrestricted navigation for experienced offshore cruisers. However, even these policies often exclude war zones and high-risk areas. Expect to pay significantly higher premiums (20-50% more)."
                }
              },
              {
                "@type": "Question",
                "name": "What if I have an emergency and must leave my navigation limits?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Life safety emergencies (medical evacuation, vessel in distress) are typically covered even if you cross boundaries. However, notify your insurer immediately."
                }
              },
              {
                "@type": "Question",
                "name": "How do insurers know if I violated navigation limits?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "During claim investigations, insurers review GPS logs, AIS data, social media posts, marina records, and customs entries. The risk of violation isn't worth potential claim denial."
                }
              }
            ]
          })
        }}
      />
    </div>
  )
}
