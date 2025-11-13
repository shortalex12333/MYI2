import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, TrendingUp, Shield, Users } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center py-12 md:py-20">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Yacht Insurance Community
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Share experiences, ask questions, and connect with yacht owners, brokers, and insurers in the world's first dedicated yacht insurance platform.
        </p>
        <div className="flex justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/signup">Get Started</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/posts">Browse Posts</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card>
          <CardHeader>
            <MessageSquare className="h-10 w-10 text-primary mb-2" />
            <CardTitle>Community Forum</CardTitle>
            <CardDescription>
              Share experiences and get answers from fellow yacht owners
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <TrendingUp className="h-10 w-10 text-primary mb-2" />
            <CardTitle>Insurance Insights</CardTitle>
            <CardDescription>
              Access real-world claims data and premium trends
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <Shield className="h-10 w-10 text-primary mb-2" />
            <CardTitle>Verified Providers</CardTitle>
            <CardDescription>
              Connect with verified insurers and brokers
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <Users className="h-10 w-10 text-primary mb-2" />
            <CardTitle>Expert Network</CardTitle>
            <CardDescription>
              Learn from experienced captains and yacht owners
            </CardDescription>
          </CardHeader>
        </Card>
      </section>

      {/* Popular Categories */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Popular Topics</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { name: 'Claims', slug: 'claims', count: '1,234', description: 'Insurance claims discussions and experiences' },
            { name: 'Policies', slug: 'policies', count: '892', description: 'Policy coverage and recommendations' },
            { name: 'Regulations', slug: 'regulations', count: '567', description: 'Maritime regulations and compliance' },
            { name: 'Maintenance', slug: 'maintenance', count: '445', description: 'Yacht maintenance best practices' },
            { name: 'Safety', slug: 'safety', count: '389', description: 'Safety equipment and procedures' },
            { name: 'General', slug: 'general', count: '678', description: 'General yacht insurance discussions' },
          ].map((category) => (
            <Link href={`/category/${category.slug}`} key={category.slug}>
              <Card className="hover:border-primary transition-colors cursor-pointer">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-xl">{category.name}</CardTitle>
                    <Badge variant="secondary">{category.count} posts</Badge>
                  </div>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-muted rounded-lg p-8 md:p-12 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to join the community?</h2>
        <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
          Create your profile, share your yacht details, and start engaging with the world's largest yacht insurance community.
        </p>
        <Button size="lg" asChild>
          <Link href="/signup">Create Your Account</Link>
        </Button>
      </section>
    </div>
  )
}
