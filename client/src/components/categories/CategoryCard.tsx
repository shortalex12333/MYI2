'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
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
  const postCount = category.posts?.[0]?.count || 0

  return (
    <Link href={`/category/${category.slug}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.2, delay: index * 0.06, ease: 'easeOut' }}
        whileHover={{ y: -2 }}
        className="group relative h-full"
      >
        {/* Glassmorphism Card */}
        <div className="h-full p-6 md:p-8 rounded-lg bg-gray-100  border border-gray-200 hover:border-brand-blue/50 transition-all duration-200 hover: hover:shadow-brand-blue/10">
          {/* Animated Gold Bar on Hover */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-brand-blue rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

          {/* Top Section: Emoji + Arrow */}
          <div className="flex items-start justify-between mb-4">
            <span className="text-4xl" role="img" aria-label={category.name}>
              {emoji}
            </span>
            <ArrowRight className="h-5 w-5 text-brand-blue/50 group-hover:text-brand-blue group-hover:translate-x-1 transition-all" />
          </div>

          {/* Category Name */}
          <h3 className="text-xl md:text-2xl font-semibold mb-3">
            <span className="text-brand-blue">{category.name}</span>
          </h3>

          {/* Description */}
          {category.description && (
            <p className="text-sm md:text-base text-gray-900/60 leading-relaxed mb-4 line-clamp-2">
              {category.description}
            </p>
          )}

          {/* Post Count Badge */}
          <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
            <div className="px-3 py-1 rounded-full bg-brand-blue/10 border border-brand-blue/30">
              <span className="text-sm font-medium text-brand-blue">
                {postCount} {postCount === 1 ? 'post' : 'posts'}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
