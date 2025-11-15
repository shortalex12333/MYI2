'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Anchor, Search, Bell, Menu, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

export function Header() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const userReputation = 1247 // This would come from auth context

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/posts?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-maritime-gold/10 bg-maritime-navy/95 backdrop-blur supports-[backdrop-filter]:bg-maritime-navy/90 shadow-lg shadow-black/5">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo - Premium Maritime Brand */}
          <Link href="/" className="flex items-center space-x-2.5 shrink-0 group">
            <div className="p-1.5 rounded-lg bg-maritime-gold/10 group-hover:bg-maritime-gold/20 transition-colors">
              <Anchor className="h-5 w-5 text-maritime-gold" />
            </div>
            <span className="font-bold text-lg tracking-tight hidden sm:inline bg-gradient-to-r from-maritime-cream to-maritime-gold bg-clip-text text-transparent">
              MyYachtsInsurance
            </span>
            <span className="font-bold text-lg sm:hidden text-maritime-gold">MYI</span>
          </Link>

          {/* Main Navigation - Premium Maritime Style */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link href="/posts">
              <Button variant="ghost" size="sm" className="text-maritime-cream/80 hover:text-maritime-gold hover:bg-maritime-gold/10">
                Questions
              </Button>
            </Link>
            <Link href="/categories">
              <Button variant="ghost" size="sm" className="text-maritime-cream/80 hover:text-maritime-gold hover:bg-maritime-gold/10">
                Categories
              </Button>
            </Link>
            <Link href="/companies">
              <Button variant="ghost" size="sm" className="text-maritime-cream/80 hover:text-maritime-gold hover:bg-maritime-gold/10">
                Companies
              </Button>
            </Link>
            <Link href="/faq">
              <Button variant="ghost" size="sm" className="text-maritime-cream/80 hover:text-maritime-gold hover:bg-maritime-gold/10">
                FAQ
              </Button>
            </Link>
          </nav>

          {/* Search Bar - Maritime Premium */}
          <div className="flex-1 max-w-2xl">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-maritime-gold/50" />
              <Input
                type="search"
                placeholder="Search questions..."
                className="pl-10 w-full bg-maritime-navy-light/50 border-maritime-gold/20 text-maritime-cream placeholder:text-maritime-cream/40 focus:border-maritime-gold/50 focus:ring-maritime-gold/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>

          {/* Right Side Actions - Premium Maritime */}
          <div className="flex items-center gap-3 shrink-0">
            {isAuthenticated ? (
              <>
                <Button
                  size="sm"
                  asChild
                  className="hidden sm:flex bg-maritime-gold hover:bg-maritime-gold-light text-maritime-navy font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  <Link href="/posts/new">Ask Question</Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative text-maritime-cream hover:text-maritime-gold hover:bg-maritime-gold/10"
                  onClick={() => router.push('/notifications')}
                  title="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-maritime-gold text-[10px] font-bold text-maritime-navy flex items-center justify-center">
                    3
                  </span>
                </Button>
                <Link href="/profile" className="flex items-center gap-2 hover:bg-maritime-gold/10 p-1.5 rounded-lg transition-colors">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-maritime-gold to-maritime-gold-light ring-2 ring-maritime-gold/30 flex items-center justify-center text-maritime-navy font-semibold text-sm">
                    JD
                  </div>
                  <div className="hidden lg:flex flex-col items-start">
                    <span className="text-sm font-medium leading-none text-maritime-cream">John Doe</span>
                    <div className="flex items-center gap-1 text-xs text-maritime-gold/70">
                      <Award className="h-3 w-3" />
                      <span>{userReputation.toLocaleString()}</span>
                    </div>
                  </div>
                </Link>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild className="text-maritime-cream hover:text-maritime-gold hover:bg-maritime-gold/10">
                  <Link href="/login">Log in</Link>
                </Button>
                <Button size="sm" asChild className="bg-maritime-gold hover:bg-maritime-gold-light text-maritime-navy font-semibold">
                  <Link href="/signup">Sign up</Link>
                </Button>
              </>
            )}

            {/* Mobile menu */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-maritime-cream hover:text-maritime-gold hover:bg-maritime-gold/10"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              title="Menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu - Premium Maritime */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-maritime-gold/10 py-4 space-y-2 bg-maritime-navy-light/50">
            <Link href="/posts" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start text-maritime-cream hover:text-maritime-gold hover:bg-maritime-gold/10">
                Questions
              </Button>
            </Link>
            <Link href="/categories" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start text-maritime-cream hover:text-maritime-gold hover:bg-maritime-gold/10">
                Categories
              </Button>
            </Link>
            <Link href="/companies" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start text-maritime-cream hover:text-maritime-gold hover:bg-maritime-gold/10">
                Companies
              </Button>
            </Link>
            <Link href="/faq" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start text-maritime-cream hover:text-maritime-gold hover:bg-maritime-gold/10">
                FAQ
              </Button>
            </Link>
            {isAuthenticated && (
              <Link href="/posts/new" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-maritime-gold hover:bg-maritime-gold-light text-maritime-navy font-semibold">
                  Ask Question
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
