import Link from 'next/link'

export default async function CompaniesPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/v1/companies`, { cache: 'no-store' })
  const json = res.ok ? await res.json() : { companies: [] }
  const companies = json.companies || []

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Insurance Providers</h1>

      {!companies || companies.length === 0 ? (
        <p className="text-muted-foreground">No companies listed yet.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {companies.map((company: any) => (
            <Link
              key={company.id}
              href={`/companies/${company.id}`}
              className="border rounded-lg p-6 hover:border-primary transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <h2 className="text-xl font-semibold">{company.name}</h2>
                {company.verified && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                    Verified
                  </span>
                )}
              </div>
              {company.description && (
                <p className="text-sm text-muted-foreground">
                  {company.description}
                </p>
              )}
              <div className="mt-4 text-sm text-muted-foreground space-y-1">
                {company.website && (
                  <div>
                    Website: <a href={company.website} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">{company.website}</a>
                  </div>
                )}
                {company.phone && <div>Phone: <span className="text-foreground">{company.phone}</span></div>}
                {company.email && (
                  <div>
                    Email: <a href={`mailto:${company.email}`} className="text-primary hover:underline">{company.email}</a>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
