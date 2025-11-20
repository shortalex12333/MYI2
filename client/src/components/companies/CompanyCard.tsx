'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { GradientText } from '@/components/ui/gradient-text'
import { ShieldCheck, ExternalLink, Building2 } from 'lucide-react'
import { Company } from '@/types/database.types'
import Image from 'next/image'

interface CompanyCardProps {
  company: Company
  index?: number
}

// Type labels mapping
const typeLabels: Record<Company['type'], string> = {
  insurer: 'Insurance Provider',
  broker: 'Insurance Broker',
  provider: 'Service Provider',
}

// Type colors mapping
const typeColors: Record<Company['type'], string> = {
  insurer: 'text-brand-blue border-brand-blue/30 bg-brand-blue/5',
  broker: 'text-gray-600 border-maritime-teal/30 bg-maritime-teal/5',
  provider: 'text-gray-900 border-maritime-cream/30 bg-maritime-cream/5',
}

export function CompanyCard({ company, index = 0 }: CompanyCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.2, delay: index * 0.05, ease: 'easeOut' }}
      whileHover={{ y: -4 }}
      className="group h-full"
    >
      <Link href={`/companies/${company.id}`}>
        <div className="relative h-full rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-brand-blue/50 transition-all duration-200 hover:shadow-lg hover:shadow-brand-blue/10 p-6 flex flex-col">
          {/* Company Logo & Header */}
          <div className="flex items-start gap-4 mb-4">
            {/* Logo */}
            <div className="relative flex-shrink-0">
              {/* Gold glow effect behind logo */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-brand-blue/30 to-brand-blue-light/20 opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-200" />

              <div className="relative w-16 h-16 rounded-lg bg-white-light border border-white/10 flex items-center justify-center overflow-hidden">
                {company.logo_url ? (
                  <Image
                    src={company.logo_url}
                    alt={`${company.name} logo`}
                    width={64}
                    height={64}
                    className="object-contain"
                  />
                ) : (
                  <Building2 className="h-8 w-8 text-brand-blue/50" />
                )}
              </div>
            </div>

            {/* Name & Verified Badge */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg md:text-xl font-semibold mb-2 group-hover:text-brand-blue transition-colors line-clamp-2">
                <GradientText>{company.name}</GradientText>
              </h3>

              {company.verified && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-blue/10 border border-brand-blue/30">
                  <ShieldCheck className="h-3.5 w-3.5 text-brand-blue" />
                  <span className="text-xs text-brand-blue font-medium uppercase tracking-wide">
                    Verified
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Company Type Badge */}
          <div className="mb-4">
            <span className={`inline-block px-3 py-1 rounded-full border text-xs font-medium ${typeColors[company.type]}`}>
              {typeLabels[company.type]}
            </span>
          </div>

          {/* Description */}
          {company.description && (
            <p className="text-sm text-gray-900/70 leading-relaxed mb-4 line-clamp-3 flex-grow">
              {company.description}
            </p>
          )}

          {/* Footer - Website Link */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-auto">
            {company.website ? (
              <div className="flex items-center gap-2 text-xs text-brand-blue group-hover:text-brand-blue-light transition-colors">
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Visit Website</span>
              </div>
            ) : (
              <div className="text-xs text-gray-900/40">View Details</div>
            )}

            {/* Arrow indicator */}
            <div className="text-brand-blue opacity-0 group-hover:opacity-100 transition-opacity">
              <svg
                className="h-4 w-4 group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
