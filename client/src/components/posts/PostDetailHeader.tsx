'use client'

import { motion } from 'framer-motion'
import { GradientText } from '@/components/ui/gradient-text'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatNumber } from '@/lib/utils'
import { Eye, Clock, MessageSquare, TrendingUp } from 'lucide-react'

interface PostDetailHeaderProps {
  title: string
  createdAt: string
  views: number
  answersCount: number
  score: number
  category?: { name: string; slug: string }
  tags?: Array<{ id: string; name: string }>
}

export function PostDetailHeader({
  title,
  createdAt,
  views,
  answersCount,
  score,
  category,
  tags,
}: PostDetailHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="border-b border-brand-blue/10 bg-white-light/30 pb-8 mb-8"
    >
      {/* Title */}
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight text-gray-900">
        {title}
      </h1>

      {/* Metadata Bar */}
      <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm text-gray-900/60 mb-6">
        <div className="flex items-center gap-1.5">
          <Clock className="h-4 w-4 text-brand-blue" />
          <span>Asked {formatDate(createdAt)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Eye className="h-4 w-4 text-brand-blue" />
          <span>{formatNumber(views)} views</span>
        </div>
        <div className="flex items-center gap-1.5">
          <MessageSquare className="h-4 w-4 text-brand-blue" />
          <span>{formatNumber(answersCount)} answers</span>
        </div>
        <div className="flex items-center gap-1.5">
          <TrendingUp className="h-4 w-4 text-brand-blue" />
          <span className="text-brand-blue font-semibold">{formatNumber(score)} votes</span>
        </div>
      </div>

      {/* Tags & Category */}
      <div className="flex flex-wrap gap-2">
        {category && (
          <Badge className="bg-brand-blue/20 border-brand-blue/40 text-brand-blue hover:bg-brand-blue/30">
            {category.name}
          </Badge>
        )}
        {tags?.map((tag) => (
          <Badge
            key={tag.id}
            variant="outline"
            className="border-brand-blue/30 text-gray-900/80 hover:border-brand-blue/60 hover:bg-brand-blue/10"
          >
            {tag.name}
          </Badge>
        ))}
      </div>
    </motion.div>
  )
}
