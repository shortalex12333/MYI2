'use client'

import { motion } from 'framer-motion'
import { AuroraBackground } from '@/components/ui/aurora-background'
import { GradientText } from '@/components/ui/gradient-text'
import { Shield, Anchor, Award, Briefcase } from 'lucide-react'

export function CompaniesHero() {
  const insuranceIcons = [
    { Icon: Shield, label: 'Insurers' },
    { Icon: Anchor, label: 'Underwriters' },
    { Icon: Award, label: 'Surveyors' },
    { Icon: Briefcase, label: 'Brokers' },
  ]

  return (
    <AuroraBackground className="relative min-h-[70vh] flex items-center justify-center">
      <div className="container mx-auto px-4 relative z-10">
        {/* Maritime Insurance Emojis */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center gap-4 mb-8"
        >
          {['🛡', '⚓', '📄', '💼'].map((emoji, idx) => (
            <motion.span
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="text-5xl md:text-6xl"
              role="img"
            >
              {emoji}
            </motion.span>
          ))}
        </motion.div>

        {/* Main Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-4xl md:text-6xl lg:text-7xl font-bold text-center mb-6 leading-tight"
        >
          <GradientText>Trusted Yacht Insurers & Experts</GradientText>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-lg md:text-xl text-maritime-cream/70 text-center max-w-3xl mx-auto leading-relaxed mb-12"
        >
          Explore specialist insurers, underwriters, surveyors, and claims support
          trusted by yacht owners worldwide.
        </motion.p>

        {/* Service Icons Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-6 md:gap-8"
        >
          {insuranceIcons.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.5 + idx * 0.1 }}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 group-hover:border-maritime-gold/50 transition-all">
                <item.Icon className="h-6 w-6 text-maritime-gold group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-xs text-maritime-cream/60 group-hover:text-maritime-gold transition-colors">
                {item.label}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Gold Underline Rule */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 mx-auto w-32 h-1 bg-gradient-to-r from-transparent via-maritime-gold to-transparent"
        />
      </div>
    </AuroraBackground>
  )
}
