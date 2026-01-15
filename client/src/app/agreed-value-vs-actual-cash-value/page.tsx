import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, AlertTriangle, DollarSign, TrendingDown, Shield } from 'lucide-react'

export const metadata = {
  title: 'Agreed Value vs Actual Cash Value (ACV) Yacht Insurance | Complete Guide 2026',
  description: 'Understand the critical difference between Agreed Value and Actual Cash Value yacht insurance. Real examples, total loss scenarios, and why ACV can leave you tens of thousands short.',
  openGraph: {
    title: 'Agreed Value vs Actual Cash Value (ACV) Yacht Insurance - Don\'t Get Caught Short',
    description: 'See real examples of how Agreed Value and ACV policies pay differently in total loss and partial loss scenarios. Learn which is right for your yacht.',
    type: 'article',
  },
}

export default function AgreedValueVsActualCashValuePage() {
  const lastUpdated = 'January 15, 2026'

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Breadcrumbs */}
      <nav className="text-sm text-muted-foreground mb-4">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/yacht-insurance" className="hover:text-foreground">Yacht Insurance</Link>
        <span className="mx-2">/</span>
        <span>Agreed Value vs Actual Cash Value</span>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Agreed Value vs Actual Cash Value (ACV): The Critical Difference in Yacht Insurance</h1>
        <p className="text-xl text-muted-foreground mb-2">
          One policy pays what you agreed your yacht is worth. The other pays what's left after depreciation. The difference can be $50,000-$150,000+ in a total loss.
        </p>
        <p className="text-sm text-muted-foreground">
          Last updated: {lastUpdated}
        </p>
      </header>

      {/* Quick TL;DR */}
      <Card className="mb-8 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-lg">TL;DR - Which Policy Type Pays More?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border-2 border-green-500">
              <div className="flex items-start gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-green-900 dark:text-green-100">Agreed Value</p>
                  <p className="text-sm text-muted-foreground">You and insurer agree on value upfront. Total loss = that amount (minus deductible).</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border-2 border-red-500">
              <div className="flex items-start gap-2 mb-2">
                <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-red-900 dark:text-red-100">Actual Cash Value (ACV)</p>
                  <p className="text-sm text-muted-foreground">Pays current market value after depreciation. Often 15-30% less than you thought.</p>
                </div>
              </div>
            </div>
          </div>
          <p className="text-sm mt-4 font-medium">
            Most yacht owners choose Agreed Value. ACV policies are cheaper, but the savings disappear in a claim.
          </p>
        </CardContent>
      </Card>

      {/* Main Content */}
      <article className="prose prose-slate dark:prose-invert max-w-none">

        <section id="what-they-are" className="mb-12">
          <h2 className="text-3xl font-bold mb-6">What These Policy Types Actually Mean</h2>

          <div className="grid md:grid-cols-2 gap-6 not-prose mb-6">
            <Card className="border-2 border-green-200 dark:border-green-800">
              <CardHeader>
                <Shield className="h-8 w-8 text-green-600 mb-2" />
                <CardTitle>Agreed Value</CardTitle>
                <CardDescription>Value locked in at policy inception</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-semibold mb-2">How it works:</p>
                  <p className="text-sm">
                    When you purchase the policy, you and your insurer agree on your yacht's value (usually based on a recent survey or appraisal). This value is stated in your policy declarations.
                  </p>
                </div>
                <div>
                  <p className="font-semibold mb-2">In a total loss:</p>
                  <p className="text-sm">
                    You receive the agreed value amount, minus your deductible. No depreciation calculation. No negotiation.
                  </p>
                </div>
                <div>
                  <p className="font-semibold mb-2">Cost:</p>
                  <p className="text-sm">
                    Higher premiums (typically 10-25% more than ACV policies), but you're paying for certainty.
                  </p>
                </div>
                <div className="pt-4 border-t">
                  <Link href="/glossary/agreed-value" className="text-primary text-sm hover:underline">
                    View full glossary definition →
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-200 dark:border-orange-800">
              <CardHeader>
                <TrendingDown className="h-8 w-8 text-orange-600 mb-2" />
                <CardTitle>Actual Cash Value (ACV)</CardTitle>
                <CardDescription>Market value at time of loss</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-semibold mb-2">How it works:</p>
                  <p className="text-sm">
                    Your policy covers your yacht's current market value, which is determined at the time of loss. This accounts for age, condition, depreciation, and market conditions.
                  </p>
                </div>
                <div>
                  <p className="font-semibold mb-2">In a total loss:</p>
                  <p className="text-sm">
                    The insurer evaluates comparable yacht sales, applies depreciation, and pays what your yacht was "actually worth" when it was lost.
                  </p>
                </div>
                <div>
                  <p className="font-semibold mb-2">Cost:</p>
                  <p className="text-sm">
                    Lower premiums than Agreed Value, but you bear the depreciation risk.
                  </p>
                </div>
                <div className="pt-4 border-t">
                  <Link href="/glossary/actual-cash-value" className="text-primary text-sm hover:underline">
                    View full glossary definition →
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="comparison-table" className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Side-by-Side Comparison</h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white dark:bg-slate-900 rounded-lg overflow-hidden shadow-sm">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800">
                  <th className="p-4 text-left font-semibold border-b">Feature</th>
                  <th className="p-4 text-left font-semibold border-b bg-green-50 dark:bg-green-950">Agreed Value</th>
                  <th className="p-4 text-left font-semibold border-b bg-orange-50 dark:bg-orange-950">Actual Cash Value (ACV)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-4 font-medium">How value is determined</td>
                  <td className="p-4 bg-green-50 dark:bg-green-950/30">Agreed upon when policy is written, based on survey/appraisal</td>
                  <td className="p-4 bg-orange-50 dark:bg-orange-950/30">Calculated at time of loss based on market comparables</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium">Depreciation applied?</td>
                  <td className="p-4 bg-green-50 dark:bg-green-950/30">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-green-600" />
                      <span>No</span>
                    </div>
                  </td>
                  <td className="p-4 bg-orange-50 dark:bg-orange-950/30">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-orange-600" />
                      <span>Yes - can reduce payout 15-30%+</span>
                    </div>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium">Total loss payout certainty</td>
                  <td className="p-4 bg-green-50 dark:bg-green-950/30">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>100% certain (stated in policy)</span>
                    </div>
                  </td>
                  <td className="p-4 bg-orange-50 dark:bg-orange-950/30">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-orange-600" />
                      <span>Unknown until claim is settled</span>
                    </div>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium">Premium cost</td>
                  <td className="p-4 bg-green-50 dark:bg-green-950/30">Higher (10-25% more than ACV)</td>
                  <td className="p-4 bg-orange-50 dark:bg-orange-950/30">Lower</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium">Required by lenders?</td>
                  <td className="p-4 bg-green-50 dark:bg-green-950/30">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>Usually required</span>
                    </div>
                  </td>
                  <td className="p-4 bg-orange-50 dark:bg-orange-950/30">Rarely accepted by lenders</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium">Partial loss claims</td>
                  <td className="p-4 bg-green-50 dark:bg-green-950/30">Repair cost paid (minus deductible)</td>
                  <td className="p-4 bg-orange-50 dark:bg-orange-950/30">Repair cost paid, but depreciation may apply to replaced parts</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium">Best for</td>
                  <td className="p-4 bg-green-50 dark:bg-green-950/30">Financed yachts, newer vessels, owners who want certainty</td>
                  <td className="p-4 bg-orange-50 dark:bg-orange-950/30">Older vessels, owners comfortable with market risk</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium">Renewal considerations</td>
                  <td className="p-4 bg-green-50 dark:bg-green-950/30">Value can be adjusted up or down at renewal based on new survey</td>
                  <td className="p-4 bg-orange-50 dark:bg-orange-950/30">Coverage limit may decrease over time as yacht ages</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="real-examples" className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Real-World Examples: What You Actually Get Paid</h2>

          <div className="space-y-8">
            {/* Total Loss Example */}
            <div>
              <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <XCircle className="h-6 w-6 text-red-600" />
                Example 1: Total Loss - Hurricane Sinks Your Yacht
              </h3>

              <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg mb-4">
                <p className="font-semibold mb-3">Scenario:</p>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>2019 Sunseeker 68 Sport Yacht</li>
                  <li>Purchase price: $2,100,000 (new in 2019)</li>
                  <li>Current year: 2026 (yacht is 7 years old)</li>
                  <li>Recent upgrades: $80,000 in new electronics and interior refresh</li>
                  <li>Hurricane causes sinking - declared total loss by surveyor</li>
                  <li>Deductible: $5,000</li>
                </ul>
              </div>

              <div className="grid md:grid-cols-2 gap-6 not-prose">
                <Card className="border-2 border-green-200 dark:border-green-800">
                  <CardHeader className="bg-green-50 dark:bg-green-950">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      Agreed Value Policy
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between pb-2 border-b">
                        <span>Agreed value (from policy):</span>
                        <span className="font-semibold">$1,650,000</span>
                      </div>
                      <div className="flex justify-between pb-2 border-b">
                        <span>Minus deductible:</span>
                        <span className="text-red-600">-$5,000</span>
                      </div>
                      <div className="flex justify-between pt-2 text-lg font-bold text-green-700 dark:text-green-400">
                        <span>Your payout:</span>
                        <span>$1,645,000</span>
                      </div>
                      <p className="text-xs text-muted-foreground pt-3 border-t">
                        Check issued within 30-45 days after total loss declaration. No negotiation needed.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-orange-200 dark:border-orange-800">
                  <CardHeader className="bg-orange-50 dark:bg-orange-950">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingDown className="h-5 w-5 text-orange-600" />
                      Actual Cash Value Policy
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between pb-2 border-b">
                        <span>Insurer's ACV calculation:</span>
                        <span className="font-semibold">$1,380,000</span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span className="italic">Based on 7-year depreciation curve</span>
                        <span></span>
                      </div>
                      <div className="flex justify-between pb-2 border-b">
                        <span>Minus deductible:</span>
                        <span className="text-red-600">-$5,000</span>
                      </div>
                      <div className="flex justify-between pt-2 text-lg font-bold text-orange-700 dark:text-orange-400">
                        <span>Your payout:</span>
                        <span>$1,375,000</span>
                      </div>
                      <p className="text-xs text-muted-foreground pt-3 border-t">
                        Settlement delayed 60-90 days during valuation dispute. Your $80K in upgrades not fully recognized.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-red-50 dark:bg-red-950 border-l-4 border-red-500 p-4 mt-6">
                <p className="font-semibold mb-2 flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  The Difference:
                </p>
                <p className="text-lg">
                  Agreed Value pays <strong>$270,000 more</strong> than ACV in this total loss scenario. That's 19.6% more money in your pocket.
                </p>
                <p className="text-sm mt-2 text-muted-foreground">
                  Even if the Agreed Value policy cost $3,500/year more in premiums over 7 years ($24,500 total), you're still ahead by $245,500.
                </p>
              </div>
            </div>

            {/* Partial Loss Example */}
            <div>
              <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
                Example 2: Partial Loss - Grounding Damage
              </h3>

              <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg mb-4">
                <p className="font-semibold mb-3">Scenario:</p>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>2021 Princess 60 Motor Yacht</li>
                  <li>Grounding incident damages hull, running gear, and one shaft</li>
                  <li>Survey determines: NOT a total loss (repairable)</li>
                  <li>Repair estimate: $95,000</li>
                  <li>Deductible: $2,500</li>
                </ul>
              </div>

              <div className="grid md:grid-cols-2 gap-6 not-prose">
                <Card className="border-2 border-green-200 dark:border-green-800">
                  <CardHeader className="bg-green-50 dark:bg-green-950">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      Agreed Value Policy
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between pb-2 border-b">
                        <span>Actual repair cost:</span>
                        <span className="font-semibold">$95,000</span>
                      </div>
                      <div className="flex justify-between pb-2 border-b">
                        <span>Minus deductible:</span>
                        <span className="text-red-600">-$2,500</span>
                      </div>
                      <div className="flex justify-between pt-2 text-lg font-bold text-green-700 dark:text-green-400">
                        <span>Insurance pays:</span>
                        <span>$92,500</span>
                      </div>
                      <p className="text-xs text-muted-foreground pt-3 border-t">
                        Full replacement cost for all damaged parts. No depreciation on new shaft or hull repairs.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-orange-200 dark:border-orange-800">
                  <CardHeader className="bg-orange-50 dark:bg-orange-950">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingDown className="h-5 w-5 text-orange-600" />
                      Actual Cash Value Policy
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between pb-2">
                        <span>Repair cost:</span>
                        <span className="font-semibold">$95,000</span>
                      </div>
                      <div className="flex justify-between pb-2 border-b">
                        <span>Depreciation on parts (20%):</span>
                        <span className="text-orange-600">-$19,000</span>
                      </div>
                      <div className="flex justify-between pb-2 border-b">
                        <span>Minus deductible:</span>
                        <span className="text-red-600">-$2,500</span>
                      </div>
                      <div className="flex justify-between pt-2 text-lg font-bold text-orange-700 dark:text-orange-400">
                        <span>Insurance pays:</span>
                        <span>$73,500</span>
                      </div>
                      <p className="text-xs text-muted-foreground pt-3 border-t">
                        You pay depreciation on replaced parts. Out-of-pocket: $21,500 instead of $2,500.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-950 border-l-4 border-yellow-500 p-4 mt-6">
                <p className="font-semibold mb-2">Important Note on Partial Losses:</p>
                <p className="text-sm">
                  How ACV applies to partial losses varies by policy. Some ACV policies cover full repair costs but depreciate your total insured amount over time. Others apply depreciation to individual replaced parts. <strong>Always read your policy's "Basis of Recovery" or "Valuation" clause.</strong>
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="surprises" className="mb-12">
          <h2 className="text-3xl font-bold mb-6">When ACV Surprises Owners (And Not in a Good Way)</h2>

          <p className="mb-4">
            Many yacht owners don't realize they have an ACV policy until they file a claim. Here are the most common scenarios where ACV creates unexpected problems:
          </p>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  1. You Still Owe More Than the Payout
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-3">
                  Your yacht is totaled, but you still have $1,200,000 on your loan. Your ACV policy pays $1,050,000. You're personally responsible for the $150,000 gap, plus you no longer have a yacht.
                </p>
                <p className="text-sm font-semibold">
                  This is why most lenders require Agreed Value policies with coverage at or above the loan amount.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  2. You Made Significant Upgrades That Aren't Recognized
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-3">
                  You spent $120,000 on new engines, electronics, and interior upgrades last year. In a total loss, the ACV adjuster says "comparable yachts without those upgrades sell for X" and only credits you $40,000 of your investment.
                </p>
                <p className="text-sm font-semibold">
                  With Agreed Value, you can include recent upgrades in your agreed amount (with documentation/receipts).
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  3. The Market Has Softened Since You Bought
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-3">
                  You bought your yacht in 2021 when the market was hot for $900,000. In 2026, similar yachts are selling for $650,000 due to market conditions. Your ACV payout reflects the current depressed market, not what you paid.
                </p>
                <p className="text-sm font-semibold">
                  Agreed Value protects you from market fluctuations. The value is locked in at policy inception.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  4. Your Yacht Is a Unique or Low-Production Model
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-3">
                  You own a custom-built expedition yacht or a rare model with only 12 built. When determining ACV, the adjuster struggles to find comparables and lowballs the valuation because "there's no established market."
                </p>
                <p className="text-sm font-semibold">
                  Unique yachts should always be insured on an Agreed Value basis using a qualified marine surveyor's appraisal.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  5. The Claims Process Becomes a Fight
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-3">
                  After a total loss, you and the insurer disagree on the ACV calculation. They say $780,000. You say $950,000. You hire your own appraiser. The settlement drags out for 9 months while you're making loan payments on a sunken yacht.
                </p>
                <p className="text-sm font-semibold">
                  Agreed Value eliminates this fight. The value is stated in black and white on page one of your policy.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 border-l-4 border-blue-500 p-4 mt-6">
            <p className="font-semibold mb-2">Bottom Line:</p>
            <p className="text-sm">
              ACV policies shift the risk of depreciation and market fluctuations onto you. In exchange, you save 10-25% on premiums. For most yacht owners, especially those with financed vessels or yachts under 15 years old, Agreed Value is worth the extra cost.
            </p>
          </div>
        </section>

        <section id="which-to-choose" className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Which Policy Type Should You Choose?</h2>

          <div className="grid md:grid-cols-2 gap-6 not-prose mb-6">
            <Card className="border-2 border-green-200 dark:border-green-800">
              <CardHeader className="bg-green-50 dark:bg-green-950">
                <CardTitle className="text-lg">Choose Agreed Value If:</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>You have a loan/mortgage on your yacht</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Your yacht is less than 15 years old</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>You want certainty about payout in a total loss</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>You've made significant upgrades or customizations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Your yacht is a unique, rare, or custom-built model</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>You want to avoid claims disputes over valuation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>You operate in high-risk areas (Florida, Caribbean hurricane zones)</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-200 dark:border-orange-800">
              <CardHeader className="bg-orange-50 dark:bg-orange-950">
                <CardTitle className="text-lg">Consider ACV If:</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <span>Your yacht is fully paid off (no loan)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <span>Your yacht is 20+ years old and depreciation has mostly occurred</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <span>You're comfortable with uncertainty in a total loss scenario</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <span>You prioritize lower premiums over payout certainty</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <span>You have cash reserves to cover a potential valuation gap</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <span>Your yacht is a common production model with clear market comparables</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg">
            <p className="font-semibold mb-3">Industry Recommendation:</p>
            <p className="text-sm mb-3">
              Most yacht brokers and insurance professionals recommend Agreed Value policies for yachts under $2,000,000 in value that are less than 20 years old. The premium difference is typically small compared to the potential payout gap in a claim.
            </p>
            <p className="text-sm">
              For vintage or classic yachts, or vessels over 30 years old, discuss both options with your broker. Some older vessels are better suited to ACV policies where the depreciation has mostly occurred.
            </p>
          </div>
        </section>

        <section id="faqs" className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Can I switch from ACV to Agreed Value mid-policy?</h3>
              <p className="text-sm">
                Usually not mid-term, but you can change at renewal. You'll likely need a current marine survey or appraisal to establish the agreed value. Some insurers allow mid-term changes if you're refinancing or have a triggering event, but expect to pay the premium difference plus an administrative fee.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">How is the agreed value determined when I buy a policy?</h3>
              <p className="text-sm">
                Typically based on a recent marine survey (within 2-5 years depending on yacht age and value), a professional appraisal, or purchase documentation if recently acquired. The insurer reviews the documentation and either accepts your proposed value or negotiates. Once agreed, it's stated in your policy declarations.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Does my agreed value stay the same every year?</h3>
              <p className="text-sm">
                No. At each policy renewal, the agreed value can be adjusted up or down based on a new survey, market conditions, or your yacht's condition. You and your insurer must re-agree on the value annually. If your yacht has appreciated (rare vintage models, for example), you can increase the agreed value. If it's depreciated, the insurer may reduce it.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">What happens if I over-insure on an Agreed Value policy?</h3>
              <p className="text-sm">
                Insurers generally won't allow you to over-insure beyond fair market value plus a small margin (typically 10-15%). They'll require a survey to verify your proposed value. Deliberately over-insuring can be considered insurance fraud. If a total loss occurs and the insurer proves over-insurance, they may reduce the payout to actual market value.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Do I still need a survey if I have an ACV policy?</h3>
              <p className="text-sm">
                Possibly. Many insurers still require a recent survey for underwriting purposes, especially for yachts over a certain age or value, even on ACV policies. The survey helps the insurer assess condition and risk, even though the payout won't be based on the surveyed value. Always check your insurer's requirements.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Can I have Agreed Value on hull coverage and ACV on something else?</h3>
              <p className="text-sm">
                Yes. It's common to have Agreed Value for your hull and machinery coverage (the physical yacht) while having ACV or stated amounts for specific equipment like tenders, jet skis, or personal effects. Discuss with your broker how each component of your policy is valued.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">How do total loss thresholds work with Agreed Value vs ACV?</h3>
              <p className="text-sm">
                A yacht is typically declared a total loss when repair costs exceed 75-80% of the insured value (the threshold varies by insurer). On an Agreed Value policy, this calculation uses the agreed amount. On an ACV policy, it uses the calculated actual cash value at time of loss. This means an ACV yacht might be repaired in scenarios where an Agreed Value yacht would be totaled, or vice versa.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">What's the typical premium difference between Agreed Value and ACV?</h3>
              <p className="text-sm">
                Agreed Value policies typically cost 10-25% more in annual premiums than ACV policies, all else being equal. For example, if an ACV policy costs $8,000/year, an Agreed Value policy might cost $9,200-$10,000/year. The exact difference depends on your yacht's age, value, and insurer. Given the potential payout difference in a total loss, most owners find this premium increase worthwhile.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Does charter use affect Agreed Value vs ACV?</h3>
              <p className="text-sm">
                Policy basis (Agreed Value vs ACV) is separate from use (private vs charter). However, charter policies are almost always written on an Agreed Value basis because charter yachts depreciate faster and face higher risk. If you're considering chartering your yacht, expect to need an Agreed Value policy.
              </p>
            </div>
          </div>
        </section>

        <section id="hull-machinery-context" className="mb-12">
          <h2 className="text-3xl font-bold mb-6">How This Fits Into Your Overall Yacht Insurance</h2>

          <p className="mb-4">
            The Agreed Value vs ACV decision is part of your <Link href="/hull-and-machinery-insurance" className="text-primary hover:underline font-medium">Hull and Machinery (H&M) coverage</Link>, which protects the physical yacht itself. Your complete yacht insurance package typically includes:
          </p>

          <div className="grid md:grid-cols-2 gap-4 not-prose mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Hull & Machinery Coverage</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="mb-2">Physical damage to your yacht - this is where Agreed Value vs ACV applies.</p>
                <Link href="/hull-and-machinery-insurance" className="text-primary hover:underline text-sm">
                  Learn more about H&M coverage →
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Protection & Indemnity (P&I)</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="mb-2">Liability for injury and damage to others. ACV vs Agreed Value doesn't apply here.</p>
                <Link href="/protection-and-indemnity-pi" className="text-primary hover:underline text-sm">
                  Learn more about P&I coverage →
                </Link>
              </CardContent>
            </Card>
          </div>

          <p className="text-sm">
            Return to our main <Link href="/yacht-insurance" className="text-primary hover:underline font-medium">Yacht Insurance Guide</Link> for a complete overview of coverage types, exclusions, and what to ask your broker.
          </p>
        </section>

      </article>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-8 mt-12">
        <h2 className="text-2xl font-bold mb-4">Get the Right Coverage for Your Yacht</h2>
        <p className="mb-6">
          Don't leave your yacht's value to chance. Connect with experienced insurance brokers who can explain your options and help you choose between Agreed Value and ACV based on your specific situation.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link href="/signup">
            <Button size="lg" variant="secondary">Get Quotes from Top Brokers</Button>
          </Link>
          <Link href="/contact">
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
              Ask a Yacht Insurance Expert
            </Button>
          </Link>
        </div>
        <p className="text-sm mt-4 opacity-90">
          Free quotes. No obligation. Compare Agreed Value and ACV options side-by-side.
        </p>
      </section>

      {/* Related Pages */}
      <section className="mt-12 pt-8 border-t">
        <h2 className="text-2xl font-bold mb-6">Related Resources</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Link href="/yacht-insurance">
            <Card className="hover:border-primary transition-colors h-full">
              <CardHeader>
                <CardTitle className="text-lg">Yacht Insurance Guide</CardTitle>
                <CardDescription>Complete overview of yacht insurance coverage types</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/hull-and-machinery-insurance">
            <Card className="hover:border-primary transition-colors h-full">
              <CardHeader>
                <CardTitle className="text-lg">Hull & Machinery</CardTitle>
                <CardDescription>What physical damage coverage includes and excludes</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/named-storm-deductible-florida">
            <Card className="hover:border-primary transition-colors h-full">
              <CardHeader>
                <CardTitle className="text-lg">Named Storm Deductibles</CardTitle>
                <CardDescription>Florida hurricane deductibles explained</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </section>

      {/* Glossary Links */}
      <section className="mt-8 p-6 bg-slate-50 dark:bg-slate-900 rounded-lg">
        <h3 className="font-semibold mb-3">Key Terms:</h3>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/glossary/agreed-value" className="text-primary hover:underline">
            Agreed Value
          </Link>
          <span className="text-muted-foreground">•</span>
          <Link href="/glossary/actual-cash-value" className="text-primary hover:underline">
            Actual Cash Value (ACV)
          </Link>
          <span className="text-muted-foreground">•</span>
          <Link href="/glossary/total-loss" className="text-primary hover:underline">
            Total Loss
          </Link>
          <span className="text-muted-foreground">•</span>
          <Link href="/glossary/depreciation" className="text-primary hover:underline">
            Depreciation
          </Link>
          <span className="text-muted-foreground">•</span>
          <Link href="/glossary/marine-survey" className="text-primary hover:underline">
            Marine Survey
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
                "name": "Can I switch from ACV to Agreed Value mid-policy?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Usually not mid-term, but you can change at renewal. You'll likely need a current marine survey or appraisal to establish the agreed value. Some insurers allow mid-term changes if you're refinancing or have a triggering event, but expect to pay the premium difference plus an administrative fee."
                }
              },
              {
                "@type": "Question",
                "name": "How is the agreed value determined when I buy a policy?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Typically based on a recent marine survey (within 2-5 years depending on yacht age and value), a professional appraisal, or purchase documentation if recently acquired. The insurer reviews the documentation and either accepts your proposed value or negotiates. Once agreed, it's stated in your policy declarations."
                }
              },
              {
                "@type": "Question",
                "name": "Does my agreed value stay the same every year?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "No. At each policy renewal, the agreed value can be adjusted up or down based on a new survey, market conditions, or your yacht's condition. You and your insurer must re-agree on the value annually."
                }
              },
              {
                "@type": "Question",
                "name": "What happens if I over-insure on an Agreed Value policy?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Insurers generally won't allow you to over-insure beyond fair market value plus a small margin (typically 10-15%). They'll require a survey to verify your proposed value. Deliberately over-insuring can be considered insurance fraud."
                }
              },
              {
                "@type": "Question",
                "name": "Do I still need a survey if I have an ACV policy?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Possibly. Many insurers still require a recent survey for underwriting purposes, especially for yachts over a certain age or value, even on ACV policies. The survey helps the insurer assess condition and risk."
                }
              },
              {
                "@type": "Question",
                "name": "Can I have Agreed Value on hull coverage and ACV on something else?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes. It's common to have Agreed Value for your hull and machinery coverage while having ACV or stated amounts for specific equipment like tenders, jet skis, or personal effects."
                }
              },
              {
                "@type": "Question",
                "name": "How do total loss thresholds work with Agreed Value vs ACV?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "A yacht is typically declared a total loss when repair costs exceed 75-80% of the insured value. On an Agreed Value policy, this calculation uses the agreed amount. On an ACV policy, it uses the calculated actual cash value at time of loss."
                }
              },
              {
                "@type": "Question",
                "name": "What's the typical premium difference between Agreed Value and ACV?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Agreed Value policies typically cost 10-25% more in annual premiums than ACV policies. For example, if an ACV policy costs $8,000/year, an Agreed Value policy might cost $9,200-$10,000/year. Given the potential payout difference in a total loss, most owners find this premium increase worthwhile."
                }
              },
              {
                "@type": "Question",
                "name": "Does charter use affect Agreed Value vs ACV?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Policy basis (Agreed Value vs ACV) is separate from use (private vs charter). However, charter policies are almost always written on an Agreed Value basis because charter yachts depreciate faster and face higher risk."
                }
              }
            ]
          })
        }}
      />

      {/* Schema.org Article markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "Agreed Value vs Actual Cash Value (ACV): The Critical Difference in Yacht Insurance",
            "description": "Understand the critical difference between Agreed Value and Actual Cash Value yacht insurance. Real examples, total loss scenarios, and why ACV can leave you tens of thousands short.",
            "datePublished": "2026-01-15",
            "dateModified": "2026-01-15",
            "author": {
              "@type": "Organization",
              "name": "Yacht Insurance Guide"
            }
          })
        }}
      />
    </div>
  )
}
