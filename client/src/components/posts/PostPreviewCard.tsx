'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDate, formatNumber } from '@/lib/utils'
import { MessageSquare, Eye, TrendingUp, Award, ShieldCheck } from 'lucide-react'
import { Post } from '@/types/database.types'

interface PostPreviewCardProps {
  post: Post
  index?: number
}

export function PostPreviewCard({ post, index = 0 }: PostPreviewCardProps) {
  const initials = post.author?.username
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'U'

  const hasAcceptedAnswer = false // TODO: implement accepted answer logic
  const isVerifiedPro = post.author?.role && ['captain', 'engineer', 'surveyor', 'broker'].includes(post.author.role)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05, ease: 'easeOut' }}
      whileHover={{ y: -2 }}
      className="group"
    >
      <Link href={`/posts/${post.id}`}>
        <div className="relative rounded-xl bg-gray-100  border border-gray-200 hover:border-brand-blue/50 transition-all duration-200 hover:shadow-lg hover:shadow-brand-blue/10 p-6">
          {/* Premium Header Bar */}
          <div className="flex items-center justify-between mb-4 text-xs text-gray-900/60">
            <div className="flex items-center gap-3">
              {post.category && (
                <span className="px-3 py-1 rounded-full border border-brand-blue/30 text-brand-blue bg-brand-blue/5 font-medium">
                  {post.category.name}
                </span>
              )}
              <span>{formatDate(post.created_at)}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                <span>{formatNumber(post.views)}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5" />
                <span>{formatNumber(post.comments_count || 0)}</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5 text-brand-blue" />
                <span className="text-brand-blue font-semibold">{formatNumber(post.score)}</span>
              </div>
            </div>
          </div>

          {/* Title - Editorial Style */}
          <h3 className="text-xl md:text-2xl font-semibold mb-3 text-gray-900 group-hover:text-brand-blue transition-colors leading-tight line-clamp-2">
            {post.title}
          </h3>

          {/* Excerpt */}
          <p className="text-gray-900/60 leading-relaxed mb-4 line-clamp-2 text-sm md:text-base">
            {post.body.substring(0, 180)}
            {post.body.length > 180 && '...'}
          </p>

          {/* Tags Row */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag.id}
                  className="px-3 py-1 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue text-xs hover:bg-brand-blue/20 transition-colors"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          {/* Author Row - Premium */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              {/* Avatar with Gold Ring */}
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-brand-blue to-brand-blue-light opacity-50 blur-sm"></div>
                <Avatar className="h-8 w-8 relative border-2 border-brand-blue/30">
                  <AvatarImage src={post.author?.avatar_url} />
                  <AvatarFallback className="text-xs bg-white text-gray-900">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Author Info */}
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">
                    {post.author?.username || 'Unknown'}
                  </span>
                  {isVerifiedPro && (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-blue/10 border border-brand-blue/30">
                      <ShieldCheck className="h-3 w-3 text-brand-blue" />
                      <span className="text-[10px] text-brand-blue font-medium uppercase">
                        Verified Pro
                      </span>
                    </div>
                  )}
                </div>
                {post.author?.reputation && (
                  <div className="flex items-center gap-1 text-xs text-gray-900/60">
                    <Award className="h-3 w-3 text-brand-blue" />
                    <span>{formatNumber(post.author.reputation)} reputation</span>
                  </div>
                )}
              </div>
            </div>

            {/* Answer Status */}
            {hasAcceptedAnswer && (
              <div className="flex items-center gap-1 text-xs text-brand-blue">
                <ShieldCheck className="h-4 w-4" />
                <span className="font-medium">Answered</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
