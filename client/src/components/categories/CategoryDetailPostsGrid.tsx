'use client'

import { PostPreviewCard } from '@/components/posts/PostPreviewCard'
import { GradientText } from '@/components/ui/gradient-text'
import { Post } from '@/types/database.types'

interface CategoryDetailPostsGridProps {
  posts: Post[]
  categoryName: string
}

export function CategoryDetailPostsGrid({ posts, categoryName }: CategoryDetailPostsGridProps) {
  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="border-b border-white/10 pb-4">
        <h2 className="text-2xl md:text-3xl font-semibold">
          <GradientText>Questions in {categoryName}</GradientText>
        </h2>
        <p className="text-sm text-maritime-cream/60 mt-2">
          {posts.length} {posts.length === 1 ? 'question' : 'questions'} in this category
        </p>
      </div>

      {/* Posts Grid */}
      {posts.length === 0 ? (
        <div className="py-16 text-center">
          <div className="inline-block p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
            <p className="text-lg text-maritime-cream/70">
              No questions in this category yet.
            </p>
            <p className="text-sm text-maritime-cream/50 mt-2">
              Be the first to ask a question!
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post, index) => (
            <PostPreviewCard key={post.id} post={post} index={index} />
          ))}
        </div>
      )}
    </div>
  )
}
