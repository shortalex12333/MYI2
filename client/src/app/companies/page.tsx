import { createClient } from '@/lib/supabase/server'
import { CompaniesHero } from '@/components/companies/CompaniesHero'
import { TrustedBadges } from '@/components/companies/TrustedBadges'
import { CompaniesClient } from '@/components/companies/CompaniesClient'
import { CompaniesCTA } from '@/components/companies/CompaniesCTA'

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
    <div className="min-h-screen bg-white text-gray-900">
      {/* Premium Hero Header */}
      <CompaniesHero />

      {/* Trusted Badges Ribbon */}
      <TrustedBadges />

      {/* Filter Bar + Companies Grid (Client Component for interactivity) */}
      <CompaniesClient companies={companies || []} />

      {/* Bottom CTA */}
      <CompaniesCTA />
    </div>
  )
}
