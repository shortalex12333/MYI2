'use client'

import { Users, Clock, ShieldCheck, MessageSquare } from 'lucide-react'
import { formatNumber } from '@/lib/utils'

interface PostsInfoBarProps {
  totalQuestions: number
  uniqueContributors?: number
  avgResponseTime?: string
  verifiedInsurers?: number
}

export function PostsInfoBar({
  totalQuestions,
  uniqueContributors = 234,
  avgResponseTime = '24h',
  verifiedInsurers = 12,
}: PostsInfoBarProps) {
  const stats = [
    {
      icon: MessageSquare,
      label: 'Total Questions',
      value: formatNumber(totalQuestions),
    },
    {
      icon: Users,
      label: 'Contributors',
      value: uniqueContributors.toString(),
    },
    {
      icon: Clock,
      label: 'Avg Response',
      value: avgResponseTime,
    },
    {
      icon: ShieldCheck,
      label: 'Verified Insurers',
      value: verifiedInsurers.toString(),
    },
  ]

  return (
    <div className="border-t border-maritime-gold/10 bg-maritime-navy-light/30 backdrop-blur-sm">
      <div className="py-4 px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((stat, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2">
              <stat.icon className="h-4 w-4 text-maritime-gold/70" />
              <div className="flex flex-col">
                <span className="text-lg font-semibold text-maritime-gold">
                  {stat.value}
                </span>
                <span className="text-xs text-maritime-cream/50">
                  {stat.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
