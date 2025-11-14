import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PostCard } from '@/components/posts/PostCard'
import { formatDate } from '@/lib/utils'
import { Calendar, MessageSquare } from 'lucide-react'

export default async function UserProfilePage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  // Fetch user profile
  // @ts-ignore - Supabase type inference issue
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !profile) {
    notFound()
  }

  // Fetch user's posts
  // @ts-ignore - Supabase type inference issue
  const { data: postsData } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles!author_id(*),
      category:categories(*),
      tags:post_tags(tag:tags(*))
    `)
    .eq('author_id', params.id)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(20)

  // Flatten tags
  const posts = postsData?.map(post => ({
    ...post,
    tags: post.tags?.map((t: any) => t.tag) || [],
    comments_count: 0,
    reactions_count: { like: 0, helpful: 0, insightful: 0 }
  })) || []

  // Get counts
  // @ts-ignore - Supabase type inference issue
  const { count: totalPosts } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('author_id', params.id)
    .eq('status', 'published')

  // @ts-ignore - Supabase type inference issue
  const { count: totalComments } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('author_id', params.id)

  const initials = profile.username
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase() || 'U'

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Profile Header */}
        <div className="flex gap-6 mb-8">
          <Avatar className="h-24 w-24">
            <AvatarImage src={profile.avatar_url} />
            <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{profile.username}</h1>
              {profile.role && profile.role !== 'user' && (
                <Badge variant="secondary">
                  {profile.role.replace('_', ' ')}
                </Badge>
              )}
            </div>

            {profile.bio && (
              <p className="text-muted-foreground mb-4">{profile.bio}</p>
            )}

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Joined {formatDate(profile.created_at)}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                <span>{totalPosts || 0} posts</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                <span>{totalComments || 0} comments</span>
              </div>
            </div>
          </div>
        </div>

        {/* User's Posts */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Posts by {profile.username}</h2>

          {posts.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">
                This user hasn't posted anything yet.
              </p>
            </Card>
          ) : (
            <div className="border rounded-lg bg-card">
              {posts.map((post) => <PostCard key={post.id} post={post} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
