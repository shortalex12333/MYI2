import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react'

export const metadata = {
  title: 'Editorial Policy - MyYachtsInsurance Content Standards',
  description: 'Learn about our editorial standards, fact-checking process, and commitment to accurate, unbiased yacht insurance education.',
  openGraph: {
    title: 'Editorial Policy - MyYachtsInsurance',
    description: 'Our commitment to accurate, transparent yacht insurance education',
    type: 'website',
  },
}

export default function EditorialPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Breadcrumbs */}
      <nav className="text-sm text-muted-foreground mb-4">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span className="mx-2">/</span>
        <span>Editorial Policy</span>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Editorial Policy</h1>
        <p className="text-xl text-muted-foreground">
          Our commitment to accurate, transparent, and trustworthy yacht insurance education
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Last updated: January 15, 2026
        </p>
      </header>

      {/* Main Content */}
      <article className="prose prose-slate dark:prose-invert max-w-none">

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
          <p className="text-lg mb-4">
            MyYachtsInsurance exists to provide clear, accurate, and actionable education about yacht insurance. We are committed to transparency in how we create, review, and maintain our content.
          </p>
        </section>

        <div className="grid md:grid-cols-3 gap-6 not-prose mb-12">
          <Card>
            <CardHeader>
              <CheckCircle className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle>Accuracy First</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Every piece of content is fact-checked against credible industry sources before publication.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <RefreshCw className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Regular Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                We review and update key pages quarterly to reflect changes in the yacht insurance market.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <AlertTriangle className="h-8 w-8 text-yellow-600 mb-2" />
              <CardTitle>Clear Disclaimers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                We clearly distinguish educational content from specific policy advice or legal guidance.
              </p>
            </CardContent>
          </Card>
        </div>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4">Independence & Objectivity</h2>

          <h3 className="text-2xl font-semibold mb-3">No Broker Commissions</h3>
          <p className="mb-4">
            MyYachtsInsurance is not an insurance broker and does not receive commissions or referral fees from insurance carriers or brokers. This independence allows us to provide objective educational content without conflicts of interest.
          </p>

          <h3 className="text-2xl font-semibold mb-3">No Carrier Endorsements</h3>
          <p className="mb-4">
            We do not recommend or endorse specific insurance carriers. Policy features, pricing, and service quality vary widely by region, vessel type, and individual circumstances. Our role is to help you understand what questions to ask your broker, not to tell you which carrier to choose.
          </p>

          <h3 className="text-2xl font-semibold mb-3">Community Contributions</h3>
          <p className="mb-4">
            Our forum and knowledge base allow yacht owners and industry professionals to share experiences and insights. Community content is clearly labeled and represents individual perspectives, not official MyYachtsInsurance guidance.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4">Content Creation Process</h2>

          <h3 className="text-2xl font-semibold mb-3">1. Research & Sourcing</h3>
          <p className="mb-4">
            We begin every piece of content by consulting credible sources:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>Major yacht insurers:</strong> Policy documentation, coverage guides, and publicly available underwriting criteria</li>
            <li><strong>Marine insurance brokers:</strong> Industry expertise on common coverage scenarios and policy language</li>
            <li><strong>Industry publications:</strong> Marine insurance journals, yacht owner magazines, and professional trade publications</li>
            <li><strong>Regulatory sources:</strong> Coast Guard regulations, maritime law references, and insurance department guidelines</li>
            <li><strong>Real policies:</strong> When available, we review actual yacht insurance policy documents to ensure accuracy</li>
          </ul>

          <h3 className="text-2xl font-semibold mb-3">2. Drafting & Review</h3>
          <p className="mb-4">
            Content goes through multiple review stages:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Initial draft based on research and source materials</li>
            <li>Fact-checking against primary sources</li>
            <li>Clarity review to ensure concepts are explained in plain language</li>
            <li>Technical review for accuracy of insurance terminology and policy mechanics</li>
          </ul>

          <h3 className="text-2xl font-semibold mb-3">3. Publication & Maintenance</h3>
          <p className="mb-4">
            Once published, content enters our maintenance cycle:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>Last Updated dates:</strong> All key pages display when they were last reviewed and updated</li>
            <li><strong>Quarterly reviews:</strong> High-traffic pillar pages are reviewed every 3 months</li>
            <li><strong>Market change monitoring:</strong> We track industry news and update content when significant changes occur (new regulations, widespread policy changes, etc.)</li>
            <li><strong>User feedback:</strong> We welcome corrections and suggestions via our contact form</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4">What We Are & What We're Not</h2>

          <div className="bg-blue-50 dark:bg-blue-950 border-l-4 border-blue-500 p-4 mb-6">
            <p className="font-semibold mb-2">We ARE:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Educational resource:</strong> Explaining how yacht insurance works, what coverage options exist, and what questions to ask</li>
              <li><strong>Community platform:</strong> Connecting yacht owners and professionals to share knowledge and experiences</li>
              <li><strong>Research tool:</strong> Providing glossaries, guides, and calculators to help you understand your coverage</li>
            </ul>
          </div>

          <div className="bg-red-50 dark:bg-red-950 border-l-4 border-red-500 p-4 mb-6">
            <p className="font-semibold mb-2">We are NOT:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Insurance broker:</strong> We don't sell policies, bind coverage, or receive commissions</li>
              <li><strong>Legal advisor:</strong> Our content is educational only, not legal advice specific to your situation</li>
              <li><strong>Claims assistance:</strong> We don't handle claims, negotiate with carriers, or provide legal representation</li>
              <li><strong>Substitute for professional guidance:</strong> Always consult with a licensed marine insurance broker about your specific needs</li>
            </ul>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4">Disclaimers & Limitations</h2>

          <h3 className="text-2xl font-semibold mb-3">General Education Only</h3>
          <p className="mb-4">
            All content on MyYachtsInsurance is for general educational purposes. Yacht insurance policies vary significantly by carrier, vessel type, cruising area, and individual circumstances. What applies to one yacht may not apply to yours.
          </p>

          <h3 className="text-2xl font-semibold mb-3">Not Policy-Specific Advice</h3>
          <p className="mb-4">
            We cannot interpret your specific policy language or advise on whether you have adequate coverage. For policy-specific questions, consult your insurance broker or carrier directly.
          </p>

          <h3 className="text-2xl font-semibold mb-3">Market Conditions Change</h3>
          <p className="mb-4">
            The yacht insurance market evolves constantly. Underwriting criteria, available coverage options, and pricing can change with market conditions, catastrophic events, and regulatory updates. Always verify current information with licensed professionals.
          </p>

          <h3 className="text-2xl font-semibold mb-3">Regional Variations</h3>
          <p className="mb-4">
            Insurance regulations, coverage requirements, and market practices vary by jurisdiction. Content that describes "typical" yacht insurance may not reflect your specific state or country's requirements.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4">Corrections Policy</h2>
          <p className="mb-4">
            Despite our rigorous review process, errors can occur. If you identify an inaccuracy in our content:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>Contact us:</strong> Use our <Link href="/contact" className="text-primary hover:underline">contact form</Link> to report the issue with specific details</li>
            <li><strong>We investigate:</strong> Our team reviews the reported issue against source materials</li>
            <li><strong>We correct:</strong> If an error is confirmed, we update the content within 48 hours</li>
            <li><strong>We note major changes:</strong> Significant corrections are documented in an "Updated" note on the affected page</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4">Privacy & Data Use</h2>
          <p className="mb-4">
            For information about how we collect, use, and protect your personal information, please see our <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4">Contact Us</h2>
          <p className="mb-4">
            Questions about our editorial process or content standards? We welcome your feedback.
          </p>
          <p>
            <Link href="/contact" className="text-primary hover:underline font-medium">
              Contact us →
            </Link>
          </p>
        </section>

      </article>

      {/* Related Pages */}
      <section className="mt-12 pt-8 border-t">
        <h2 className="text-2xl font-bold mb-6">Related Policies</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Link href="/about">
            <Card className="hover:border-primary transition-colors h-full">
              <CardHeader>
                <CardTitle className="text-lg">About Us</CardTitle>
                <CardDescription>Our mission and what we do</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/privacy">
            <Card className="hover:border-primary transition-colors h-full">
              <CardHeader>
                <CardTitle className="text-lg">Privacy Policy</CardTitle>
                <CardDescription>How we protect your information</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/terms">
            <Card className="hover:border-primary transition-colors h-full">
              <CardHeader>
                <CardTitle className="text-lg">Terms of Service</CardTitle>
                <CardDescription>Usage terms and conditions</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </section>
    </div>
  )
}
