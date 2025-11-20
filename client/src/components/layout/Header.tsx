'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Anchor, Search, Bell, Menu, Award, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface UserProfile {
  id: string
  username: string | null
  email: string
  avatar_url: string | null
  reputation: number
}

export function Header() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const supabase = createClient()

    // Check initial auth state
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        setIsAuthenticated(true)

        // Fetch user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profile) {
          setUserProfile({
            id: user.id,
            username: profile.username,
            email: user.email || '',
            avatar_url: profile.avatar_url,
            reputation: profile.reputation || 0,
          })
        }
      } else {
        setIsAuthenticated(false)
        setUserProfile(null)
      }

      setIsLoading(false)
    }

    checkAuth()

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setIsAuthenticated(true)
        checkAuth()
      } else {
        setIsAuthenticated(false)
        setUserProfile(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const getInitials = () => {
    if (userProfile?.username) {
      return userProfile.username
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return userProfile?.email?.[0]?.toUpperCase() || 'U'
  }

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/posts?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95  supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 shrink-0">
            <Anchor className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg hidden sm:inline">MyYachtsInsurance</span>
            <span className="font-bold text-lg sm:hidden">MYI</span>
          </Link>

          {/* Main Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link href="/posts">
              <Button variant="ghost" size="sm">
                Questions
              </Button>
            </Link>
            <Link href="/categories">
              <Button variant="ghost" size="sm">
                Categories
              </Button>
            </Link>
            <Link href="/companies">
              <Button variant="ghost" size="sm">
                Companies
              </Button>
            </Link>
            <Link href="/faq">
              <Button variant="ghost" size="sm">
                FAQ
              </Button>
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search questions..."
                  className="pl-10 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                />
              </div>
            </form>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {!isLoading && isAuthenticated && userProfile ? (
              <>
                <Button variant="default" size="sm" asChild className="hidden sm:flex">
                  <Link href="/posts/new">Ask Question</Link>
                </Button>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                    3
                  </span>
                </Button>
                <Link href="/profile" className="flex items-center gap-2 hover:bg-accent p-1.5 rounded">
                  {userProfile.avatar_url ? (
                    <img
                      src={userProfile.avatar_url}
                      alt={userProfile.username || 'User'}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-semibold text-sm">
                      {getInitials()}
                    </div>
                  )}
                  <div className="hidden lg:flex flex-col items-start">
                    <span className="text-sm font-medium leading-none">
                      {userProfile.username || userProfile.email}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Award className="h-3 w-3" />
                      <span>{userProfile.reputation.toLocaleString()}</span>
                    </div>
                  </div>
                </Link>
              </>
            ) : !isLoading ? (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Log in</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/signup">Sign up</Link>
                </Button>
              </>
            ) : null}

            {/* Mobile menu */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Menu Panel */}
          <div className="fixed right-0 top-0 bottom-0 w-64 bg-background border-l z-50 md:hidden">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <span className="font-bold">Menu</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Navigation Links */}
              <nav className="flex flex-col p-4 space-y-2">
                <Link href="/posts" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    Questions
                  </Button>
                </Link>
                <Link href="/categories" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    Categories
                  </Button>
                </Link>
                <Link href="/companies" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    Companies
                  </Button>
                </Link>
                <Link href="/faq" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    FAQ
                  </Button>
                </Link>

                {/* Mobile-only Ask Question button */}
                {!isLoading && isAuthenticated && (
                  <Link href="/posts/new" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full">
                      Ask Question
                    </Button>
                  </Link>
                )}
              </nav>

              {/* User Info or Auth Buttons */}
              <div className="mt-auto p-4 border-t">
                {!isLoading && isAuthenticated && userProfile ? (
                  <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="flex items-center gap-3 p-2 hover:bg-accent rounded">
                      {userProfile.avatar_url ? (
                        <img
                          src={userProfile.avatar_url}
                          alt={userProfile.username || 'User'}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-semibold">
                          {getInitials()}
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {userProfile.username || userProfile.email}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Award className="h-3 w-3" />
                          <span>{userProfile.reputation.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ) : !isLoading ? (
                  <div className="space-y-2">
                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full">
                        Log in
                      </Button>
                    </Link>
                    <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button className="w-full">
                        Sign up
                      </Button>
                    </Link>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  )
}
