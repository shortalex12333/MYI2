'use client'

import { motion } from 'framer-motion'
import { AuroraBackground } from '@/components/ui/aurora-background'
import { Mail, MessageCircle, Headphones } from 'lucide-react'

export function ContactHero() {
  return (
    <AuroraBackground className="relative min-h-[50vh] flex items-center justify-center">
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Icons */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center gap-4 mb-8"
          >
            {[Mail, MessageCircle, Headphones].map((Icon, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.1 }}
                className="p-4 rounded-lg bg-gray-100  border border-gray-200"
              >
                <Icon className="h-8 w-8 text-brand-blue" />
              </motion.div>
            ))}
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.2 }}
            className="text-4xl md:text-6xl lg:text-7xl font-display font-semibold mb-6"
          >
            <span className="text-brand-blue">Get in Touch</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.3 }}
            className="text-lg md:text-xl text-gray-900/70 max-w-3xl mx-auto leading-relaxed"
          >
            Have questions or feedback? We'd love to hear from you.
            Our team is here to help with all your yacht insurance needs.
          </motion.p>
        </div>
      </div>
    </AuroraBackground>
  )
}
