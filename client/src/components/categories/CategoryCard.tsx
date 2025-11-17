'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { GradientText } from '@/components/ui/gradient-text'
import { ArrowRight } from 'lucide-react'

interface CategoryCardProps {
  category: {
    id: string
    name: string
    slug: string
    description?: string
    icon?: string
    posts?: Array<{ count: number }>
  }
  index?: number
}

// Maritime emoji mapping
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

export function CategoryCard({ category, index = 0 }: CategoryCardProps) {
  const emoji = categoryEmojis[category.slug] || category.icon || '📌'
  const postCount = category.posts?.[0]?.count || 0

  return (
    <Link href={`/category/${category.slug}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: index * 0.06, ease: 'easeOut' }}
        whileHover={{ y: -4, scale: 1.02 }}
        className="group relative h-full"
      >
        {/* Glassmorphism Card */}
        <div className="h-full p-6 md:p-8 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-maritime-gold/50 transition-all duration-300 hover:shadow-lg hover:shadow-maritime-gold/10">
          {/* Animated Gold Bar on Hover */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-maritime-gold rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Top Section: Emoji + Arrow */}
          <div className="flex items-start justify-between mb-4">
            <span className="text-4xl" role="img" aria-label={category.name}>
              {emoji}
            </span>
            <ArrowRight className="h-5 w-5 text-maritime-gold/50 group-hover:text-maritime-gold group-hover:translate-x-1 transition-all" />
          </div>

          {/* Category Name */}
          <h3 className="text-xl md:text-2xl font-semibold mb-3">
            <GradientText>{category.name}</GradientText>
          </h3>

          {/* Description */}
          {category.description && (
            <p className="text-sm md:text-base text-maritime-cream/60 leading-relaxed mb-4 line-clamp-2">
              {category.description}
            </p>
          )}

          {/* Post Count Badge */}
          <div className="flex items-center gap-2 pt-4 border-t border-white/10">
            <div className="px-3 py-1 rounded-full bg-maritime-gold/10 border border-maritime-gold/30">
              <span className="text-sm font-medium text-maritime-gold">
                {postCount} {postCount === 1 ? 'post' : 'posts'}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
