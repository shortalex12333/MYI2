'use client'

import { motion } from 'framer-motion'
import { Award, Clock, Globe, Shield } from 'lucide-react'

interface CompanyDetailStatsProps {
  verified: boolean
  type: string
}

export function CompanyDetailStats({ verified, type }: CompanyDetailStatsProps) {
  const stats = [
    {
      icon: Shield,
      label: 'Trust Rating',
      value: verified ? 'A+' : 'Verified',
      color: 'text-brand-blue',
    },
    {
      icon: Globe,
      label: 'Coverage',
      value: 'Global',
      color: 'text-gray-600',
    },
    {
      icon: Clock,
      label: 'Response Time',
      value: '< 24h',
      color: 'text-brand-blue',
    },
    {
      icon: Award,
      label: 'Service Type',
      value: type,
      color: 'text-brand-blue',
    },
  ]

  return (
    <section className="border-y border-brand-blue/10 bg-white-light/30 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.2, delay: idx * 0.1 }}
              className="text-center group"
            >
              <div className="flex flex-col items-center">
                <div className="mb-3 p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 group-hover:border-brand-blue/30 transition-all">
                  <stat.icon className={`h-6 w-6 ${stat.color} group-hover:scale-110 transition-transform`} />
                </div>
                <div className={`text-2xl md:text-3xl font-bold mb-1 ${stat.color}`}>
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
