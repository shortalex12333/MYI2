'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Clock, TrendingUp, MessageSquare, AlertCircle } from 'lucide-react'

const filters = [
  { id: 'newest', label: 'Newest', icon: Clock },
  { id: 'hot', label: 'Hot', icon: TrendingUp },
  { id: 'active', label: 'Active', icon: MessageSquare },
  { id: 'unanswered', label: 'Unanswered', icon: AlertCircle },
]

export function PostsFilterBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentSort = searchParams.get('sort') || 'newest'

  const handleFilterChange = (filterId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', filterId)
    router.push(`/posts?${params.toString()}`)
  }

  return (
    <div className="relative">
      {/* Glassmorphism Container */}
      <div className="inline-flex items-center gap-2 p-1.5 rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
        {filters.map((filter) => {
          const isActive = currentSort === filter.id
          return (
            <button
              key={filter.id}
              onClick={() => handleFilterChange(filter.id)}
              className="relative px-4 py-2 rounded-full transition-all duration-300 group"
            >
              {/* Active Background */}
              {isActive && (
                <motion.div
                  layoutId="activeFilter"
                  className="absolute inset-0 bg-maritime-gold/20 border border-maritime-gold/50 rounded-full"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}

              {/* Content */}
              <div className="relative flex items-center gap-2">
                <filter.icon
                  className={`h-4 w-4 transition-colors ${
                    isActive ? 'text-maritime-gold' : 'text-maritime-cream/60 group-hover:text-maritime-gold'
                  }`}
                />
                <span
                  className={`text-sm font-medium transition-colors ${
                    isActive ? 'text-maritime-gold' : 'text-maritime-cream/70 group-hover:text-maritime-cream'
                  }`}
                >
                  {filter.label}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Decorative Underline */}
      <div className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-maritime-gold/30 to-transparent" />
    </div>
  )
}
