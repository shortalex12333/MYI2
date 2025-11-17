'use client'

import { motion } from 'framer-motion'
import { GradientText } from '@/components/ui/gradient-text'
import { Building2, Mail, Phone, MapPin, ExternalLink } from 'lucide-react'
import { Company } from '@/types/database.types'

interface CompanyDetailAboutProps {
  company: Company
}

export function CompanyDetailAbout({ company }: CompanyDetailAboutProps) {
  const typeDescriptions: Record<Company['type'], string> = {
    insurer: 'Provides comprehensive yacht insurance coverage for vessels worldwide.',
    broker: 'Connects yacht owners with the best insurance providers and policies.',
    provider: 'Offers specialized marine services and support for yacht owners.',
  }

  return (
    <section className="py-16 md:py-24 bg-maritime-navy relative">
      {/* Background Pattern */}
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
        <div className="max-w-4xl mx-auto">
          {/* About Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              <GradientText>About {company.name}</GradientText>
            </h2>

            <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-8">
              <p className="text-lg text-maritime-cream/80 leading-relaxed mb-6">
                {company.description || typeDescriptions[company.type]}
              </p>

              {/* Company Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 pt-8 border-t border-white/10">
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-maritime-gold mt-1" />
                  <div>
                    <div className="text-sm text-maritime-cream/60 mb-1">Company Type</div>
                    <div className="text-maritime-cream font-medium capitalize">{company.type}</div>
                  </div>
                </div>

                {company.website && (
                  <div className="flex items-start gap-3">
                    <ExternalLink className="h-5 w-5 text-maritime-gold mt-1" />
                    <div>
                      <div className="text-sm text-maritime-cream/60 mb-1">Website</div>
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-maritime-gold hover:text-maritime-gold-light transition-colors"
                      >
                        Visit Website
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Specialties / Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="text-2xl md:text-3xl font-bold mb-6">
              <GradientText>Services & Expertise</GradientText>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                'Comprehensive Hull & Machinery Coverage',
                'Protection & Indemnity (P&I)',
                'Crew Insurance',
                'Loss of Charter Coverage',
                'Worldwide Navigation',
                'Claims Support & Management',
              ].map((service, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/10 hover:border-maritime-gold/30 transition-all group"
                >
                  <div className="w-2 h-2 rounded-full bg-maritime-gold group-hover:scale-125 transition-transform" />
                  <span className="text-maritime-cream/80 group-hover:text-maritime-gold transition-colors">
                    {service}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
