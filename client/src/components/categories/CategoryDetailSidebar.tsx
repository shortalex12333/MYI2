'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { GradientText } from '@/components/ui/gradient-text'
import { Info, Tag, Folder } from 'lucide-react'

interface CategoryDetailSidebarProps {
  category: {
    name: string
    description?: string
    slug: string
  }
  relatedTags?: Array<{
    id: string
    name: string
    count?: number
  }>
  relatedCategories?: Array<{
    id: string
    name: string
    slug: string
    icon?: string
  }>
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

export function CategoryDetailSidebar({
  category,
  relatedTags = [],
  relatedCategories = [],
}: CategoryDetailSidebarProps) {
  return (
    <div className="space-y-6">
      {/* About This Category */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Info className="h-5 w-5 text-maritime-gold" />
          <h3 className="text-lg font-semibold">
            <GradientText>About This Category</GradientText>
          </h3>
        </div>
        <p className="text-sm text-maritime-cream/70 leading-relaxed">
          {category.description || `Browse all questions related to ${category.name} in the yacht insurance industry.`}
        </p>
      </motion.div>

      {/* Related Tags */}
      {relatedTags.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Tag className="h-5 w-5 text-maritime-gold" />
            <h3 className="text-lg font-semibold">
              <GradientText>Popular Tags</GradientText>
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {relatedTags.map((tag) => (
              <Link
                key={tag.id}
                href={`/posts?tag=${tag.id}`}
                className="group"
              >
                <span className="inline-block px-3 py-1.5 rounded-full bg-maritime-gold/10 border border-maritime-gold/20 text-maritime-gold text-xs hover:bg-maritime-gold/20 hover:border-maritime-gold/40 transition-all">
                  {tag.name}
                  {tag.count && (
                    <span className="ml-1.5 text-maritime-cream/40">
                      {tag.count}
                    </span>
                  )}
                </span>
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* Related Categories */}
      {relatedCategories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Folder className="h-5 w-5 text-maritime-gold" />
            <h3 className="text-lg font-semibold">
              <GradientText>Related Categories</GradientText>
            </h3>
          </div>
          <div className="space-y-2">
            {relatedCategories.map((relatedCat) => {
              const emoji = categoryEmojis[relatedCat.slug] || relatedCat.icon || '📌'
              return (
                <Link
                  key={relatedCat.id}
                  href={`/category/${relatedCat.slug}`}
                  className="group block"
                >
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:border-maritime-gold/50 hover:bg-white/10 transition-all">
                    <span className="text-2xl" role="img" aria-label={relatedCat.name}>
                      {emoji}
                    </span>
                    <span className="text-sm text-maritime-cream group-hover:text-maritime-gold transition-colors">
                      {relatedCat.name}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </motion.div>
      )}
    </div>
  )
}
