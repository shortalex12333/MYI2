'use client'

import { motion } from 'framer-motion'
import { MessageSquare, Clock, Users, TrendingUp } from 'lucide-react'
import { formatNumber } from '@/lib/utils'

interface CategoryDetailStatsProps {
  totalQuestions: number
  avgResponseTime?: string
  verifiedExperts?: number
  engagementLevel?: string
}

export function CategoryDetailStats({
  totalQuestions,
  avgResponseTime = '24h',
  verifiedExperts = 12,
  engagementLevel = 'High',
}: CategoryDetailStatsProps) {
  const stats = [
    {
      icon: MessageSquare,
      label: 'Total Questions',
      value: formatNumber(totalQuestions),
      color: 'text-brand-blue',
    },
    {
      icon: Clock,
      label: 'Avg Response Time',
      value: avgResponseTime,
      color: 'text-gray-600',
    },
    {
      icon: Users,
      label: 'Verified Experts',
      value: verifiedExperts.toString(),
      color: 'text-brand-blue',
    },
    {
      icon: TrendingUp,
      label: 'Engagement',
      value: engagementLevel,
      color: 'text-brand-blue',
    },
  ]

  return (
    <section className="border-y border-brand-blue/10 bg-white-light/30 ">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.2, delay: idx * 0.1 }}
              className="group text-center"
            >
              <div className="flex flex-col items-center">
                <div className="mb-3 p-3 rounded-lg bg-gray-100  border border-gray-200 group-hover:border-brand-blue/30 transition-all">
                  <stat.icon className={`h-6 w-6 ${stat.color} group-hover:scale-110 transition-transform`} />
                </div>
                <div className={`text-2xl md:text-3xl font-display font-semibold mb-1 ${stat.color}`}>
                  {stat.value}
                </div>
                <div className="text-xs md:text-sm text-gray-900/60">
                  {stat.label}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
