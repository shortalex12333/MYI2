'use client'

import { motion } from 'framer-motion'
import { Users, ShieldCheck, Clock, MessageSquare } from 'lucide-react'
import { formatNumber } from '@/lib/utils'

interface CategoryStatsBarProps {
  totalCategories: number
  totalQuestions?: number
  verifiedExperts?: number
  avgResolutionTime?: string
}

export function CategoryStatsBar({
  totalCategories,
  totalQuestions = 4500,
  verifiedExperts = 89,
  avgResolutionTime = '24h',
}: CategoryStatsBarProps) {
  const stats = [
    {
      icon: MessageSquare,
      label: 'Categories',
      value: totalCategories.toString(),
    },
    {
      icon: Users,
      label: 'Total Questions',
      value: formatNumber(totalQuestions),
    },
    {
      icon: ShieldCheck,
      label: 'Verified Experts',
      value: verifiedExperts.toString(),
    },
    {
      icon: Clock,
      label: 'Avg Resolution',
      value: avgResolutionTime,
    },
  ]

  return (
    <section className="border-t border-brand-blue/10 bg-white-light/30 ">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.2, delay: idx * 0.1 }}
              className="group"
            >
              <stat.icon className="h-5 w-5 text-brand-blue mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <div className="text-2xl md:text-3xl font-display font-semibold text-brand-blue mb-1">
                {stat.value}
              </div>
              <div className="text-xs text-gray-900/60">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
