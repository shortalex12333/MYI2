import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate, formatNumber } from '@/lib/utils'
import { ThumbsUp, ThumbsDown, Eye, Share2, MessageSquare } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { CommentThread } from '@/components/posts/CommentThread'

export default async function PostDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  // Fetch post
  const { data: postData, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles!author_id(*),
      category:categories(*),
      tags:post_tags(tag:tags(*)),
      company:companies(*),
      location:locations(*)
    `)
    .eq('id', params.id)
    .single()

  if (error || !postData) {
    notFound()
  }

  // Flatten tags
  const post = {
    ...postData,
    tags: postData.tags?.map((t: any) => t.tag) || []
  }

  // Fetch comments
  const { data: commentsData } = await supabase
    .from('comments')
    .select(`
      *,
      author:profiles!author_id(*)
    `)
    .eq('post_id', params.id)
    .order('created_at', { ascending: true })

  // Build threaded comment structure
  const commentMap = new Map()
  const rootComments: any[] = []

  commentsData?.forEach(comment => {
    commentMap.set(comment.id, { ...comment, replies: [] })
  })

  commentsData?.forEach(comment => {
    if (comment.parent_id) {
      const parent = commentMap.get(comment.parent_id)
      if (parent) {
        parent.replies.push(commentMap.get(comment.id))
      }
    } else {
      rootComments.push(commentMap.get(comment.id))
    }
  })

  const initials = post.author?.username
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'U'

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Post Header */}
        <div className="mb-6">
          {post.category && (
            <Badge variant="outline" className="mb-4">
              {post.category.name}
            </Badge>
          )}
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

          {/* Author Info */}
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={post.author?.avatar_url} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/profile/${post.author_id}`}
                  className="font-semibold hover:underline"
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
                Posted {formatDate(post.created_at)}
              </p>
            </div>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag: any) => (
                <Badge key={tag.id} variant="secondary">
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground border-y py-3">
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{formatNumber(post.views)} views</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              <span>{commentsData?.length || 0} comments</span>
            </div>
          </div>
        </div>

        {/* Post Content */}
        <div className="prose prose-slate max-w-none mb-8">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.body}
          </ReactMarkdown>
        </div>

        {/* Post Actions */}
        <div className="flex gap-2 mb-8 pb-8 border-b">
          <Button variant="outline" size="sm">
            <ThumbsUp className="h-4 w-4 mr-1" />
            Upvote ({formatNumber(post.score)})
          </Button>
          <Button variant="outline" size="sm">
            <ThumbsDown className="h-4 w-4 mr-1" />
            Downvote
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-1" />
            Share
          </Button>
        </div>

        {/* Comments Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6">
            Comments ({commentsData?.length || 0})
          </h2>

          {/* Comment Form */}
          <div className="mb-8">
            <p className="text-sm text-muted-foreground mb-4">
              <Link href="/login" className="text-primary hover:underline">
                Log in
              </Link>{' '}
              to comment
            </p>
          </div>

          {/* Comments Thread */}
          {rootComments.length > 0 ? (
            <CommentThread comments={rootComments} postId={params.id} />
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No comments yet. Be the first to comment!
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
