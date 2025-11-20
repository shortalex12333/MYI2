import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Award, Ship, Calendar, Mail, Edit } from 'lucide-react'
import Link from 'next/link'

export default async function ProfilePage() {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Get profile data
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get user's vessels
  const { data: vessels } = await supabase
    .from('vessels')
    .select('*')
    .eq('owner_id', user.id)

  // Get user's posts
  const { data: posts } = await supabase
    .from('posts')
    .select('id, title, created_at, score, comments_count')
    .eq('author_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const initials = profile?.username
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase() || user.email?.[0].toUpperCase() || 'U'

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold mb-1">{profile?.username || 'User'}</h1>
                    <div className="flex items-center gap-2 text-muted-foreground mb-4">
                      <Mail className="h-4 w-4" />
                      <span className="text-sm">{user.email}</span>
                    </div>
                  </div>
                  <Link href="/profile/edit">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </Link>
                </div>

                {profile?.bio && (
                  <p className="text-muted-foreground mb-4">{profile.bio}</p>
                )}

                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-semibold">{profile?.reputation || 0}</div>
                      <div className="text-xs text-muted-foreground">Reputation</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Ship className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-semibold">{vessels?.length || 0}</div>
                      <div className="text-xs text-muted-foreground">Vessels</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-semibold">
                        {new Date(user.created_at || '').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </div>
                      <div className="text-xs text-muted-foreground">Member since</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vessels */}
        {vessels && vessels.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>My Vessels</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vessels.map((vessel: any) => (
                  <div key={vessel.id} className="flex items-start justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{vessel.name}</h3>
                      <div className="text-sm text-muted-foreground space-y-1 mt-1">
                        <div>{vessel.type} • {vessel.length_ft}ft</div>
                        {vessel.year_built && <div>Built: {vessel.year_built}</div>}
                        {vessel.home_port && <div>Home Port: {vessel.home_port}</div>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Activity */}
        {posts && posts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {posts.map((post: any) => (
                  <Link key={post.id} href={`/posts/${post.id}`}>
                    <div className="p-4 border rounded-lg hover:bg-accent transition-colors">
                      <h3 className="font-semibold mb-2">{post.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                        <span>{post.score} points</span>
                        <span>{post.comments_count || 0} comments</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
