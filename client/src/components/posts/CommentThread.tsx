'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { formatDate } from '@/lib/utils'
import { ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react'
import { Comment } from '@/types/database.types'

interface CommentThreadProps {
  comments: Comment[]
  postId: string
  onReply?: (commentId: string, body: string) => Promise<void>
  onReact?: (commentId: string, type: 'like' | 'dislike') => Promise<void>
}

export function CommentThread({ comments, postId, onReply, onReact }: CommentThreadProps) {
  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          onReply={onReply}
          onReact={onReact}
        />
      ))}
    </div>
  )
}

interface CommentItemProps {
  comment: Comment
  depth?: number
  onReply?: (commentId: string, body: string) => Promise<void>
  onReact?: (commentId: string, type: 'like' | 'dislike') => Promise<void>
}

function CommentItem({ comment, depth = 0, onReply, onReact }: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const initials = comment.author?.username
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'U'

  const handleReply = async () => {
    if (!replyText.trim() || !onReply) return

    setIsSubmitting(true)
    try {
      await onReply(comment.id, replyText)
      setReplyText('')
      setIsReplying(false)
    } catch (error) {
      console.error('Failed to post reply:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReact = async (type: 'like' | 'dislike') => {
    if (!onReact) return
    try {
      await onReact(comment.id, type)
    } catch (error) {
      console.error('Failed to react:', error)
    }
  }

  return (
    <div className={depth > 0 ? 'ml-8 mt-4' : ''}>
      <div className="flex gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.author?.avatar_url} />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm">
              {comment.author?.username || 'Unknown'}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDate(comment.created_at)}
            </span>
          </div>
          <p className="text-sm mb-2 whitespace-pre-wrap">{comment.body}</p>

          <div className="flex items-center gap-4 text-sm">
            <button
              onClick={() => handleReact('like')}
              className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
            >
              <ThumbsUp className="h-4 w-4" />
              <span>{comment.reactions_count?.like || 0}</span>
            </button>
            <button
              onClick={() => handleReact('dislike')}
              className="flex items-center gap-1 text-muted-foreground hover:text-destructive transition-colors"
            >
              <ThumbsDown className="h-4 w-4" />
              <span>{comment.reactions_count?.dislike || 0}</span>
            </button>
            <button
              onClick={() => setIsReplying(!isReplying)}
              className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Reply</span>
            </button>
          </div>

          {isReplying && (
            <div className="mt-3 space-y-2">
              <Textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                rows={3}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleReply}
                  disabled={!replyText.trim() || isSubmitting}
                >
                  {isSubmitting ? 'Posting...' : 'Post Reply'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsReplying(false)
                    setReplyText('')
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Nested replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  depth={depth + 1}
                  onReply={onReply}
                  onReact={onReact}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
