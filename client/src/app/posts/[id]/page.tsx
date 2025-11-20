import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { PostDetailHeader } from '@/components/posts/PostDetailHeader'
import { AuthorCard } from '@/components/posts/AuthorCard'
import { AnswerCard } from '@/components/posts/AnswerCard'
import { PostActions } from '@/components/posts/PostActions'
import { VotingButtons } from '@/components/posts/VotingButtons'
import { ChevronRight, Plus } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

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

  // Fetch comments/answers
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

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Premium Breadcrumb Section */}
      <section className="border-b border-brand-blue/10 bg-white-light/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-900/60">
            <Link href="/posts" className="hover:text-brand-blue transition-colors">
              Questions
            </Link>
            <ChevronRight className="h-4 w-4" />
            {post.category && (
              <>
                <Link
                  href={`/category/${post.category.slug}`}
                  className="hover:text-brand-blue transition-colors"
                >
                  {post.category.name}
                </Link>
                <ChevronRight className="h-4 w-4" />
              </>
            )}
            <span className="text-gray-900/80 truncate max-w-xs md:max-w-md">
              {post.title}
            </span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 md:py-12 relative">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(212, 175, 55, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(212, 175, 55, 0.1) 1px, transparent 1px)`,
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto">
            {/* Post Header */}
            <PostDetailHeader
              title={post.title}
              createdAt={post.created_at}
              views={post.views}
              answersCount={commentsData?.length || 0}
              score={post.score}
              category={post.category}
              tags={post.tags}
            />

            {/* Question Section */}
            <div className="mb-12">
              <div className="flex gap-6">
                {/* Voting Column */}
                <div className="shrink-0 hidden md:block">
                  <VotingButtons initialScore={post.score} postId={post.id} />
                </div>

                {/* Content Column */}
                <div className="flex-1 min-w-0">
                  {/* Question Body - Premium Styling */}
                  <div className="p-6 md:p-8 rounded-lg bg-gray-100  border border-gray-200 mb-6">
                    <div className="prose prose-invert prose-maritime max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ children }) => <p className="text-gray-900/80 leading-relaxed mb-4">{children}</p>,
                          h1: ({ children }) => <h1 className="text-gray-900 font-bold mb-4">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-gray-900 font-bold mb-3">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-gray-900 font-semibold mb-2">{children}</h3>,
                          ul: ({ children }) => <ul className="text-gray-900/80 list-disc pl-6 mb-4">{children}</ul>,
                          ol: ({ children }) => <ol className="text-gray-900/80 list-decimal pl-6 mb-4">{children}</ol>,
                          li: ({ children }) => <li className="mb-1">{children}</li>,
                          a: ({ href, children }) => (
                            <a href={href} className="text-brand-blue hover:text-brand-blue-light underline">
                              {children}
                            </a>
                          ),
                          code: ({ children }) => (
                            <code className="px-2 py-1 rounded bg-white-light text-brand-blue text-sm">
                              {children}
                            </code>
                          ),
                          pre: ({ children }) => (
                            <pre className="p-4 rounded-lg bg-white-light border border-brand-blue/20 overflow-x-auto mb-4">
                              {children}
                            </pre>
                          ),
                        }}
                      >
                        {post.body}
                      </ReactMarkdown>
                    </div>
                  </div>

                  {/* Actions & Author Row */}
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    {/* Actions */}
                    <PostActions
                      postId={post.id}
                      authorId={post.author_id}
                      currentUserId={user?.id}
                    />

                    {/* Author Card */}
                    <div className="md:w-80">
                      <AuthorCard
                        author={post.author}
                        timestamp={post.created_at}
                        label="asked"
                        size="md"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-brand-blue/30 to-transparent mb-12" />

            {/* Answers Section */}
            <div>
              {/* Answers Header */}
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl md:text-4xl font-display font-semibold">
                  {commentsData?.length || 0}{' '}
                  <GradientText>
                    {(commentsData?.length || 0) === 1 ? 'Answer' : 'Answers'}
                  </GradientText>
                </h2>

                {/* Sort Options - Future Enhancement */}
                {/* <div className="text-sm text-gray-900/60">
                  Sort: Newest | Votes | Active
                </div> */}
              </div>

              {/* Answer Form Prompt */}
              {user ? (
                <div className="mb-8 p-6 rounded-lg bg-brand-blue/10 border border-brand-blue/30 ">
                  <p className="text-gray-900/80 mb-4">
                    Share your expertise with the community
                  </p>
                  <Button
                    size="lg"
                    className="bg-brand-blue hover:bg-brand-blue/90 text-white font-semibold"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Write an Answer
                  </Button>
                </div>
              ) : (
                <div className="mb-8 p-6 rounded-lg bg-gray-100  border border-gray-200">
                  <p className="text-gray-900/70">
                    <Link href="/login" className="text-brand-blue hover:text-brand-blue-light font-semibold underline">
                      Log in
                    </Link>{' '}
                    to post an answer
                  </p>
                </div>
              )}

              {/* Answers List */}
              {rootComments.length > 0 ? (
                <div className="space-y-6">
                  {rootComments.map((comment, index) => (
                    <AnswerCard
                      key={comment.id}
                      answer={comment}
                      index={index}
                      currentUserId={user?.id}
                      isAccepted={false} // TODO: implement accepted answer logic
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="inline-block p-8 rounded-lg bg-gray-100  border border-gray-200">
                    <p className="text-xl text-gray-900/70 mb-4">
                      No answers yet. Be the first to answer!
                    </p>
                    {user && (
                      <Button
                        size="lg"
                        className="bg-brand-blue hover:bg-brand-blue/90 text-white font-semibold"
                      >
                        <Plus className="mr-2 h-5 w-5" />
                        Write an Answer
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
