'use client'

import { motion } from 'framer-motion'
import { GradientText } from '@/components/ui/gradient-text'
import { AuroraBackground } from '@/components/ui/aurora-background'

export function CategoryHero() {
  return (
    <AuroraBackground className="relative min-h-[40vh] flex items-center justify-center">
      <div className="relative z-10 container mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
            All <GradientText>Categories</GradientText>
          </h1>
          <p className="text-xl md:text-2xl text-maritime-cream/70 max-w-3xl mx-auto leading-relaxed mb-8">
            Explore every domain in yacht insurance, engineering, maintenance and claims.
          </p>

          {/* Decorative Gold Underline */}
          <div className="flex justify-center">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '120px' }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="h-1 bg-gradient-to-r from-transparent via-maritime-gold to-transparent"
            />
          </div>
        </motion.div>
      </div>
    </AuroraBackground>
  )
}
