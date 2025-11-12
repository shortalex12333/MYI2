import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDate, formatNumber } from '@/lib/utils'
import { MessageSquare, ThumbsUp, Eye, Share2 } from 'lucide-react'
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

  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.author?.avatar_url} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Link
                  href={`/profile/${post.author_id}`}
                  className="font-semibold hover:underline truncate"
                >
                  {post.author?.username || 'Unknown'}
                </Link>
                {post.author?.role && post.author.role !== 'user' && (
                  <Badge variant="secondary" className="text-xs">
                    {post.author.role.replace('_', ' ')}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {formatDate(post.created_at)}
              </p>
            </div>
          </div>
          {post.category && (
            <Badge variant="outline">{post.category.name}</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Link href={`/posts/${post.id}`}>
          <h3 className="text-xl font-semibold mb-2 hover:text-primary transition-colors">
            {post.title}
          </h3>
        </Link>
        <p className="text-muted-foreground line-clamp-3 mb-4">
          {post.body.substring(0, 200)}
          {post.body.length > 200 && '...'}
        </p>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag) => (
              <Badge key={tag.id} variant="secondary">
                {tag.name}
              </Badge>
            ))}
          </div>
        )}

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <ThumbsUp className="h-4 w-4" />
            <span>{formatNumber(post.score)}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            <span>{formatNumber(post.comments_count || 0)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>{formatNumber(post.views)}</span>
          </div>
          {post.reactions_count && post.reactions_count.share > 0 && (
            <div className="flex items-center gap-1">
              <Share2 className="h-4 w-4" />
              <span>{formatNumber(post.reactions_count.share)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
