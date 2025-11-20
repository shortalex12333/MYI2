'use client'

import { motion } from 'framer-motion'
import { AuroraBackground } from '@/components/ui/aurora-background'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface CategoryDetailHeroProps {
  category: {
    name: string
    slug: string
    description?: string
    icon?: string
  }
}

// Maritime emoji mapping (reusing from CategoryCard)
const categoryEmojis: Record<string, string> = {
  claims: '⚖️',
  policies: '📋',
  regulations: '⚖️',
  maintenance: '🔧',
  safety: '🦺',
  general: '💬',
  engines: '⚓',
  repairs: '🛠',
  navigation: '🧭',
  insurance: '🛡',
  systems: '⚙️',
  weather: '🌊',
  equipment: '⚙️',
  crew: '👥',
  documentation: '📄',
}

export function CategoryDetailHero({ category }: CategoryDetailHeroProps) {
  const emoji = categoryEmojis[category.slug] || category.icon || '📌'

  return (
    <AuroraBackground className="relative min-h-[50vh] flex items-center justify-center">
      <div className="container mx-auto px-4 relative z-10">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className="mb-8"
        >
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 text-gray-900/70 hover:text-brand-blue transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm">Back to Categories</span>
          </Link>
        </motion.div>

        {/* Category Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, delay: 0.1 }}
          className="text-center mb-6"
        >
          <span className="text-7xl md:text-8xl" role="img" aria-label={category.name}>
            {emoji}
          </span>
        </motion.div>

        {/* Category Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.2 }}
          className="text-4xl md:text-6xl lg:text-7xl font-display font-semibold text-center mb-6 leading-tight"
        >
          <span className="text-brand-blue">{category.name}</span>
        </motion.h1>

        {/* Category Description */}
        {category.description && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.3 }}
            className="text-lg md:text-xl text-gray-900/70 text-center max-w-3xl mx-auto leading-relaxed"
          >
            {category.description}
          </motion.p>
        )}
      </div>
    </AuroraBackground>
  )
}
