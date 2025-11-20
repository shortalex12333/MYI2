'use client'

import { Share2, Flag, Bookmark } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PostActionsProps {
  postId: string
  authorId: string
  currentUserId?: string
}

export function PostActions({ postId, authorId, currentUserId }: PostActionsProps) {
  const isAuthor = currentUserId === authorId

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Share this post',
        url: window.location.href,
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {/* Share Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleShare}
        className="text-maritime-cream/60 hover:text-maritime-gold hover:bg-maritime-gold/10"
      >
        <Share2 className="h-4 w-4 mr-2" />
        Share
      </Button>

      {/* Bookmark Button */}
      <Button
        variant="ghost"
        size="sm"
        className="text-maritime-cream/60 hover:text-maritime-gold hover:bg-maritime-gold/10"
      >
        <Bookmark className="h-4 w-4 mr-2" />
        Save
      </Button>

      {/* Report Button (only if not author) */}
      {!isAuthor && (
        <Button
          variant="ghost"
          size="sm"
          className="text-maritime-cream/60 hover:text-red-400 hover:bg-red-400/10"
        >
          <Flag className="h-4 w-4 mr-2" />
          Report
        </Button>
      )}
    </div>
  )
}
