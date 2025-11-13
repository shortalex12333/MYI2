import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDate, formatNumber } from '@/lib/utils'
import { MessageSquare, Eye, CheckCircle2 } from 'lucide-react'
import { Post } from '@/types/database.types'

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
    <div className="flex gap-4 p-4 border-b last:border-b-0 hover:bg-accent/50 transition-colors">
      {/* Stats Column - Stack Overflow style */}
      <div className="flex flex-col gap-2 text-sm min-w-[100px] shrink-0 text-right">
        <div className="flex flex-col">
          <span className="font-semibold text-lg">{formatNumber(post.score)}</span>
          <span className="text-muted-foreground text-xs">votes</span>
        </div>
        <div className={`flex flex-col ${hasAcceptedAnswer ? 'text-green-600 dark:text-green-500' : ''}`}>
          <span className="font-semibold">{formatNumber(post.comments_count || 0)}</span>
          <span className="text-muted-foreground text-xs">answers</span>
        </div>
        <div className="flex flex-col">
          <span className="text-muted-foreground">{formatNumber(post.views)}</span>
          <span className="text-muted-foreground text-xs">views</span>
        </div>
      </div>

      {/* Content Column */}
      <div className="flex-1 min-w-0">
        {/* Title */}
        <Link href={`/posts/${post.id}`}>
          <h3 className="text-lg font-semibold mb-2 hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </h3>
        </Link>

        {/* Excerpt */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {post.body.substring(0, 200)}
          {post.body.length > 200 && '...'}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          {post.category && (
            <Badge variant="default" className="text-xs">
              {post.category.name}
            </Badge>
          )}
          {post.tags && post.tags.slice(0, 5).map((tag) => (
            <Badge key={tag.id} variant="secondary" className="text-xs">
              {tag.name}
            </Badge>
          ))}
        </div>

        {/* Author & Metadata */}
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Link
              href={`/profile/${post.author_id}`}
              className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
            >
              <Avatar className="h-5 w-5">
                <AvatarImage src={post.author?.avatar_url} />
                <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
              </Avatar>
              <span className="font-medium">{post.author?.username || 'Unknown'}</span>
            </Link>
            {post.author?.role && post.author.role !== 'user' && (
              <Badge variant="outline" className="text-[10px] h-4 px-1">
                {post.author.role.replace('_', ' ')}
              </Badge>
            )}
            {post.author?.reputation && (
              <span className="text-muted-foreground">
                {formatNumber(post.author.reputation)} rep
              </span>
            )}
          </div>
          <span className="text-muted-foreground">
            asked {formatDate(post.created_at)}
          </span>
        </div>
      </div>
    </div>
  )
}
