'use client'

import { CompanyCard } from './CompanyCard'
import { Company } from '@/types/database.types'

interface CompaniesGridProps {
  companies: Company[]
  title?: string
  description?: string
}

export function CompaniesGrid({
  companies,
  title = 'Elite Marine Insurance Providers',
  description = 'Trusted by yacht owners worldwide',
}: CompaniesGridProps) {
  return (
    <section className="py-16 md:py-24 bg-white relative">
      {/* Subtle Background Grid Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(212, 175, 55, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(212, 175, 55, 0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-semibold mb-4">
            <span className="text-brand-blue">{title}</span>
          </h2>
          <p className="text-lg text-gray-900/70 max-w-2xl mx-auto">
            {description}
          </p>
        </div>

        {/* Companies Grid */}
        {companies.length === 0 ? (
          <div className="py-16 text-center">
            <div className="inline-block p-12 rounded-lg bg-gray-100  border border-gray-200">
              <p className="text-lg text-gray-900/70 mb-2">
                No companies listed yet.
              </p>
              <p className="text-sm text-gray-900/50">
                Check back soon for verified insurance providers.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {companies.map((company, index) => (
                <CompanyCard key={company.id} company={company} index={index} />
              ))}
            </div>

            {/* Results Count */}
            <div className="mt-12 text-center">
              <p className="text-sm text-gray-900/50">
                Showing {companies.length} verified{' '}
                {companies.length === 1 ? 'provider' : 'providers'}
              </p>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
