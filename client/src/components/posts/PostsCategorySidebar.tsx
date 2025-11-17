'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { GradientText } from '@/components/ui/gradient-text'

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
}

interface PostsCategorySidebarProps {
  categories: Category[]
}

const categoryEmojis: Record<string, string> = {
  claims: '⚓',
  policies: '📋',
  regulations: '⚖️',
  maintenance: '🔧',
  safety: '🦺',
  general: '💬',
}

export function PostsCategorySidebar({ categories }: PostsCategorySidebarProps) {
  return (
    <aside className="hidden lg:block space-y-4 sticky top-20">
      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">
          <GradientText>Categories</GradientText>
        </h2>
        <p className="text-sm text-maritime-cream/60">
          Browse by topic
        </p>
      </div>

      {/* Category Cards */}
      <div className="space-y-3">
        {categories?.map((category, idx) => {
          const emoji = categoryEmojis[category.slug] || '📌'

          return (
            <Link href={`/category/${category.slug}`} key={category.id}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                whileHover={{ x: 4, scale: 1.02 }}
                className="group p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-maritime-gold/50 transition-all duration-300 hover:shadow-lg hover:shadow-maritime-gold/10"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl" role="img" aria-label={category.name}>
                      {emoji}
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-maritime-cream group-hover:text-maritime-gold transition-colors">
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="text-xs text-maritime-cream/50 line-clamp-1 mt-0.5">
                          {category.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-maritime-gold/50 group-hover:text-maritime-gold group-hover:translate-x-1 transition-all" />
                </div>
              </motion.div>
            </Link>
          )
        })}
      </div>

      {/* Helpful Resources */}
      <div className="mt-8 p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
        <h3 className="text-sm font-semibold text-maritime-gold mb-4">
          Helpful Resources
        </h3>
        <div className="space-y-3 text-sm">
          <Link
            href="/faq"
            className="block text-maritime-cream/70 hover:text-maritime-gold transition-colors"
          >
            → FAQ & Guides
          </Link>
          <Link
            href="/companies"
            className="block text-maritime-cream/70 hover:text-maritime-gold transition-colors"
          >
            → Verified Companies
          </Link>
          <Link
            href="/contact"
            className="block text-maritime-cream/70 hover:text-maritime-gold transition-colors"
          >
            → Contact Support
          </Link>
        </div>
      </div>
    </aside>
  )
}
