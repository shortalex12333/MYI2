import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Anchor, BookOpen, Users, Shield } from 'lucide-react'

export const metadata = {
  title: 'About MyYachtsInsurance - Expert Yacht Insurance Education',
  description: 'Learn about MyYachtsInsurance, our mission to provide accurate yacht insurance education, and our commitment to helping yacht owners make informed decisions.',
  openGraph: {
    title: 'About MyYachtsInsurance',
    description: 'Expert yacht insurance education and community resources',
    type: 'website',
  },
}

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Breadcrumbs */}
      <nav className="text-sm text-muted-foreground mb-4">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span className="mx-2">/</span>
        <span>About</span>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">About MyYachtsInsurance</h1>
        <p className="text-xl text-muted-foreground">
          Expert yacht insurance education and community resources for yacht owners worldwide
        </p>
      </header>

      {/* Main Content */}
      <article className="prose prose-slate dark:prose-invert max-w-none">

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
          <p className="text-lg mb-4">
            MyYachtsInsurance exists to demystify yacht insurance and help yacht owners make informed decisions about protecting their vessels. We believe that understanding your coverage shouldn't require a law degree or insurance industry experience.
          </p>
          <p className="mb-4">
            The yacht insurance market is complex, with terminology like "agreed value," "navigation limits," and "named storm deductibles" that can confuse even experienced boat owners. We break down these concepts into clear, actionable guidance backed by industry expertise and real-world examples.
          </p>
        </section>

        <div className="grid md:grid-cols-2 gap-6 not-prose mb-12">
          <Card>
            <CardHeader>
              <BookOpen className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Educational Focus</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                We create comprehensive guides, glossary definitions, and practical tools to help yacht owners understand policy language, compare coverage options, and identify gaps in protection.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Independent Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                We are not an insurance broker or carrier. Our content is educational only and designed to help you ask better questions when working with your own broker or insurer.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Community Knowledge</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Our platform connects yacht owners, crew, and insurance professionals to share experiences, answer questions, and build collective expertise around marine insurance.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Anchor className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Real-World Scenarios</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                We focus on practical examples: What happens if a named storm hits while you're in Florida? How does charter use affect your policy? When should you increase P&I limits?
              </p>
            </CardContent>
          </Card>
        </div>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4">Who We Serve</h2>
          <p className="mb-4">
            Our content is designed for:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>Yacht owners</strong> shopping for insurance or reviewing existing policies</li>
            <li><strong>Prospective buyers</strong> trying to understand insurance costs before purchasing a vessel</li>
            <li><strong>Charter yacht operators</strong> navigating commercial insurance requirements</li>
            <li><strong>Yacht crew</strong> seeking to understand Jones Act coverage and crew medical protection</li>
            <li><strong>Marine industry professionals</strong> looking for educational resources to share with clients</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4">Our Content Standards</h2>
          <p className="mb-4">
            Every piece of content on MyYachtsInsurance follows rigorous editorial standards:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>We cite credible sources including major insurers, brokers, and industry publications</li>
            <li>We clearly distinguish between general education and specific policy language</li>
            <li>We update content regularly as the insurance market evolves</li>
            <li>We mark "last updated" dates on key pages so you know content is current</li>
            <li>We avoid affiliate relationships that could bias our coverage comparisons</li>
          </ul>
          <p>
            For more details on how we create and maintain content, see our{' '}
            <Link href="/editorial-policy" className="text-primary hover:underline font-medium">
              Editorial Policy
            </Link>.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4">What We're Not</h2>
          <div className="bg-yellow-50 dark:bg-yellow-950 border-l-4 border-yellow-500 p-4 mb-6">
            <p className="font-semibold mb-2">Important Disclaimers:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>We are not insurance brokers:</strong> We don't sell policies or receive commissions from carriers</li>
              <li><strong>We are not legal advisors:</strong> Our content is educational, not legal or professional advice</li>
              <li><strong>We are not a substitute for your broker:</strong> Always consult with a licensed marine insurance professional about your specific situation</li>
              <li><strong>We don't endorse specific carriers:</strong> Policy features vary widely—what works for one yacht may not work for another</li>
            </ul>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4">Topics We Cover</h2>
          <p className="mb-4">
            Our educational content spans the full spectrum of yacht insurance:
          </p>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="font-semibold mb-2">Coverage Types</h3>
              <ul className="list-disc pl-6 text-sm space-y-1">
                <li><Link href="/hull-and-machinery-insurance" className="text-primary hover:underline">Hull & Machinery</Link></li>
                <li><Link href="/protection-and-indemnity-pi" className="text-primary hover:underline">Protection & Indemnity (P&I)</Link></li>
                <li><Link href="/yacht-crew-insurance-crew-medical-jones-act" className="text-primary hover:underline">Crew Medical & Jones Act</Link></li>
                <li><Link href="/charter-yacht-insurance-commercial" className="text-primary hover:underline">Charter & Commercial Policies</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Key Concepts</h3>
              <ul className="list-disc pl-6 text-sm space-y-1">
                <li><Link href="/agreed-value-vs-actual-cash-value" className="text-primary hover:underline">Agreed Value vs ACV</Link></li>
                <li><Link href="/navigation-limits-and-lay-up-warranty" className="text-primary hover:underline">Navigation Limits</Link></li>
                <li><Link href="/named-storm-deductible-florida" className="text-primary hover:underline">Named Storm Deductibles</Link></li>
                <li><Link href="/glossary" className="text-primary hover:underline">Insurance Terminology</Link></li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4">Contact Us</h2>
          <p className="mb-4">
            We welcome feedback, questions, and suggestions for new content topics. While we can't provide personalized insurance advice, we're happy to hear what educational content would be most helpful to the yacht owner community.
          </p>
          <p>
            <Link href="/contact" className="text-primary hover:underline font-medium">
              Get in touch →
            </Link>
          </p>
        </section>

      </article>

      {/* Related Pages */}
      <section className="mt-12 pt-8 border-t">
        <h2 className="text-2xl font-bold mb-6">Learn More</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Link href="/editorial-policy">
            <Card className="hover:border-primary transition-colors h-full">
              <CardHeader>
                <CardTitle className="text-lg">Editorial Policy</CardTitle>
                <CardDescription>How we create and maintain our content</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/yacht-insurance">
            <Card className="hover:border-primary transition-colors h-full">
              <CardHeader>
                <CardTitle className="text-lg">Yacht Insurance Guide</CardTitle>
                <CardDescription>Comprehensive overview of coverage types</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/glossary">
            <Card className="hover:border-primary transition-colors h-full">
              <CardHeader>
                <CardTitle className="text-lg">Insurance Glossary</CardTitle>
                <CardDescription>Definitions of key yacht insurance terms</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </section>
    </div>
  )
}
