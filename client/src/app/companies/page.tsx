import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { getCompanyContact } from '@/lib/companyContacts'

export default async function CompaniesPage() {
  const supabase = await createClient()

  // @ts-ignore - Supabase type inference issue
  const { data: companies, error } = await supabase
    .from('companies')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching companies:', error)
  }

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
              {(() => {
                const c = getCompanyContact(company.name)
                if (!c) return null
                return (
                  <div className="mt-4 text-sm text-muted-foreground space-y-1">
                    {c.website && (
                      <div>
                        Website: <a href={c.website} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">{c.website}</a>
                      </div>
                    )}
                    {c.phone && <div>Phone: <span className="text-foreground">{c.phone}</span></div>}
                    {c.email && (
                      <div>
                        Email: <a href={`mailto:${c.email}`} className="text-primary hover:underline">{c.email}</a>
                      </div>
                    )}
                  </div>
                )
              })()}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
