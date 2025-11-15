import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Building2, MapPin, CheckCircle2 } from 'lucide-react'

export default async function CompaniesPage() {
  const supabase = await createClient()

  // Fetch companies
  const { data: companies } = await supabase
    .from('companies')
    .select('*')
    .order('name', { ascending: true })

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex gap-6">
        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Verified Insurance Companies</h1>
            <p className="text-muted-foreground">
              Browse our directory of verified yacht insurance providers and brokers
            </p>
          </div>

          {/* Companies Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {companies && companies.length > 0 ? (
              companies.map((company) => (
                <Card key={company.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                        <CardTitle className="text-lg">{company.name}</CardTitle>
                      </div>
                      {company.verified && (
                        <Badge variant="default" className="gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {company.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {company.description}
                      </p>
                    )}

                    {company.location && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {company.location}
                      </div>
                    )}

                    <div className="flex gap-2">
                      {company.website && (
                        <Button variant="outline" size="sm" asChild className="flex-1">
                          <a
                            href={company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Visit Website
                          </a>
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/posts?company=${company.id}`}>
                          View Posts
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  No companies listed yet.
                </p>
              </div>
            )}
          </div>
        </main>

        {/* Sidebar */}
        <aside className="hidden lg:block w-80 shrink-0">
          <div className="sticky top-20 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">About Verified Companies</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-muted-foreground">
                  All companies listed here have been verified by our team to ensure
                  they are legitimate yacht insurance providers.
                </p>
                <div className="pt-2">
                  <Badge variant="default" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    This badge indicates the company has been verified
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Looking for Coverage?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-muted-foreground">
                  Ask the community for recommendations and experiences with
                  different insurance providers.
                </p>
                <Button asChild className="w-full" size="sm">
                  <Link href="/posts/new">Ask for Recommendations</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Company Directory Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Companies</span>
                  <span className="font-semibold">{companies?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Verified</span>
                  <span className="font-semibold">
                    {companies?.filter(c => c.verified).length || 0}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </aside>
      </div>
    </div>
  )
}
