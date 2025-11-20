import Link from 'next/link'

export default function ProvidersPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-display font-semibold mb-4">Verified Providers</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Connect with trusted yacht insurance professionals
        </p>
        <div className="border-2 border-dashed rounded-lg p-12 mb-8">
          <p className="text-muted-foreground mb-4">
            Browse our directory of verified insurance providers and brokers.
          </p>
          <Link
            href="/companies"
            className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            View All Providers
          </Link>
        </div>
      </div>
    </div>
  )
}
