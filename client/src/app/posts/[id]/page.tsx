import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { formatDate, formatNumber } from '@/lib/utils'
import { Eye, Clock, Award } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { VotingButtons } from '@/components/posts/VotingButtons'
import { PostActions } from '@/components/posts/PostActions'

export default async function PostDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

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
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link href="/posts" className="hover:text-primary">Questions</Link>
          <span>/</span>
          {post.category && (
            <>
              <Link href={`/category/${post.category.slug}`} className="hover:text-primary">
                {post.category.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-foreground truncate">{post.title}</span>
        </div>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Asked {formatDate(post.created_at)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{formatNumber(post.views)} views</span>
            </div>
          </div>
        </div>

        {/* Question Section */}
        <div className="flex gap-6 mb-8">
          {/* Voting Column */}
          <div className="shrink-0">
            <VotingButtons initialScore={post.score} postId={post.id} />
          </div>

          {/* Content Column */}
          <div className="flex-1 min-w-0">
            {/* Question Body */}
            <div className="prose prose-slate max-w-none mb-6">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {post.body}
              </ReactMarkdown>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {post.category && (
                <Badge variant="default">
                  {post.category.name}
                </Badge>
              )}
              {post.tags && post.tags.map((tag: any) => (
                <Badge key={tag.id} variant="secondary">
                  {tag.name}
                </Badge>
              ))}
            </div>

            {/* Actions & Author Info */}
            <div className="flex items-start justify-between">
              <PostActions
                postId={post.id}
                authorId={post.author_id}
                currentUserId={user?.id}
              />

              {/* Author Card */}
              <Card className="p-4 w-64">
                <div className="text-xs text-muted-foreground mb-2">
                  asked {formatDate(post.created_at)}
                </div>
                <Link href={`/profile/${post.author_id}`} className="flex items-start gap-2 group">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={post.author?.avatar_url} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold group-hover:text-primary transition-colors">
                      {post.author?.username || 'Unknown'}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Award className="h-3 w-3" />
                      <span>{formatNumber(post.author?.reputation || 0)}</span>
                    </div>
                    {post.author?.role && post.author.role !== 'user' && (
                      <Badge variant="secondary" className="text-[10px] mt-1">
                        {post.author.role.replace('_', ' ')}
                      </Badge>
                    )}
                  </div>
                </Link>
              </Card>
            </div>
          </div>
        </div>

        {/* Answers Section */}
        <div className="border-t pt-6">
          <h2 className="text-2xl font-bold mb-6">
            {commentsData?.length || 0} {(commentsData?.length || 0) === 1 ? 'Answer' : 'Answers'}
          </h2>

          {/* Comment Form */}
          <div className="mb-6 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <Link href="/login" className="text-primary hover:underline font-medium">
                Log in
              </Link>{' '}
              to post an answer
            </p>
          </div>

          {/* Comments Thread */}
          {rootComments.length > 0 ? (
            <div className="space-y-6">
              {rootComments.map((comment) => (
                <div key={comment.id} className="flex gap-6 pb-6 border-b last:border-b-0">
                  <div className="shrink-0">
                    <VotingButtons initialScore={comment.score || 0} postId={comment.id} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="prose prose-sm max-w-none mb-4">
                      {comment.body}
                    </div>
                    <div className="flex items-center justify-between">
                      <PostActions
                        postId={comment.id}
                        authorId={comment.author_id}
                        currentUserId={user?.id}
                      />
                      <div className="text-xs text-muted-foreground">
                        answered {formatDate(comment.created_at)} by{' '}
                        <Link href={`/profile/${comment.author_id}`} className="text-primary hover:underline">
                          {comment.author?.username}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-12">
              No answers yet. Be the first to answer!
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
