'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Share2, Edit, Bell, BellOff } from 'lucide-react'

interface PostActionsProps {
  postId: string
  authorId: string
  currentUserId?: string
  isFollowing?: boolean
}

export function PostActions({ postId, authorId, currentUserId, isFollowing = false }: PostActionsProps) {
  const router = useRouter()
  const [following, setFollowing] = useState(isFollowing)
  const [isSharing, setIsSharing] = useState(false)

  const isOwner = currentUserId === authorId

  const handleShare = async () => {
    setIsSharing(true)
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Share this post',
          url: window.location.href,
        })
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href)
        alert('Link copied to clipboard!')
      }
    } catch (error) {
      // User cancelled share or error occurred
      console.error('Share failed:', error)
    } finally {
      setIsSharing(false)
    }
  }

  const handleEdit = () => {
    if (!currentUserId) {
      router.push('/login')
      return
    }
    router.push(`/posts/${postId}/edit`)
  }

  const handleFollow = async () => {
    if (!currentUserId) {
      router.push('/login')
      return
    }

    try {
      const response = await fetch(`/api/v1/posts/${postId}/follow`, {
        method: following ? 'DELETE' : 'POST',
      })

      if (response.ok) {
        setFollowing(!following)
      }
    } catch (error) {
      console.error('Follow action failed:', error)
    }
  }

  return (
    <div className="flex gap-2">
      <Button variant="ghost" size="sm" onClick={handleShare} disabled={isSharing}>
        <Share2 className="h-4 w-4 mr-1" />
        Share
      </Button>
      {isOwner && (
        <Button variant="ghost" size="sm" onClick={handleEdit}>
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </Button>
      )}
      <Button variant="ghost" size="sm" onClick={handleFollow}>
        {following ? (
          <>
            <BellOff className="h-4 w-4 mr-1" />
            Unfollow
          </>
        ) : (
          <>
            <Bell className="h-4 w-4 mr-1" />
            Follow
          </>
        )}
      </Button>
    </div>
  )
}
