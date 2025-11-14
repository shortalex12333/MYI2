import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function CompanyPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  // @ts-ignore - Supabase type inference issue
  const { data: company, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !company) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-start justify-between mb-6">
          <h1 className="text-3xl font-bold">{company.name}</h1>
          {company.verified && (
            <span className="bg-primary/10 text-primary px-3 py-1 rounded text-sm">
              Verified Provider
            </span>
          )}
        </div>

        {company.description && (
          <p className="text-lg text-muted-foreground mb-8">
            {company.description}
          </p>
        )}

        <div className="border rounded-lg p-6 bg-muted/50">
          <h2 className="text-xl font-semibold mb-4">Company Information</h2>
          <p className="text-muted-foreground">
            More details about this provider coming soon.
          </p>
        </div>
      </div>
    </div>
  )
}
