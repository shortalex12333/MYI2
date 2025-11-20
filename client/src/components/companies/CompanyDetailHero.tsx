'use client'

import { motion } from 'framer-motion'
import { AuroraBackground } from '@/components/ui/aurora-background'
import { ShieldCheck, Building2, ExternalLink, ArrowLeft } from 'lucide-react'
import { Company } from '@/types/database.types'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface CompanyDetailHeroProps {
  company: Company
}

const typeLabels: Record<Company['type'], string> = {
  insurer: 'Insurance Provider',
  broker: 'Insurance Broker',
  provider: 'Service Provider',
}

export function CompanyDetailHero({ company }: CompanyDetailHeroProps) {
  return (
    <AuroraBackground className="relative min-h-[60vh] flex items-center justify-center">
      <div className="container mx-auto px-4 relative z-10">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className="mb-8"
        >
          <Link
            href="/companies"
            className="inline-flex items-center gap-2 text-gray-900/70 hover:text-brand-blue transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm">Back to Providers</span>
          </Link>
        </motion.div>

        <div className="max-w-4xl mx-auto text-center">
          {/* Company Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="mb-8"
          >
            <div className="relative inline-block">
              {/* Gold glow */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-brand-blue/30 to-brand-blue-light/20 blur-2xl" />

              <div className="relative w-32 h-32 rounded-lg bg-white-light border-2 border-brand-blue/30 flex items-center justify-center overflow-hidden">
                {company.logo_url ? (
                  <Image
                    src={company.logo_url}
                    alt={`${company.name} logo`}
                    width={128}
                    height={128}
                    className="object-contain p-4"
                  />
                ) : (
                  <Building2 className="h-16 w-16 text-brand-blue/50" />
                )}
              </div>
            </div>
          </motion.div>

          {/* Company Name */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-display font-semibold mb-4"
          >
            <span className="text-brand-blue">{company.name}</span>
          </motion.h1>

          {/* Type & Verified Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-3 mb-6"
          >
            <span className="px-4 py-2 rounded-full border border-brand-blue/30 text-brand-blue bg-brand-blue/5 text-sm font-medium">
              {typeLabels[company.type]}
            </span>

            {company.verified && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-brand-blue/10 border border-brand-blue/30">
                <ShieldCheck className="h-4 w-4 text-brand-blue" />
                <span className="text-sm text-brand-blue font-medium uppercase tracking-wide">
                  Verified Provider
                </span>
              </div>
            )}
          </motion.div>

          {/* Description */}
          {company.description && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.3 }}
              className="text-lg md:text-xl text-gray-900/70 max-w-3xl mx-auto leading-relaxed mb-8"
            >
              {company.description}
            </motion.p>
          )}

          {/* Website Button */}
          {company.website && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.4 }}
            >
              <Button
                size="lg"
                asChild
                className="bg-brand-blue hover:bg-brand-blue/90 text-white font-semibold  shadow-brand-blue/20"
              >
                <a href={company.website} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-5 w-5" />
                  Visit Website
                </a>
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </AuroraBackground>
  )
}
