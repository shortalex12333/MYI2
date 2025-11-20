'use client'

import { motion } from 'framer-motion'
import { Shield, Award, Globe, Clock, Star, CheckCircle } from 'lucide-react'

const badges = [
  { icon: Shield, label: 'A-Rated Underwriters', color: 'text-brand-blue' },
  { icon: Award, label: "Lloyd's Approved", color: 'text-brand-blue' },
  { icon: Star, label: 'Superyacht Specialist', color: 'text-brand-blue' },
  { icon: Clock, label: '30+ Years Experience', color: 'text-gray-600' },
  { icon: Globe, label: 'Global Coverage', color: 'text-gray-600' },
  { icon: CheckCircle, label: 'Verified Partners', color: 'text-brand-blue' },
]

export function TrustedBadges() {
  return (
    <section className="py-12 md:py-16 bg-white-light/20 border-y border-brand-blue/10 overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.2 }}
          className="text-center text-sm uppercase tracking-wider text-brand-blue/70 mb-8"
        >
          Trusted by the World's Leading Yacht Owners
        </motion.h3>

        {/* Badges Ribbon */}
        <div className="relative">
          <div className="flex items-center gap-6 md:gap-8 justify-center flex-wrap">
            {badges.map((badge, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.2, delay: idx * 0.1 }}
                className="group"
              >
                <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-gray-100  border border-gray-200 hover:border-brand-blue/40 transition-all hover:bg-gray-100">
                  <badge.icon className={`h-5 w-5 ${badge.color} group-hover:scale-110 transition-transform`} />
                  <span className="text-sm text-gray-900/80 group-hover:text-brand-blue transition-colors whitespace-nowrap">
                    {badge.label}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Subtle Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-blue/5 to-transparent pointer-events-none" />
        </div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.2, delay: 0.6 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-8 md:gap-12"
        >
          {[
            { value: '150+', label: 'Verified Providers' },
            { value: '50+', label: 'Countries' },
            { value: '$2B+', label: 'Coverage Issued' },
          ].map((stat, idx) => (
            <div key={idx} className="text-center">
              <div className="text-2xl md:text-3xl font-display font-semibold text-brand-blue mb-1">
                {stat.value}
              </div>
              <div className="text-xs md:text-sm text-gray-900/60">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
