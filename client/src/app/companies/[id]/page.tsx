import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { CompanyDetailHero } from '@/components/companies/CompanyDetailHero'
import { CompanyDetailStats } from '@/components/companies/CompanyDetailStats'
import { CompanyDetailAbout } from '@/components/companies/CompanyDetailAbout'
import { CompanyDetailCTA } from '@/components/companies/CompanyDetailCTA'

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
    <div className="min-h-screen bg-white text-gray-900">
      {/* Premium Hero Header */}
      <CompanyDetailHero company={company} />

      {/* Stats Bar */}
      <CompanyDetailStats verified={company.verified} type={company.type} />

      {/* About & Services */}
      <CompanyDetailAbout company={company} />

      {/* Bottom CTA */}
      <CompanyDetailCTA companyName={company.name} />
    </div>
  )
}
