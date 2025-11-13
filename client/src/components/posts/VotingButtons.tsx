'use client'

import { useState } from 'react'
import { ChevronUp, ChevronDown, Bookmark } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VotingButtonsProps {
  initialScore: number
  postId: string
  isBookmarked?: boolean
}

export function VotingButtons({ initialScore, postId, isBookmarked = false }: VotingButtonsProps) {
  const [score, setScore] = useState(initialScore)
  const [voteState, setVoteState] = useState<'up' | 'down' | null>(null)
  const [bookmarked, setBookmarked] = useState(isBookmarked)

  const handleVote = async (type: 'up' | 'down') => {
    // TODO: implement API call
    if (voteState === type) {
      setVoteState(null)
      setScore(initialScore)
    } else {
      setVoteState(type)
      const delta = type === 'up' ? 1 : -1
      const previousDelta = voteState === 'up' ? -1 : voteState === 'down' ? 1 : 0
      setScore(score + delta + previousDelta)
    }
  }

  const handleBookmark = () => {
    // TODO: implement API call
    setBookmarked(!bookmarked)
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={() => handleVote('up')}
        className={cn(
          'p-2 rounded-full hover:bg-accent transition-colors',
          voteState === 'up' && 'text-primary bg-accent'
        )}
        aria-label="Upvote"
      >
        <ChevronUp className="h-8 w-8" strokeWidth={2} />
      </button>

      <span className="text-2xl font-semibold my-1">{score}</span>

      <button
        onClick={() => handleVote('down')}
        className={cn(
          'p-2 rounded-full hover:bg-accent transition-colors',
          voteState === 'down' && 'text-destructive bg-accent'
        )}
        aria-label="Downvote"
      >
        <ChevronDown className="h-8 w-8" strokeWidth={2} />
      </button>

      <button
        onClick={handleBookmark}
        className={cn(
          'p-2 rounded-full hover:bg-accent transition-colors mt-2',
          bookmarked && 'text-yellow-500'
        )}
        aria-label="Bookmark"
      >
        <Bookmark className={cn('h-6 w-6', bookmarked && 'fill-current')} />
      </button>
    </div>
  )
}
