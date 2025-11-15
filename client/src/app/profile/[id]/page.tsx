import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PostCard } from '@/components/posts/PostCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { MapPin, Calendar, Link2 } from 'lucide-react'

export default async function UserProfilePage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">User Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The user profile you're looking for doesn't exist.
        </p>
        <Button asChild>
          <Link href="/posts">Browse Posts</Link>
        </Button>
      </div>
    )
  }

  // Fetch user's posts
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

  // Get stats
  const { count: totalPosts } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('author_id', params.id)
    .eq('status', 'published')

  const { count: totalComments } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('author_id', params.id)

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex gap-6">
        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Profile Header */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile.avatar_url || ''} />
                  <AvatarFallback>
                    {profile.full_name?.[0]?.toUpperCase() || profile.email?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold mb-1">
                    {profile.full_name || 'Anonymous User'}
                  </h1>
                  <p className="text-muted-foreground mb-3">
                    {profile.role || 'Member'}
                  </p>
                  {profile.bio && (
                    <p className="text-sm mb-3">{profile.bio}</p>
                  )}
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    {profile.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {profile.location}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </div>
                    {profile.website && (
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-primary"
                      >
                        <Link2 className="h-4 w-4" />
                        Website
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Posts Section */}
          <div className="mb-4">
            <h2 className="text-xl font-bold">Posts by {profile.full_name || 'this user'}</h2>
            <p className="text-sm text-muted-foreground">
              {totalPosts || 0} {totalPosts === 1 ? 'post' : 'posts'}
            </p>
          </div>

          <div className="border rounded-lg bg-card">
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  This user hasn't posted anything yet.
                </p>
              </div>
            ) : (
              posts.map((post) => <PostCard key={post.id} post={post} />)
            )}
          </div>
        </main>

        {/* Sidebar */}
        <aside className="hidden lg:block w-80 shrink-0">
          <div className="sticky top-20 space-y-4">
            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Posts</span>
                  <span className="font-semibold">{totalPosts || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Comments</span>
                  <span className="font-semibold">{totalComments || 0}</span>
                </div>
              </CardContent>
            </Card>

            {/* Badges/Expertise */}
            {profile.expertise && profile.expertise.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Expertise</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profile.expertise.map((exp: string, idx: number) => (
                      <Badge key={idx} variant="secondary">
                        {exp}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
