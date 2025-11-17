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
      transition={{ duration: 0.5 }}
      className="border-b border-maritime-gold/10 bg-maritime-navy-light/30 pb-8 mb-8"
    >
      {/* Title */}
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight text-maritime-cream">
        {title}
      </h1>

      {/* Metadata Bar */}
      <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm text-maritime-cream/60 mb-6">
        <div className="flex items-center gap-1.5">
          <Clock className="h-4 w-4 text-maritime-gold" />
          <span>Asked {formatDate(createdAt)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Eye className="h-4 w-4 text-maritime-gold" />
          <span>{formatNumber(views)} views</span>
        </div>
        <div className="flex items-center gap-1.5">
          <MessageSquare className="h-4 w-4 text-maritime-gold" />
          <span>{formatNumber(answersCount)} answers</span>
        </div>
        <div className="flex items-center gap-1.5">
          <TrendingUp className="h-4 w-4 text-maritime-gold" />
          <span className="text-maritime-gold font-semibold">{formatNumber(score)} votes</span>
        </div>
      </div>

      {/* Tags & Category */}
      <div className="flex flex-wrap gap-2">
        {category && (
          <Badge className="bg-maritime-gold/20 border-maritime-gold/40 text-maritime-gold hover:bg-maritime-gold/30">
            {category.name}
          </Badge>
        )}
        {tags?.map((tag) => (
          <Badge
            key={tag.id}
            variant="outline"
            className="border-maritime-gold/30 text-maritime-cream/80 hover:border-maritime-gold/60 hover:bg-maritime-gold/10"
          >
            {tag.name}
          </Badge>
        ))}
      </div>
    </motion.div>
  )
}
