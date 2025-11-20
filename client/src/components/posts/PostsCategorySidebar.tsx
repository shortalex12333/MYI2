'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

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

export function PostsCategorySidebar({ categories }: PostsCategorySidebarProps) {
  return (
    <aside className="hidden lg:block space-y-4 sticky top-20">
      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-display font-semibold mb-2">
          <span className="text-brand-blue">Categories</span>
        </h2>
        <p className="text-sm text-gray-600">
          Browse by topic
        </p>
      </div>

      {/* Category Cards */}
      <div className="space-y-3">
        {categories?.map((category, idx) => {
          return (
            <Link href={`/category/${category.slug}`} key={category.id}>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.05 }}
                whileHover={{ x: 2 }}
                className="group p-4 rounded-lg bg-white border border-gray-200 hover:border-brand-blue transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 group-hover:text-brand-blue transition-colors">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                        {category.description}
                      </p>
                    )}
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-brand-blue group-hover:translate-x-1 transition-all duration-200" />
                </div>
              </motion.div>
            </Link>
          )
        })}
      </div>

      {/* Helpful Resources */}
      <div className="mt-8 p-6 rounded-lg bg-gray-50 border border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 mb-4">
          Helpful Resources
        </h3>
        <div className="space-y-3 text-sm">
          <Link
            href="/faq"
            className="block text-gray-600 hover:text-brand-blue transition-colors duration-200"
          >
            → FAQ & Guides
          </Link>
          <Link
            href="/companies"
            className="block text-gray-600 hover:text-brand-blue transition-colors duration-200"
          >
            → Verified Companies
          </Link>
          <Link
            href="/contact"
            className="block text-gray-600 hover:text-brand-blue transition-colors duration-200"
          >
            → Contact Support
          </Link>
        </div>
      </div>
    </aside>
  )
}
