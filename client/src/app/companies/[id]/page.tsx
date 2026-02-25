import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { getCompanyContact } from '@/lib/companyContacts'

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
  const contact = getCompanyContact(company.name)

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

        <div className="border rounded-lg p-6 bg-muted/50 space-y-3">
          <h2 className="text-xl font-semibold">Company Information</h2>
          <div className="text-sm text-muted-foreground space-y-2">
            {company.website && (
              <div>
                Website: <a href={company.website} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">{company.website}</a>
              </div>
            )}
            {!company.website && contact?.website && (
              <div>
                Website: <a href={contact.website} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">{contact.website}</a>
              </div>
            )}
            {contact?.contactUrl && (
              <div>
                Contact: <a href={contact.contactUrl} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">{contact.contactUrl}</a>
              </div>
            )}
            {contact?.phone && (
              <div>Phone: <span className="text-foreground">{contact.phone}</span></div>
            )}
            {contact?.email && (
              <div>Email: <a href={`mailto:${contact.email}`} className="text-primary hover:underline">{contact.email}</a></div>
            )}
            {contact?.address && (
              <div>Address: <span className="text-foreground">{contact.address}</span></div>
            )}
            {!contact && (
              <p className="text-muted-foreground">More details about this provider coming soon.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
