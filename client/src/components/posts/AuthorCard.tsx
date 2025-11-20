'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDate, formatNumber } from '@/lib/utils'
import { Award, ShieldCheck } from 'lucide-react'

interface AuthorCardProps {
  author: any
  timestamp: string
  label?: string
  size?: 'sm' | 'md' | 'lg'
}

export function AuthorCard({ author, timestamp, label = 'asked', size = 'md' }: AuthorCardProps) {
  const initials = author?.username
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase() || 'U'

  const isVerifiedPro = author?.role && ['captain', 'engineer', 'surveyor', 'broker'].includes(author.role)

  const avatarSize = size === 'lg' ? 'h-12 w-12' : size === 'md' ? 'h-10 w-10' : 'h-8 w-8'
  const textSize = size === 'lg' ? 'text-base' : size === 'md' ? 'text-sm' : 'text-xs'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="p-4 md:p-6 rounded-xl bg-gray-100  border border-gray-200 hover:border-brand-blue/30 transition-all duration-200"
    >
      <div className="text-xs text-gray-900/50 mb-3">
        {label} {formatDate(timestamp)}
      </div>

      <Link href={`/profile/${author?.id}`} className="flex items-start gap-3 group">
        {/* Avatar with Gold Ring */}
        <div className="relative shrink-0">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-brand-blue to-brand-blue-light opacity-50 blur-sm"></div>
          <Avatar className={`${avatarSize} relative border-2 border-brand-blue/30`}>
            <AvatarImage src={author?.avatar_url} />
            <AvatarFallback className="bg-white text-gray-900">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Author Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`${textSize} font-semibold text-gray-900 group-hover:text-brand-blue transition-colors`}>
              {author?.username || 'Unknown'}
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

          {author?.reputation && (
            <div className="flex items-center gap-1 text-xs text-gray-900/60 mb-1">
              <Award className="h-3 w-3 text-brand-blue" />
              <span>{formatNumber(author.reputation)} reputation</span>
            </div>
          )}

          {author?.role && author.role !== 'user' && (
            <div className="text-[11px] text-brand-blue/70 capitalize">
              {author.role.replace('_', ' ')}
            </div>
          )}

          {author?.bio && (
            <p className="text-xs text-gray-900/50 mt-2 line-clamp-2">
              {author.bio}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  )
}
