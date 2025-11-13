import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

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
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
