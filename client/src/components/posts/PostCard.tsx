'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDate, formatNumber } from '@/lib/utils'
import { MessageSquare, Eye, CheckCircle2, TrendingUp } from 'lucide-react'
import { Post } from '@/types/database.types'
import { motion } from 'framer-motion'

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  const initials = post.author?.username
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'U'

  const hasAcceptedAnswer = false // TODO: implement accepted answer logic

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative"
    >
      {/* Premium Glassmorphism Card with 3D Effect */}
      <Link href={`/posts/${post.id}`}>
        <div className="relative overflow-hidden rounded-xl backdrop-blur-sm bg-card/50 border border-border/50 hover:border-maritime-gold/40 transition-all duration-500 hover:shadow-lg hover:shadow-maritime-gold/10 p-5">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-maritime-gold/[0.02] via-transparent to-maritime-teal/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          {/* Gold accent bar - appears on hover */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-maritime-gold via-maritime-gold-light to-maritime-gold scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-top"></div>

          <div className="relative z-10 flex gap-6">
            {/* Stats Column - Premium Yacht Command Center Style */}
            <div className="flex flex-col gap-3 min-w-[90px] shrink-0">
              {/* Votes */}
              <div className="flex flex-col items-center p-2 rounded-lg bg-background/50 border border-border/30">
                <TrendingUp className="h-4 w-4 text-maritime-gold/70 mb-1" />
                <span className="font-bold text-lg">{formatNumber(post.score)}</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wide">votes</span>
              </div>

              {/* Answers */}
              <div className={`flex flex-col items-center p-2 rounded-lg border transition-colors ${
                hasAcceptedAnswer
                  ? 'bg-maritime-gold/10 border-maritime-gold/30 text-maritime-gold'
                  : 'bg-background/50 border-border/30'
              }`}>
                <MessageSquare className="h-4 w-4 mb-1" />
                <span className="font-bold">{formatNumber(post.comments_count || 0)}</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wide">answers</span>
              </div>

              {/* Views */}
              <div className="flex flex-col items-center p-2 rounded-lg bg-background/30">
                <Eye className="h-3 w-3 text-muted-foreground/50 mb-1" />
                <span className="text-sm text-muted-foreground">{formatNumber(post.views)}</span>
                <span className="text-[9px] text-muted-foreground/70 uppercase tracking-wide">views</span>
              </div>
            </div>

            {/* Content Column */}
            <div className="flex-1 min-w-0">
              {/* Title - Premium Typography */}
              <h3 className="text-lg font-semibold mb-3 group-hover:text-maritime-gold transition-colors line-clamp-2 leading-snug">
                {post.title}
              </h3>

              {/* Excerpt - Elegant Spacing */}
              <p className="text-sm text-muted-foreground/80 line-clamp-2 mb-4 leading-relaxed">
                {post.body.substring(0, 200)}
                {post.body.length > 200 && '...'}
              </p>

              {/* Tags - Maritime Badge Style */}
              <div className="flex flex-wrap gap-2 mb-4">
                {post.category && (
                  <Badge
                    variant="default"
                    className="text-xs bg-maritime-gold/20 text-maritime-gold border-maritime-gold/30 hover:bg-maritime-gold/30 transition-colors"
                  >
                    {post.category.name}
                  </Badge>
                )}
                {post.tags && post.tags.slice(0, 4).map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="secondary"
                    className="text-xs border-border/50 hover:border-maritime-teal/50 hover:bg-maritime-teal/10 transition-colors"
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>

              {/* Author & Metadata - Crew Profile Style */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-border/30">
                <div className="flex items-center gap-2.5">
                  <Link
                    href={`/profile/${post.author_id}`}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity group/author"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Avatar className="h-6 w-6 ring-2 ring-maritime-gold/20 group-hover/author:ring-maritime-gold/40 transition-all">
                      <AvatarImage src={post.author?.avatar_url} />
                      <AvatarFallback className="text-[10px] bg-maritime-navy text-maritime-cream">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-xs font-medium leading-none mb-0.5">
                        {post.author?.username || 'Unknown'}
                      </span>
                      {post.author?.reputation && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-maritime-gold"></span>
                          {formatNumber(post.author.reputation)} rep
                        </span>
                      )}
                    </div>
                  </Link>
                  {post.author?.role && post.author.role !== 'user' && (
                    <Badge
                      variant="outline"
                      className="text-[9px] h-4 px-1.5 border-maritime-gold/40 text-maritime-gold bg-maritime-gold/5"
                    >
                      {post.author.role.replace('_', ' ')}
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground/70 whitespace-nowrap">
                  {formatDate(post.created_at)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
